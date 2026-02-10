import { v4 as uuidv4 } from 'uuid';
import GeneratedContent from '../models/GeneratedContent.js';
import { generateQuiz, generateQA } from '../services/gemini.js';

/**
 * Generate content (Quiz or Q&A)
 * POST /api/generate
 */
export async function generate(req, res, next) {
  try {
    const {
      videoIdentifier,
      pageTitle,
      domain,
      pageUrl,
      videoSrc,
      contentType,
      transcript,
      videoDuration, // Duration in seconds
    } = req.body;

    // Check if content already exists in cache
    const existingContent = await GeneratedContent.findOne({
      videoIdentifier,
      contentType,
    });

    if (existingContent) {
      console.log('Cache hit:', contentType, videoIdentifier);
      return res.json({
        success: true,
        cached: true,
        ...existingContent.toObject(),
      });
    }

    // Generate new content with Gemini
    console.log('Generating new content:', contentType, pageTitle);
    if (videoDuration) {
      console.log(`Video duration: ${(videoDuration / 3600).toFixed(2)} hours`);
    }
    
    let generatedData;
    
    if (contentType === 'quiz') {
      generatedData = await generateQuiz(transcript, pageTitle, videoDuration);
    } else {
      generatedData = await generateQA(transcript, pageTitle, videoDuration);
    }

    // Save to database
    const contentId = uuidv4();
    
    const newContent = new GeneratedContent({
      contentId,
      videoIdentifier,
      pageTitle,
      domain,
      pageUrl,
      videoSrc,
      contentType,
      generatedData,
    });

    await newContent.save();

    console.log('Content saved:', contentId);

    res.status(201).json({
      success: true,
      cached: false,
      ...newContent.toObject(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get history list
 * GET /api/history?type=quiz|qa
 */
export async function getHistory(req, res, next) {
  try {
    const { type } = req.query;

    const filter = {};
    if (type) {
      filter.contentType = type;
    }

    const history = await GeneratedContent.find(filter)
      .select('contentId pageTitle domain contentType createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(history);
  } catch (error) {
    next(error);
  }
}

/**
 * Get content by ID
 * GET /api/history/:contentId
 */
export async function getContentById(req, res, next) {
  try {
    const { contentId } = req.params;

    const content = await GeneratedContent.findOne({ contentId });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    // Separate answers from questions for interactive mode
    const contentData = content.toObject();
    
    if (content.contentType === 'quiz') {
      // Store answers separately
      contentData.answers = content.generatedData.questions?.map(q => ({
        answerIndex: q.answerIndex,
        explanation: q.explanation
      }));
      
      // Remove answers from questions
      contentData.generatedData = {
        ...content.generatedData,
        questions: content.generatedData.questions?.map(q => ({
          question: q.question,
          options: q.options
        }))
      };
    } else if (content.contentType === 'qa') {
      // Store answers separately
      contentData.answers = content.generatedData.qa?.map(item => ({
        answer: item.answer
      }));
      
      // Remove answers from Q&A
      contentData.generatedData = {
        ...content.generatedData,
        qa: content.generatedData.qa?.map(item => ({
          question: item.question
        }))
      };
    }

    res.json(contentData);
  } catch (error) {
    next(error);
  }
}

/**
 * Validate user answers
 * POST /api/history/:contentId/validate
 */
export async function validateAnswers(req, res, next) {
  try {
    const { contentId } = req.params;
    const { userAnswers } = req.body;

    const content = await GeneratedContent.findOne({ contentId });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    let results = [];
    
    if (content.contentType === 'quiz') {
      results = content.generatedData.questions?.map((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.answerIndex;
        
        return {
          questionIndex: index,
          isCorrect,
          userAnswer,
          correctAnswer: q.answerIndex,
          correctOption: q.options[q.answerIndex],
          explanation: q.explanation
        };
      });
    } else if (content.contentType === 'qa') {
      results = content.generatedData.qa?.map((item, index) => {
        const userAnswer = userAnswers[index];
        
        return {
          questionIndex: index,
          userAnswer,
          correctAnswer: item.answer
        };
      });
    }

    // Calculate score for quizzes
    const score = content.contentType === 'quiz' 
      ? results.filter(r => r.isCorrect).length 
      : null;

    res.json({
      success: true,
      contentType: content.contentType,
      results,
      score,
      total: results.length
    });
  } catch (error) {
    next(error);
  }
}
