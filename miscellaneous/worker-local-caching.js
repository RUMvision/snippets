/*
A (Cloudflare) worker script to cache files on the edge.
Inspired by https://chrisleverseo.com/t/how-to-cache-a-third-party-script-using-a-cloudflare-worker.188/
In this version, you can create your own mapping between external resources and desired local paths. 
*/addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Helper function to conditionally log based on environment
function consoleLog(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);

  // File mappings with optional cache and content type settings
  const fileMapping = {
    '/web-vitals.js': {
      externalUrl: 'https://unpkg.com/web-vitals@3.5.2/dist/web-vitals.attribution.js?module',
      cacheDuration: 86400, // Cache for 24 hours
      contentType: 'application/javascript'
    },
    '/rum.js': {
      externalUrl: 'https://d5yoctgpv4cpx.cloudfront.net/RUM-CODE/yourdomain.com.json',
      cacheDuration: 86400, // Cache for 24 hours
      contentType: 'application/javascript'
    }
  };


  const mapping = fileMapping[url.pathname];
  if (!mapping) {
    // Return early if no mapping exists
	return fetch(request);
  }

  // Create the headers object directly with resolved cache duration and content type
  const cacheDuration = mapping.cacheDuration || ( 3600 * 24 ); // 24 hours
  const headers = {
    'Content-Type': mapping.contentType || 'application/octet-stream',
    'Cache-Control': `max-age=${cacheDuration}, s-maxage=${cacheDuration}, stale-while-revalidate=86400`
  };

  // Use Cloudflare's cache storage
  let cache = caches.default;
  let cachedResponse = await cache.match(request);

  if (cachedResponse) {
    consoleLog(`Serving cached ${url.pathname} from Cloudflare`);
    return new Response(cachedResponse.body, { headers });
  }

  try {
    const fetchResponse = await fetch(mapping.externalUrl);
    if (!fetchResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch', details: `Could not fetch ${url.pathname} from ${mapping.externalUrl}` }), { 
        status: fetchResponse.status, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    consoleLog(`Caching the new ${url.pathname} file from ${mapping.externalUrl}`);
    await cache.put(request, fetchResponse.clone());

    return new Response(fetchResponse.body, {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers
    });
  } catch (error) {
    consoleLog(`Error processing request for ${url.pathname}:`, error);
    return new Response(JSON.stringify({ error: 'Processing Error', details: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}