const CACHE_NAME = 'stage-time-toolkit-v2'; // バージョンを上げると更新が反映されます
const urlsToCache = [
  './',
  'index.html',
  'manifest.json', // ← これもキャッシュに必須です
  'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
  'https://npmcdn.com/flatpickr/dist/themes/dark.css',
  'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js' // ← 末尾を明確に指定
];

// インストール
self.addEventListener('install', (event) => {
  // skipWaitingをいれることで、新しいSWを即座に有効化させます
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティベート（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      // クライアントを制御下に置く
      return self.clients.claim();
    })()
  );
});

// フェッチ（オフライン対応の要）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあれば返す
      if (response) {
        return response;
      }
      // なければネットワークから取得を試みる
      return fetch(event.request).catch(() => {
        // ネットワークもダメ（オフライン）で、HTMLリクエストならTOPを返すなどの処理も可能
      });
    })
  );
});
