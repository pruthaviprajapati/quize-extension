import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetches the transcript for a given YouTube video ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Concatenated transcript text
 */
export const getVideoTranscript = async (videoId) => {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptArray || transcriptArray.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Concatenate all transcript segments
    const fullTranscript = transcriptArray
      .map(segment => segment.text)
      .join(' ')
      .trim();

    return fullTranscript;
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
};

/**
 * Gets video metadata (optional enhancement)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<object>} - Video metadata
 */
export const getVideoMetadata = async (videoId) => {
  try {
    // This is a placeholder - you could integrate with YouTube Data API v3
    // For now, we'll just return the video ID
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error.message);
    return { videoId };
  }
};
