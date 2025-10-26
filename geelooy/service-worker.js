/**
 * B"H
 */

const CACHE_NAME = 'awtsmoos';

console.log("Service Worker loading!");

self.addEventListener('install', (event) => {
  console.log('Service Worker: I am being installed!');
  // You can pre-cache essential assets here if needed,
  // but the fetch event will cache everything dynamically.
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: I am now active!');
  // This is a good place to clean up old caches.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
        	
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
          
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      try {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If we get a valid response, we clone it and store it in the cache.
          if (networkResponse && networkResponse.status === 200) {
            try {
            cache.put(event.request, networkResponse.clone());
            } catch(e){}
          
          }
          return networkResponse;
        });

        // Return the cached response if it exists, otherwise wait for the network response.
        return cachedResponse || fetchPromise;
      });
      } catch(e) {
      
      }
    })
  );
});