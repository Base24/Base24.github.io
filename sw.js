const CACHE = "Base24";
const precacheFiles = ["/css/main.css","/css/settings.css","/fonts/Fascinate.woff2","/fonts/Kavivanar.woff2","/images/page/browsers/browser.png","/images/page/browsers/chrome.png","/images/page/browsers/chromium.png","/images/page/browsers/firefox.png","/images/page/browsers/ie.png","/images/page/browsers/ms-edge.png","/images/page/browsers/safari.png","/images/page/browsers/tor.png","/images/page/name.png","/scripts/navbar.js","/scripts/script.js","/scripts/settings.js","/index.html","/styles.html","/builder.html","/readme.html",
];

/**
 * Check to see if the request is in the cache
 *
 * Return response
 *
 * If not in the cache, then return
 *
 * @param {RequestInfo} request
 * @return {Promise} promise
 */
function fromCache(request) {
	return caches.open(CACHE).then(function(cache) {
		return cache.match(request).then(function(matching) {
			if (!matching || matching.status === 404) {
				return Promise.reject("no-match");
			}
			return matching;
		});
	});
}

/**
 * Update the cache
 * @param {RequestInfo} request
 * @param {Response} response
 * @return {Promise} promise
 */
function updateCache(request, response) {
	return caches.open(CACHE).then(function(cache) {
		return cache.put(request, response);
	});
}


self.addEventListener("install", function(event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE).then(function(cache) {
			return cache.addAll(precacheFiles);
		}),
	);
});

// Allow sw to control of current page
self.addEventListener("activate", function(event) {
	event.waitUntil(self.clients.claim());
});


// If any fetch fails, it will look for the request in the cache and serve it
// from there first
self.addEventListener("fetch", function(event) {
	if (event.request.method !== "GET") {
		return;
	}
	event.respondWith(
		fromCache(event.request).then(
			function(response) {
				// The response was found in the cache so we respond with it and
				// update the entry
				// This is where we call the server to get the newest version of the
				// file to use the next time we show view
				event.waitUntil(
					fetch(event.request).then(function(response) {
						return updateCache(event.request, response);
					}),
				);
				return response;
			},
			function() {
				// The response was not found in the cache so we look for it on
				// the server
				return fetch(event.request)
					.then(function(response) {
						// If request was success, add or update it in the cache
						event.waitUntil(updateCache(event.request, response.clone()));
						return response;
					})
					.catch(function(error) {
					});
			},
		),
	);
});
