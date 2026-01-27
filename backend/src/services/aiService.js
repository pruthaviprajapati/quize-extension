import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyzes if content is educational and generates quiz
 * @param {string} transcript - Video transcript
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<object>} - Quiz data or null if not educational
 */
export const analyzeAndGenerateQuiz = async (transcript, videoId) => {
  try {
    // Limit transcript length to avoid token limits (roughly 4000 words)
    const truncatedTranscript = transcript.split(' ').slice(0, 4000).join(' ');

    const systemPrompt = `You are an educational content analyzer and quiz generator. Your task is to:
1. Determine if the video content is educational (teaching concepts, explaining topics, tutorials, academic content, etc.)
2. If educational, generate 8-10 multiple-choice questions based on the content

Educational content includes: tutorials, lectures, how-to guides, academic topics, skill development, factual information, etc.
Non-educational content includes: entertainment, vlogs, gaming (unless educational), music videos, comedy, etc.

You MUST respond with ONLY valid JSON in this exact format:
{
  "isEducational": boolean,
  "questions": [
    {
      "question": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": number (0-3, index of correct option)
    }
  ]
}

If not educational, return:
{
  "isEducational": false,
  "questions": []
}

Guidelines for questions:
- Create 8-10 questions if educational
- Questions should test comprehension and key concepts
- All 4 options should be plausible
- Mix of difficulty levels
- Avoid trivial or overly difficult questions
- Questions should be clear and unambiguous`;

    const userPrompt = `Analyze this video transcript and determine if it's educational. If yes, generate 8-10 quiz questions:

Transcript:
${truncatedTranscript}

Remember: Return ONLY valid JSON, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content);

    // Validate response structure
    if (typeof parsedResponse.isEducational !== 'boolean') {
      throw new Error('Invalid response: isEducational must be boolean');
    }

    if (parsedResponse.isEducational) {
      if (!Array.isArray(parsedResponse.questions) || parsedResponse.questions.length < 8) {
        throw new Error('Invalid response: Must have at least 8 questions');
      }

      // Validate each question
      parsedResponse.questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question at index ${index}`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid correctAnswer at index ${index}`);
        }
      });
    }

    return parsedResponse;

  } catch (error) {
    console.error('Error in AI analysis:', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

/**
 * Alternative: Use Google Gemini (if configured)
 * Uncomment and modify if you want to use Gemini instead
 */
/*
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeAndGenerateQuizGemini = async (transcript, videoId) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `[Same prompt as above with JSON format instructions]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Gemini analysis failed: ${error.message}`);
  }
};
*/
