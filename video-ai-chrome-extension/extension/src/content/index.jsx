import { generateVideoIdentifier } from '../utils/hash.js';
import { extractTranscript, extractPageText } from '../utils/transcript.js';
import { getVideoDuration } from '../utils/youtube.js';

// Track processed videos to avoid duplicate listeners
const processedVideos = new WeakSet();

/**
 * Get video source URL
 * @param {HTMLVideoElement} video - Video element
 * @returns {string} Video source URL
 */
function getVideoSrc(video) {
  if (video.currentSrc) {
    return video.currentSrc;
  }
  
  const sourceElement = video.querySelector('source');
  if (sourceElement && sourceElement.src) {
    return sourceElement.src;
  }
  
  return video.src || '';
}

/**
 * Handle video ended event
 * @param {HTMLVideoElement} video - Video element
 */
async function handleVideoEnded(video) {
  try {
    const videoSrc = getVideoSrc(video);
    const pageTitle = document.title;
    const domain = window.location.hostname;
    const pageUrl = window.location.href;
    
    if (!videoSrc) {
      console.warn('No video source found');
      return;
    }

    const videoIdentifier = await generateVideoIdentifier(domain, pageUrl, videoSrc);
    
    // Extract transcript or page text
    const transcript = await extractTranscript(video);
    const pageText = transcript || extractPageText();
    
    // Get video duration in seconds (if available)
    // Try YouTube-specific methods first, then fall back to video.duration
    const videoDuration = await getVideoDuration(video, domain, pageUrl);
    
    const videoData = {
      videoIdentifier,
      pageTitle,
      domain,
      pageUrl,
      videoSrc,
      transcript: pageText,
      videoDuration, // Duration in seconds
    };

    // Log video duration for debugging
    if (videoDuration) {
      const hours = Math.floor(videoDuration / 3600);
      const minutes = Math.floor((videoDuration % 3600) / 60);
      const seconds = videoDuration % 60;
      console.log(`[Video AI] Video duration: ${hours}h ${minutes}m ${seconds}s (${videoDuration} seconds total)`);
      
      // Log expected MCQ count
      let expectedMCQs;
      if (videoDuration < 3600) expectedMCQs = 10;
      else if (videoDuration < 7200) expectedMCQs = 15;
      else if (videoDuration < 10800) expectedMCQs = 20;
      else expectedMCQs = 25;
      console.log(`[Video AI] Expected MCQ count: ${expectedMCQs}`);
    } else {
      console.warn('[Video AI] Video duration not available - will default to 10 MCQs');
    }

    // Show overlay UI
    showOverlay(videoData);
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'VIDEO_ENDED',
      data: videoData,
    });
  } catch (error) {
    console.error('Error handling video ended:', error);
  }
}

/**
 * Show overlay UI for content generation
 * @param {Object} videoData - Video metadata
 */
