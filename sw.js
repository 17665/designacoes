// Service Worker — Designações Cong. Parque Tietê
// IMPORTANTE: a cada atualização do index.html, troque VERSAO abaixo pela mesma versão
// (ex.: 'v2026.10.07'). Isso faz os celulares descartarem o cache antigo.
const VERSAO = 'v2026.10.13';
const CACHE = 'designacoes-' + VERSAO;

// Guardados na instalação para o app abrir mesmo sem internet
const STATIC = [
  './',
  './index.html',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cada item separado: se um falhar, os outros continuam sendo guardados
      return Promise.all(STATIC.map(function(url) {
        return cache.add(url).catch(function() {});
      }));
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

function ehHtml(req, url) {
  if (req.mode === 'navigate') return true;
  var p = url.pathname;
  return p.endsWith('/') || p.endsWith('.html');
}

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Banco de dados e APIs do Google: não passam pelo cache (sempre direto na rede)
  if (url.hostname.indexOf('firebaseio.com') >= 0 || url.hostname.indexOf('googleapis.com') >= 0) return;

  // Scripts do Firebase (URL com versão fixa): cache primeiro, rede como reserva
  if (url.hostname === 'www.gstatic.com') {
    e.respondWith(
      caches.match(req).then(function(cached) {
        return cached || fetch(req).then(function(resp) {
          if (resp && (resp.status === 200 || resp.type === 'opaque')) {
            var copia = resp.clone();
            caches.open(CACHE).then(function(c){ c.put(req, copia); });
          }
          return resp;
        });
      })
    );
    return;
  }

  // Só trata arquivos do próprio site daqui para baixo
  if (url.origin !== self.location.origin) return;

  // Página (index.html): REDE PRIMEIRO, para sempre abrir a versão mais nova.
  // Só usa a cópia guardada se estiver sem internet.
  if (ehHtml(req, url)) {
    e.respondWith(
      fetch(new Request(req.url, { cache: 'no-store', credentials: 'same-origin' })).then(function(resp) {
        if (resp && resp.status === 200 && !url.search) {
          var copia = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(req.mode === 'navigate' ? req : req.url, copia); });
        }
        return resp;
      }).catch(function() {
        return caches.match(req).then(function(c) {
          return c || caches.match('./index.html') || caches.match('./');
        });
      })
    );
    return;
  }

  // Demais arquivos (ícones, manifest): usa o guardado e atualiza em segundo plano
  e.respondWith(
    caches.match(req).then(function(cached) {
      var rede = fetch(req).then(function(resp) {
        if (resp && resp.status === 200) {
          var copia = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copia); });
        }
        return resp;
      }).catch(function() { return cached; });
      return cached || rede;
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
