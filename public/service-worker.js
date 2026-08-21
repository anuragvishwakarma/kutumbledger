// Service Worker for KutumbLedger PWA
// Precaching and runtime caching for offline functionality

const CACHE_NAME = 'kutumbledger-v1';
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/dashboard/transactions',
  '/dashboard/transactions/add',
  '/dashboard/family',
  '/dashboard/family/members',
  '/dashboard/family/settings',
  '/dashboard/helpers',
  '/dashboard/festival',
  '/dashboard/udhaar',
  '/dashboard/jars',
  '/auth/login',
  '/auth/verify-otp',
  '/manifest.json',
  // Add any other critical assets
];

// Install service worker and precache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like to Supabase)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Clone the request because it's a one-time use
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((networkResponse) => {
        // Check if we got a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response because it's a one-time use and we need to cache it
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // If both cache and network fail, return a fallback page
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// Background sync for sending queued transactions to server when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Function to sync transactions with server
async function syncTransactions() {
  // In a real implementation, we would:
  // 1. Open IndexedDB
  // 2. Get unsynced transactions
  // 3. Send them to Supabase server
  // 4. Mark them as synced on success

  // For demo purposes, we'll just log
  console.log('Background sync triggered for transactions');

  // TODO: Implement actual sync logic
  // This would involve:
  // - Opening IndexedDB via idb
  // - Getting transactions where syncedAt is null
  // - Sending them to Supabase REST API or using supabase-js
  // - On success, updating the transactions with syncedAt timestamp
  // - On failure, incrementing retry count and possibly showing notification
}

// Listen for messages from clients (e.g., to trigger sync)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    syncTransactions().then(() => {
      // Optional: notify clients that sync completed
      event.ports[0]?.postMessage({ type: 'SYNC_COMPLETED' });
    });
  }
});