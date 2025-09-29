// Basic service worker for PWA installability

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // You can add pre-caching logic here
});

self.addEventListener('fetch', (event) => {
  // For now, just fetch from the network
  event.respondWith(fetch(event.request));
});
