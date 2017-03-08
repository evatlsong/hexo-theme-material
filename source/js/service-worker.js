var cacheName = 'devlab-service-worker-v2.6';
var filesToCache = [
  '/',
    '/img/favicon.png',
    '/js/jquery.min.js',
    '/js/queue.js',
    '/js/lazyload.min.js',
    '/js/js.min.js',
    '/js/nprogress.js',
    '/css/material.min.css',
    '/css/style.min.css',
    '/css/duoshuo.min.css',
    '/fonts/MaterialIcons-Regular.woff2',
    '/2017/03/08/samba/'
];
console.log(self);
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        console.log('[ServiceWorker] Removing old cache', key);
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {

  var extendDataUrl = [
    '/api/requestcount.php',
    '/api/openapi.php'
  ];

  // var allDataUrl = extendDataUrl.concat(filesToCache);
  var allDataUrl = extendDataUrl;
  var requestIsDataApi = false;

  //如果是 API 请求，先网络后缓存
  for (count in extendDataUrl){
    if (e.request.url.indexOf(extendDataUrl[count]) > -1 ) {
      requestIsDataApi = true;
      e.respondWith(
        fetch(e.request)
        .then(function(response) {
          return caches.open(cacheName).then(function(cache){
            cache.put(e.request.url, response.clone());
            return response;
          });
        })
        .catch(function(){
          return caches.match(e.request.url);
        })
      );
      break;
    }
  }

  //一般资源请求，先缓存再网络再默认
  if (!requestIsDataApi){
    e.respondWith(
      caches.match(e.request).then(function(respond){
        return respond || fetch(e.request)
          .then(function(res){
            return caches.open(cacheName).then(function(cache){
              cache.put(e.request.url, res.clone());
              return res;
            });
          })
          .catch(function(){
            return caches.match('offline.html');
          });
      })
    )
  }

});
