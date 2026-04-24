const CACHE_NAME = 'routine-2a-v1';
const ASSETS = ['./index.html', './manifest.json'];

// Install
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Fetch (offline support)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Push notification
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Routine 2A', body: 'নোটিফিকেশন' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: data
    })
  );
});

// Scheduled notification check (via periodic sync or message)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleTestNotifications(e.data.tests);
  }
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: './icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: e.data.tag || 'routine-notif'
    });
  }
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./index.html');
    })
  );
});

function scheduleTestNotifications(tests) {
  // tests = [{ title, body, timestamp }]
  tests.forEach(t => {
    const delay = t.timestamp - Date.now();
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification(t.title, {
          body: t.body,
          icon: './icons/icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'test-notif-' + t.timestamp
        });
      }, delay);
    }
  });
}
