import Quiz from '../models/Quiz.js';
import { getVideoTranscript } from '../services/transcriptService.js';
import { analyzeAndGenerateQuiz } from '../services/aiService.js';

/**
 * Process a video and generate/retrieve quiz
 * POST /api/quiz/process-video
 */
export const processVideo = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required'
      });
    }

    // Check if quiz already exists in cache
    const existingQuiz = await Quiz.findOne({ videoId });
    
    if (existingQuiz) {
      console.log(`✅ Cache hit for video: ${videoId}`);
      
      // Update access stats
      await existingQuiz.recordAccess();
      
      return res.status(200).json({
        success: true,
        data: {
          videoId: existingQuiz.videoId,
          isEducational: existingQuiz.isEducational,
          questions: existingQuiz.questions,
          cached: true
        }
      });
    }

    console.log(`🔍 Processing new video: ${videoId}`);

    // Fetch transcript
    let transcript;
    try {
      transcript = await getVideoTranscript(videoId);
    } catch (transcriptError) {
      return res.status(400).json({
        success: false,
        error: 'Could not fetch transcript. Video may not have captions available.',
        details: transcriptError.message
      });
    }

    // Analyze with AI and generate quiz
    let aiResponse;
    try {
      aiResponse = await analyzeAndGenerateQuiz(transcript, videoId);
    } catch (aiError) {
      return res.status(500).json({
        success: false,
        error: 'AI analysis failed',
        details: aiError.message
      });
    }

    // Save to database (cache for future use)
    const newQuiz = new Quiz({
      videoId,
      isEducational: aiResponse.isEducational,
      questions: aiResponse.isEducational ? aiResponse.questions : [],
      accessCount: 1,
      lastAccessed: new Date()
    });

    await newQuiz.save();
    console.log(`💾 Saved quiz to database for video: ${videoId}`);

    return res.status(200).json({
      success: true,
      data: {
        videoId: newQuiz.videoId,
        isEducational: newQuiz.isEducational,
        questions: newQuiz.questions,
        cached: false
      }
    });

  } catch (error) {
    console.error('❌ Error in processVideo:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Get cached quiz by video ID
 * GET /api/quiz/:videoId
 */
export const getQuizByVideoId = async (req, res) => {
  try {
    const { videoId } = req.params;

    const quiz = await Quiz.findOne({ videoId });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found in cache'
      });
    }

    // Update access stats
    await quiz.recordAccess();

    return res.status(200).json({
      success: true,
      data: {
        videoId: quiz.videoId,
        isEducational: quiz.isEducational,
        questions: quiz.questions,
        cached: true
      }
    });

  } catch (error) {
    console.error('❌ Error in getQuizByVideoId:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Health check endpoint
 * GET /api/quiz/health
 */
export const healthCheck = async (req, res) => {
  try {
    const quizCount = await Quiz.countDocuments();
    
    return res.status(200).json({
      success: true,
      message: 'Quiz service is healthy',
      stats: {
        cachedQuizzes: quizCount
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
};
