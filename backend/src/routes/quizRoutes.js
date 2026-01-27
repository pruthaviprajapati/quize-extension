import express from 'express';
import {
  processVideo,
  getQuizByVideoId,
  healthCheck
} from '../controllers/quizController.js';

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Process video and generate/retrieve quiz
router.post('/process-video', processVideo);

// Get cached quiz by video ID
router.get('/:videoId', getQuizByVideoId);

export default router;
