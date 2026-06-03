// Service Worker — Designações Cong. Parque Tietê
const CACHE = 'designacoes-v1';
const STATIC = [
  './',
  './index.html',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(STATIC).catch(function() {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Firebase: sempre network-first
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Demais: cache-first com fallback para network
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var network = fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          caches.open(CACHE).then(function(cache){ cache.put(e.request, resp.clone()); });
        }
        return resp;
      });
      return cached || network;
    })
  );
});

// Push notifications
self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data.json(); } catch(err) { data = { title: 'Designações', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Designações', {
      body: data.body || '',
      icon: data.icon || '',
      badge: data.badge || '',
      data: data.url || '/',
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data || '/'));
});
