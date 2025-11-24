/**
 * B"H
 * service worker
 */
var cacheName = "awtsmoosCash-10";
console.log("Service!!")

var cached = {};
var nm = 0;

//importScripts("https://unpkg.com/@babel/standalone@7.24.4/babel.min.js");

function transpileCode(code) {
    try {
        const transpiledCode = Babel.transform(code, { presets: ['env'] }).code;
        return transpiledCode;
    } catch (error) {
        console.error('Error transpiling code:', error);
        return null;
    }
}

self.addEventListener('fetch', (event) => {
    var url = event.request.url;

    var shouldNotCache = (
        !url.includes("oyvedEdom") ||
        !url.includes("firebasestorage") || // Do not cache if it's not a Firebase storage asset
        (url.includes("firebasestorage")
        && url.includes("%2Findexes%2F")) // Do not cache if it's a Firebase storage asset in the "indexes" folder
    );
    
    if(!shouldNotCache) {
        event.respondWith(
            caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    cached[Date.now() + "_" + (nm++)] = cachedResponse;
                    return cachedResponse;
                }

                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(async (response) => {
                    if (!response || response.status !== 200) {
                        return response;
                    }


                    // Cache the response for non-JavaScript content
                    var responseToCache = response.clone();
                    var cache = await caches.open(cacheName);
                    cache.put(event.request, responseToCache);

                    return response;
                });
            })
        );
    }
});

self.addEventListener('activate', (event) => {
    clients.claim();
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== cacheName) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
