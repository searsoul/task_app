// Service worker: при наличии сети всегда отдаёт самую свежую версию страницы,
// а в кэш просто откладывает копию на случай, если сети не будет.
const CACHE = "rezervuar-cache-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.open(CACHE).then((cache) => cache.match(event.request)))
  );
});
