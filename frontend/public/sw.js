const CACHE_NAME = "edubridge-ui-v1";

const urlsToCache = [
  "/",
  "/index.html"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          return caches.match("/index.html");
        })
      );
    })
  );

});