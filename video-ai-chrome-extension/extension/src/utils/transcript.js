/**
 * Extract transcript from video track elements
 * @param {HTMLVideoElement} videoElement - Video element
 * @returns {Promise<string|null>} Transcript text or null
 */
export async function extractTranscript(videoElement) {
  const tracks = videoElement.querySelectorAll('track[kind="subtitles"], track[kind="captions"]');
  
  if (tracks.length === 0) {
    return null;
  }

  try {
    const track = tracks[0];
    const src = track.src;
    
    if (!src) {
      return null;
    }

    const response = await fetch(src);
    const vttText = await response.text();
    
    // Parse VTT and extract text
    const lines = vttText.split('\n');
    const textLines = [];
    
    for (const line of lines) {
      // Skip WEBVTT header, timestamps, and empty lines
      if (line.startsWith('WEBVTT') || 
          line.includes('-->') || 
          line.trim() === '' ||
          /^\d+$/.test(line.trim())) {
        continue;
      }
      
      // Remove HTML tags and add to text
      const cleanedLine = line.replace(/<[^>]*>/g, '').trim();
      if (cleanedLine) {
        textLines.push(cleanedLine);
      }
    }
    
    return textLines.join(' ');
  } catch (error) {
    console.error('Failed to extract transcript:', error);
    return null;
  }
}

/**
 * Extract page text content as fallback
 * @param {number} maxLength - Maximum length to extract
 * @returns {string} Page text content
 */
export function extractPageText(maxLength = 10000) {
  const bodyText = document.body.innerText || '';
  return bodyText.trim().substring(0, maxLength);
}
