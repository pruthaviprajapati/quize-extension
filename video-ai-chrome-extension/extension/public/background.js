// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Video AI Extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'VIDEO_ENDED') {
    console.log('Video ended on:', request.data);
    // Store or process video metadata if needed
  }
  return true;
});

// Handle opening dashboard - reuse existing tab if available
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_DASHBOARD') {
    const dashboardUrl = 'http://localhost:3000';
    
    // Search for existing dashboard tab
    chrome.tabs.query({}, (tabs) => {
      const existingTab = tabs.find(tab => 
        tab.url && (tab.url.startsWith(dashboardUrl) || tab.url.includes('localhost:3000'))
      );
      
      if (existingTab) {
        // Focus on existing tab
        chrome.tabs.update(existingTab.id, { active: true }, () => {
          chrome.windows.update(existingTab.windowId, { focused: true });
          sendResponse({ success: true, reused: true });
        });
      } else {
        // Create new tab
        chrome.tabs.create({ url: dashboardUrl }, (tab) => {
          sendResponse({ success: true, reused: false });
        });
      }
    });
    
    return true; // Will respond asynchronously
  }
});

// API proxy: perform network requests on behalf of page/extension to avoid mixed-content/CORS issues
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'API_REQUEST') {
    const { method = 'GET', path = '/', body } = request;
    const baseHosts = ['localhost', '127.0.0.1'];

    // Helper to perform fetch and respond
    const doFetch = async (host) => {
      const url = `http://${host}:5000/api${path}`;
      console.log('[Background] API_REQUEST', method, url);
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch (e) { data = text; }

        console.log('[Background] fetch result', { url, status: res.status, ok: res.ok });
        sendResponse({ ok: res.ok, status: res.status, data });
        return true;
      } catch (err) {
        console.error('[Background] fetch error for', url, err && err.stack ? err.stack : err);
        return false;
      }
    };

    // Try hosts sequentially (localhost then 127.0.0.1)
    (async () => {
      for (const host of baseHosts) {
        const success = await doFetch(host);
        if (success) return; // sendResponse already called
      }
      // If none succeeded, send an error response
      sendResponse({ ok: false, error: 'Background fetch failed for all hosts' });
    })();

    // Indicate we'll call sendResponse asynchronously
    return true;
  }
});
