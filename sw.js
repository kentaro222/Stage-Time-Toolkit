const CACHE_NAME = 'stage-time-toolkit-v3'; // バージョンを上げると更新が反映されます

const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'STT-icon-192.png',
  'STT-icon-512.png',
  'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
  'https://npmcdn.com/flatpickr/dist/themes/dark.css',
  'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js' // .jsまで正確に
];

// インストール：ここが失敗すると404の原因になる
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 新しいSWを強制的に有効化
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 一気にaddAllせず、失敗してもログが出るようにする工夫
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => console.error('キャッシュ失敗:', url, err));
        })
      );
    })
  );
});

// アクティベート：古いキャッシュを掃除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

// フェッチ：オフライン時はキャッシュを返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
