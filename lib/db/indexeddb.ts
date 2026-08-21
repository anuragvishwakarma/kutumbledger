import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Transaction type definition
export interface Transaction {
  id: string;
  family_id: string;
  member_id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description?: string;
  date: string;
  payment_method: 'upi' | 'cash' | 'card' | 'bank' | 'other';
  is_recurring?: boolean;
  recurrence_rule?: string;
  local_timestamp: number;
  syncedAt?: string | null;
  is_cash?: boolean;
  is_private?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Sync queue item type
export interface SyncQueueItem {
  id: string;
  tableName: string;
  operation: 'insert' | 'update' | 'delete';
  data: Transaction;
  createdAt: number;
  retryCount: number;
}

// Use 'any' for DB to avoid DBSchema complexity - the runtime schema is defined in openDB upgrade
type DB = any;

let dbPromise: Promise<IDBPDatabase<DB>> | null = null;

async function getDB(): Promise<IDBPDatabase<DB>> {
  if (!dbPromise) {
    dbPromise = openDB<DB>('KutumbLedgerDB', 1, {
      upgrade(db) {
        const txnStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txnStore.createIndex('by-date', 'date');
        txnStore.createIndex('by-synced', 'syncedAt');

        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-table', 'tableName');
        syncStore.createIndex('by-retry', 'retryCount');
      },
    });
  }
  return dbPromise;
}

// Export getDB for use by syncQueue
export { getDB };

// Sync Queue Functions
export async function addToSyncQueue(
  tableName: string,
  operation: 'insert' | 'update' | 'delete',
  data: Transaction
): Promise<void> {
  const db = await getDB();
  const syncData: SyncQueueItem = {
    id: crypto.randomUUID(),
    tableName,
    operation,
    data: {
      ...data,
      localTimestamp: Date.now(),
    } as Transaction,
    createdAt: Date.now(),
    retryCount: 0,
  };
  await db.put('syncQueue', syncData);
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll('syncQueue');
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function incrementSyncRetry(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', { ...item, retryCount: item.retryCount + 1 });
  }
}

// Transaction functions
export async function addTransaction(txn: Transaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', txn);

  // Add to sync queue for background sync when online
  await addToSyncQueue('transactions', 'insert', {
    ...txn,
    syncedAt: undefined,
  });
}

export async function updateTransaction(txn: Transaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', { ...txn, updatedAt: new Date().toISOString() });

  // Add to sync queue for background sync when online
  await addToSyncQueue('transactions', 'update', {
    ...txn,
    syncedAt: undefined,
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);

  // Add to sync queue for background sync when online
  await addToSyncQueue('transactions', 'delete', {
    id,
    syncedAt: undefined,
  } as Transaction);
}

// Function to mark transactions as synced (called after successful server sync)
export async function markTransactionAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const txn = await db.get('transactions', id);
  if (txn) {
    await db.put('transactions', { ...txn, syncedAt: new Date().toISOString() });
    // Remove from sync queue
    await removeSyncItem(id);
  }
}

// Function to get unsynced transactions
export async function getUnsyncedTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAllFromIndex('transactions', 'by-synced', undefined);
}

// Function to process sync queue (called by service worker or manually)
export async function processSyncQueue(): Promise<void> {
  const pendingItems = await getPendingSyncItems();

  for (const item of pendingItems) {
    try {
      // In a real implementation, we would send the data to Supabase server
      // For now, we'll just simulate success and mark as synced

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mark item as synced based on operation and table
      if (item.tableName === 'transactions') {
        if (item.operation === 'insert' || item.operation === 'update') {
          const txn = item.data as Transaction;
          await markTransactionAsSynced(txn.id);
        } else if (item.operation === 'delete') {
          await removeSyncItem(item.data.id as string);
          // Also delete from local storage if needed
          const db = await getDB();
          await db.delete('transactions', item.data.id as string);
        }
      }
      // Add similar logic for other tables as needed

      // Increment retry count on failure (not needed in this simulation)
      // await incrementSyncRetry(item.id);
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
      await incrementSyncRetry(item.id);
      // If max retries reached, we might want to notify user
    }
  }
}