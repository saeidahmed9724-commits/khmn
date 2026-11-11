const CACHE_NAME = 'khmn-cache-v1';

// Static essential assets to pre-cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/hidden-card.webp',
  '/art/avatar.webp',
  '/art/bg-living-room.webp',
  '/art/cards-question.webp',
];

// Maximum cached image entries to prevent storage bloat
const MAX_IMAGE_CACHE_ENTRIES = 120;
const IMAGE_CACHE_NAME = 'khmn-images-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore WebSockets, chrome extensions, or non-GET requests
  if (request.method !== 'GET' || url.protocol.startsWith('ws') || url.protocol === 'chrome-extension:') {
    return;
  }

  // 1. Image cache: Stale-While-Revalidate / Cache-First for card pictures and static art
  const isImage =
    request.destination === 'image' ||
    url.pathname.match(/\.(webp|png|jpg|jpeg|svg|gif)$/i) ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('images.pexels.com') ||
    url.hostname.includes('unsplash.com');

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Fetch update in background for next time
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache: fetch and cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for card if network fails
            return caches.match('/hidden-card.webp');
          });
      })
    );
    return;
  }

  // 2. Google Fonts caching
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res && res.status === 200) {
          cache.put(request, res.clone());
        }
        return res;
      })
    );
    return;
  }

  // 3. API requests: Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // 4. Default: Stale-While-Revalidate for app shell files
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
