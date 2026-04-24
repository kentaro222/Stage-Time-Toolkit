// バージョン管理。ファイルを更新した際は必ずここを書き換えてください。
const CACHE_NAME = 'stage-time-toolkit-v6';

// キャッシュするアセットのリスト。index.html内での呼び出しパスと完全に一致させています。
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'STT-icon-192.png',
  'STT-icon-512.png',
  'flatpickr.min.css',
  'dark.css',
  'flatpickr.min.js'
];

// インストール：必要なファイルをすべてキャッシュに保存
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティベート：古いバージョンのキャッシュを自動削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチ（Stale-While-Revalidate戦略）：
// 1. まずキャッシュがあれば即座にそれを返す（オフラインでも即起動）
// 2. 同時に裏側でネットワークから最新版を取得し、キャッシュを更新する
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 正常なレスポンスが得られたらキャッシュを更新
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // オフライン時は何もしない（cachedResponseがあればそれが返る）
      });

      return cachedResponse || fetchPromise;
    })
  );
});
