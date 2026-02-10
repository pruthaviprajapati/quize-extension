// The page (overlay) cannot reliably call http://localhost:5000 when running on an https page
// because browsers block active mixed content. Instead we forward requests to the content script
// which relays them to the extension background service worker. The background performs the
// actual fetch to the backend (http://localhost:5000) and returns the response.

const PROXY_TIMEOUT = 30000; // ms

function uniqueId() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Generate content (quiz or Q&A)
 * @param {Object} data - Video metadata and content type
 * @returns {Promise<Object>} Generated content
 */
export function generateContent(data) {
  return apiProxyRequest({ method: 'POST', path: '/generate', body: data });
}

/**
 * Get history list
 * @param {string} filter - Filter type: 'all', 'quiz', 'qa'
 * @returns {Promise<Array>} History items
 */
export function getHistory(filter = 'all') {
  const path = filter === 'all' ? '/history' : `/history?type=${filter}`;
  return apiProxyRequest({ method: 'GET', path });
}

/**
 * Get content by ID
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Full content details
 */
export function getContentById(contentId) {
  return apiProxyRequest({ method: 'GET', path: `/history/${contentId}` });
}

// Proxy implementation: send a window.postMessage that the content script listens for.
function apiProxyRequest({ method = 'GET', path = '/', body } = {}) {
  const id = uniqueId();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', onMessage);
      reject(new Error('API proxy timeout'));
    }, PROXY_TIMEOUT);

    function onMessage(event) {
      if (event.source !== window) return;
      const msg = event.data;
      if (!msg || msg.type !== 'VIDEO_AI_API_RESPONSE' || msg.id !== id) return;
      clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      const resp = msg.response || msg.response === undefined ? msg.response : msg;
      // Response shape from background: { ok, status, data } or { ok: false, error }
      if (resp && resp.ok) {
        resolve(resp.data);
      } else if (resp && resp.error) {
        reject(new Error(resp.error));
      } else {
        reject(new Error('Unknown API proxy response'));
      }
    }

    window.addEventListener('message', onMessage);
    // Send request to content script
    console.log('[API] Proxy request', { id, method, path });
    window.postMessage({ type: 'VIDEO_AI_API_REQUEST', id, method, path, body }, '*');
  });
}
