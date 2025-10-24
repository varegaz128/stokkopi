self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("stok-cache-v1").then((cache) => {
      return cache.addAll(["/", "/index.html", "/app.js"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
