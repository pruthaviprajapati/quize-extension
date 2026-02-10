const API_BASE_URL = 'http://localhost:5000/api';

export async function getHistory(filter = 'all') {
  const url = filter === 'all' 
    ? `${API_BASE_URL}/history`
    : `${API_BASE_URL}/history?type=${filter}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return await response.json();
}

export async function getContentById(contentId) {
  const response = await fetch(`${API_BASE_URL}/history/${contentId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch content');
  }

  return await response.json();
}

export async function validateAnswers(contentId, userAnswers) {
  const response = await fetch(`${API_BASE_URL}/history/${contentId}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userAnswers }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to validate answers');
  }

  return await response.json();
}
