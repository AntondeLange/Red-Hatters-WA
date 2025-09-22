// Red Hatters WA - Service Worker
// Version 2.0 - Offline Support & Caching

const CACHE_NAME = 'red-hatters-wa-v2.0';
const STATIC_CACHE = 'static-v2.0';
const DYNAMIC_CACHE = 'dynamic-v2.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/about-us.html',
  '/benefits.html',
  '/contact-us.html',
  '/faq.html',
  '/login.html',
  '/register.html',
  '/donate.html',
  '/styles.css',
  '/script.js',
  '/config.js',
  '/manifest.json',
  '/images/RHSWA-horizontal.png',
  '/images/ARHSWA 1.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external API calls
  if (url.origin !== location.origin && !url.hostname.includes('cdnjs.cloudflare.com') && !url.hostname.includes('cdn.jsdelivr.net') && !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        console.log('[SW] Fetching from network:', request.url);
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html') || caches.match('/index.html');
            }
            
            // Return a fallback for other requests
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications (if needed in future)
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from Red Hatters WA',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-144x144.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/images/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Red Hatters WA', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch(submission.url, {
          method: 'POST',
          headers: submission.headers,
          body: submission.body
        });
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingSubmission(submission.id);
          console.log('[SW] Background sync successful for submission:', submission.id);
        }
      } catch (error) {
        console.error('[SW] Background sync failed for submission:', submission.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// IndexedDB functions for offline form storage
async function getPendingSubmissions() {
  // This would integrate with your existing form handling
  // For now, return empty array
  return [];
}

async function removePendingSubmission(id) {
  // This would remove the submission from IndexedDB
  console.log('[SW] Removing pending submission:', id);
}

// Message handler for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker script loaded');
