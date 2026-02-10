// API utility for extension popup (runs in extension context, can directly fetch)
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generate content (quiz or Q&A)
 * @param {Object} data - Video metadata and content type
 * @returns {Promise<Object>} Generated content
 */
export async function generateContent(data) {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get history list
 * @param {string} filter - Filter type: 'all', 'quiz', 'qa'
 * @returns {Promise<Array>} History items
 */
export async function getHistory(filter = 'all') {
  const path = filter === 'all' ? '/history' : `/history?type=${filter}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('[Popup API] getHistory error:', error);
    throw error;
  }
}

/**
 * Get content by ID
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Full content details
 */
export async function getContentById(contentId) {
  const response = await fetch(`${API_BASE_URL}/history/${contentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