function showOverlay(videoData) {
  // Check if overlay already exists
  const existing = document.getElementById('video-ai-overlay-root');
  if (existing) {
    existing.remove();
  }

  console.log('Creating overlay with video data:', videoData);

  // Create simple HTML overlay
  const overlayHTML = `
    <div id="video-ai-overlay-root" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🎓</div>
        <h2 style="color: white; margin: 0 0 15px 0; font-size: 28px; font-weight: 600;">
          Generate Learning Content
        </h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 30px 0; font-size: 16px;">
          What would you like to generate from this video?
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="video-ai-quiz-btn" style="
            background: white;
            color: #667eea;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            📝 Quiz (MCQs)
          </button>
          <button id="video-ai-qa-btn" style="
            background: white;
            color: #764ba2;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            💬 Q&A
          </button>
        </div>
        <button id="video-ai-close-btn" style="
          background: transparent;
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 20px;
        ">
          ✕ Close
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // Add event listeners
  document.getElementById('video-ai-quiz-btn').addEventListener('click', () => {
    handleGenerate(videoData, 'quiz');
  });

  document.getElementById('video-ai-qa-btn').addEventListener('click', () => {
    handleGenerate(videoData, 'qa');
  });

  document.getElementById('video-ai-close-btn').addEventListener('click', () => {
    document.getElementById('video-ai-overlay-root').remove();
  });
}

/**
 * Handle content generation
 * @param {Object} videoData - Video metadata
 * @param {string} contentType - 'quiz' or 'qa'
 */
async function handleGenerate(videoData, contentType) {
  const overlay = document.getElementById('video-ai-overlay-root');
  overlay.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
    ">
      <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
      <h3 style="margin: 0 0 10px 0;">Generating ${contentType === 'quiz' ? 'Quiz' : 'Q&A'}...</h3>
      <p style="color: #666; margin: 0;">This may take a moment</p>
    </div>
  `;

  try {
    // Send message to background to make API call
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        method: 'POST',
        path: '/generate',
        body: { ...videoData, contentType },
      }, resolve);
    });

    if (response && response.ok) {
      overlay.innerHTML = `
        <div style="
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
          <h3 style="margin: 0 0 15px 0;">Content Generated!</h3>
          <p style="color: #666; margin: 0 0 20px 0;">
            Your ${contentType === 'quiz' ? 'quiz' : 'Q&A'} has been saved.
          </p>
          <button id="video-ai-view-btn" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 10px;
          ">
            View Dashboard
          </button>
          <button id="video-ai-done-btn" style="
            background: #f0f0f0;
            color: #333;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          ">
            Done
          </button>
        </div>
      `;

      document.getElementById('video-ai-view-btn').addEventListener('click', () => {
        // Send message to background script to open/focus dashboard
        chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' }, (response) => {
          if (response && response.reused) {
            console.log('Switched to existing dashboard tab');
          } else {
            console.log('Opened new dashboard tab');
          }
        });
      });

      document.getElementById('video-ai-done-btn').addEventListener('click', () => {
        overlay.remove();
      });
    } else {
      throw new Error('Failed to generate content');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
        <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Error</h3>
        <p style="color: #666; margin: 0 0 20px 0;">Failed to generate content. Please try again.</p>
        <button id="video-ai-retry-btn" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        ">
          Close
        </button>
      </div>
    `;

    document.getElementById('video-ai-retry-btn').addEventListener('click', () => {
      overlay.remove();
    });
  }
}

/**
 * Attach ended listener to video
 * @param {HTMLVideoElement} video - Video element
 */
function attachVideoListener(video) {
  if (processedVideos.has(video)) {
    return;
  }
  
  processedVideos.add(video);
  
  video.addEventListener('ended', () => {
    console.log('Video ended event triggered!');
    // Pause autoplay to show overlay
    video.pause();
    handleVideoEnded(video);
  });
  
  console.log('Video listener attached:', getVideoSrc(video));
}

/**
 * Detect and process all videos on page
 */
function detectVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    attachVideoListener(video);
  });
}

/**
 * Initialize content script
 */
function init() {
  // Detect existing videos
  detectVideos();
  
  // Watch for dynamically added videos
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === 'VIDEO') {
          attachVideoListener(node);
        } else if (node.querySelectorAll) {
          const videos = node.querySelectorAll('video');
          videos.forEach(video => attachVideoListener(video));
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  console.log('Video AI Extension: Content script initialized');
}

// Listen for API requests from the injected overlay (page context) and proxy via background
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.type !== 'VIDEO_AI_API_REQUEST') return;

  const { id, method, path, body } = msg;
  // Forward to background and respond back to page
  console.log('[Content] Forwarding API request to background', { id, method, path });
  chrome.runtime.sendMessage({ type: 'API_REQUEST', method, path, body }, (response) => {
    console.log('[Content] Received API response from background', { id, response });
    window.postMessage({ type: 'VIDEO_AI_API_RESPONSE', id, response }, '*');
  });
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
