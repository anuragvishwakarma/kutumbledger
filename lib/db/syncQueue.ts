import { getDB, addToSyncQueue as originalAddToSyncQueue, getPendingSyncItems, removeSyncItem, incrementSyncRetry, Transaction, SyncQueueItem } from './indexeddb';

// Enhanced sync queue with retry logic and conflict resolution
export const SYNC_MAX_RETRIES = 3;
export const SYNC_RETRY_DELAY_MS = 5000; // 5 seconds

// Extended transaction type for sync queue (includes retry metadata)
interface SyncTransaction extends Transaction {
  retryCount: number;
  localTimestamp: number;
}

export async function addToSyncQueue(tableName: string, operation: 'insert' | 'update' | 'delete', data: Transaction): Promise<void> {
  // Add timestamp for conflict resolution
  const syncData = {
    ...data,
    localTimestamp: Date.now(),
    retryCount: 0
  } as SyncTransaction;

  await originalAddToSyncQueue(tableName, operation, syncData);
}

export async function processSyncQueue(): Promise<void> {
  const pendingItems = await getPendingSyncItems();

  for (const item of pendingItems) {
    try {
      // Skip if max retries exceeded
      if ((item.data as SyncTransaction).retryCount >= SYNC_MAX_RETRIES) {
        console.warn(`Sync item ${item.id} exceeded max retries`);
        continue;
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // In a real implementation, send data to Supabase server
      // For now, simulate success and mark as synced
      if (item.tableName === 'transactions') {
        if (item.operation === 'insert' || item.operation === 'update') {
          const txn = item.data as Transaction;
          await markTransactionAsSynced(txn.id);
        } else if (item.operation === 'delete') {
          await removeSyncItem(item.data.id);
          // Also delete from local storage if needed
          const db = await getDB();
          await db.delete('transactions', item.data.id);
        }
      }
      // Add similar logic for other tables as needed

      // Remove item from queue on success
      await removeSyncItem(item.id);
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
      await incrementSyncRetry(item.id);

      // If max retries reached, notify user (in real app)
      const itemData = await getPendingSyncItems();
      const updatedItem = itemData.find(i => i.id === item.id);
      if (updatedItem && (updatedItem.data as SyncTransaction).retryCount >= SYNC_MAX_RETRIES) {
        // Trigger user notification for sync failure
        // This would be implemented with a toast or notification system
        console.warn(`Sync failed permanently for item ${item.id}`);
      }
    }
  }
}

// Helper to get a single pending item by ID
export async function getPendingSyncItemById(id: string): Promise<SyncQueueItem | null> {
  const items = await getPendingSyncItems();
  return items.find(item => item.id === id) ?? null;
}

async function markTransactionAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const txn = await db.get('transactions', id);
  if (txn) {
    await db.put('transactions', { ...txn, syncedAt: new Date().toISOString() });
    // Remove from sync queue
    await removeSyncItem(id);
  }
}