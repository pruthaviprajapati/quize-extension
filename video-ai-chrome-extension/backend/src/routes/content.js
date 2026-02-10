import express from 'express';
import { generate, getHistory, getContentById, validateAnswers } from '../controllers/contentController.js';
import { 
  validateGenerate, 
  validateHistoryQuery, 
  validateContentId,
  validateUserAnswers
} from '../middleware/validation.js';
import { generateRateLimiter, apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Root API info - helpful when visiting /api in a browser
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Video AI Generator API',
    endpoints: {
      generate: { method: 'POST', path: '/api/generate', description: 'Generate quiz or Q&A from video metadata' },
      history: { method: 'GET', path: '/api/history', description: 'List generated content' },
      contentById: { method: 'GET', path: '/api/history/:contentId', description: 'Get content details by ID' },
      validateAnswers: { method: 'POST', path: '/api/history/:contentId/validate', description: 'Validate user answers' }
    }
  });
});

// Generate content (Quiz or Q&A)
router.post('/generate', generateRateLimiter, validateGenerate, generate);

// Get history
router.get('/history', apiRateLimiter, validateHistoryQuery, getHistory);

// Get content by ID
router.get('/history/:contentId', apiRateLimiter, validateContentId, getContentById);

// Validate user answers
router.post('/history/:contentId/validate', apiRateLimiter, validateContentId, validateUserAnswers, validateAnswers);

export default router;
