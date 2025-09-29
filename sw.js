// A more robust service worker for PWA installability and activation.
self.addEventListener('install', () => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  // Tell the active service worker to take immediate control of all of its clients.
  event.waitUntil(self.clients.claim());
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // This is a "network-only" fetch handler. It's simple and avoids caching complexities.
  // It passes the request to the network.
  event.respondWith(fetch(event.request));
});
