import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Calculate MCQ count based on video duration and transcript length
 * @param {number} durationInSeconds - Video duration in seconds
 * @param {number} transcriptLength - Length of transcript in characters
 * @returns {number} Number of MCQs to generate
 */
function calculateMCQCount(durationInSeconds, transcriptLength) {
  const durationInHours = durationInSeconds / 3600;
  
  // Calculate ideal count based on duration
  let idealCount;
  if (durationInHours < 1) {
    idealCount = 10;
  } else if (durationInHours < 2) {
    idealCount = 15;
  } else if (durationInHours < 3) {
    idealCount = 20;
  } else {
    idealCount = 25;
  }
  
  // Adjust based on transcript length (aim for ~300-400 chars per MCQ)
  const transcriptBasedCount = Math.floor(transcriptLength / 350);
  
  // Use the smaller of the two to avoid overpromising
  // But ensure minimum of 5 MCQs if we have any content
  const adjustedCount = Math.max(5, Math.min(idealCount, transcriptBasedCount));
  
  console.log(`[MCQ Count Calculation] Duration-based: ${idealCount}, Transcript-based: ${transcriptBasedCount}, Final: ${adjustedCount}`);
  
  return adjustedCount;
}

/**
 * Generate quiz content using Gemini AI
 * @param {string} transcript - Video transcript or page content
 * @param {string} pageTitle - Page title for context
 * @param {number} videoDuration - Video duration in seconds (optional, defaults to 10 MCQs)
 * @returns {Promise<Object>} Quiz data
 */
export async function generateQuiz(transcript, pageTitle, videoDuration = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  // Validate transcript
  const transcriptLength = transcript?.length || 0;
  if (transcriptLength < 100) {
    throw new Error('Transcript is too short or empty. Need at least 100 characters to generate quiz.');
  }
  
  // Determine MCQ count based on video duration AND transcript length
  const mcqCount = videoDuration ? calculateMCQCount(videoDuration, transcriptLength) : Math.max(5, Math.floor(transcriptLength / 350));
  const durationInHours = videoDuration ? (videoDuration / 3600).toFixed(2) : 'Unknown';
  
  // Enhanced logging
  console.log('='.repeat(60));
  console.log('[Quiz Generation] Parameters:');
  console.log(`  Video Duration: ${videoDuration ? `${videoDuration}s (${durationInHours}h)` : 'Not provided'}`);
  console.log(`  Required MCQs: ${mcqCount}`);
  console.log(`  Title: ${pageTitle}`);
  console.log(`  Transcript Length: ${transcriptLength} characters`);
  console.log('='.repeat(60));

  const prompt = `You are an AI quiz generator specialized in deep VIDEO CONTENT comprehension.

========================
CRITICAL CONSTRAINTS
========================

1. You MUST generate quiz questions ONLY from the ACTUAL CONTENT delivered in the video:
   - Spoken explanations
   - Concepts taught
   - Examples, analogies, demonstrations
   - Warnings, mistakes, best practices
   - Conclusions and key insights

2. DO NOT generate questions based on:
   - Video title
   - Upload date
   - Total views, likes, comments
   - Channel name or creator identity
   - Video description metadata
   - Thumbnails, tags, or SEO text

3. If a question can be answered WITHOUT watching the video, it is INVALID and must be rewritten.

========================
MCQ COUNT RULE (MANDATORY)
========================

Video Duration: ${durationInHours} hours
REQUIRED MCQ COUNT: **EXACTLY ${mcqCount} MCQs**

⚠️ THIS NUMBER IS FIXED AND NON-NEGOTIABLE.
⚠️ You MUST generate EXACTLY ${mcqCount} multiple-choice questions.
⚠️ Do NOT generate more or fewer questions under ANY condition.

========================
QUESTION DESIGN RULES
========================

- Questions must require comprehension of the full video
- Prefer WHY / HOW / APPLICATION-based questions
- Include:
  - Conceptual understanding
  - Cause–effect reasoning
  - Comparisons made by the speaker
  - Real-world or coding scenarios discussed
  - Common misconceptions addressed in the video

========================
QUESTION FORMAT
========================

For each MCQ:
- Provide 4 options (A, B, C, D)
- Clearly indicate the correct answer (index 0-3)
- Provide a 1–2 line explanation referencing the video's content

========================
FORBIDDEN QUESTION PATTERNS
========================

❌ "What is the title of this video?"
❌ "How long is the video?"
❌ "Who uploaded this video?"
❌ "When was the video published?"
❌ "How many views does the video have?"
❌ "What is the channel name?"

========================
VALID QUESTION PATTERNS
========================

✅ "According to the speaker, why is [concept] important?"
✅ "Which approach was recommended for solving [problem]?"
✅ "What common mistake did the instructor warn against?"
✅ "How did the speaker differentiate between [X] and [Y]?"
✅ "In the example shown, what was the outcome of [action]?"
✅ "What analogy was used to explain [concept]?"

========================
CONTENT FOR ANALYSIS
========================

Content Title (Reference Only - DO NOT CREATE QUESTIONS ABOUT THIS TITLE): ${pageTitle}

Video Transcript/Content:
${transcript}

========================
FINAL VALIDATION STEP
========================

Before outputting, for EACH question ask:
"Could someone answer this without watching the video?"
- If YES → REWRITE the question to require video-specific knowledge
- If NO → Include it

Confirm you have generated EXACTLY ${mcqCount} MCQs.

CRITICAL INSTRUCTION:
You MUST generate MCQ questions from whatever content is available in the transcript.
Even if the content seems limited, extract meaningful questions from what IS there.
DO NOT respond with error messages - just do your best with the available content.
Focus on quality, but ALWAYS generate the requested number of MCQs.

========================
OUTPUT FORMAT
========================

Return ONLY a JSON object (no markdown, no code blocks) with this exact structure:
{
  "type": "quiz",
  "title": "Video Content Comprehension Quiz",
  "mcqCount": ${mcqCount},
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Brief explanation referencing what was explained in the video"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('[Quiz Generation] Raw response length:', text.length);
    console.log('[Quiz Generation] Response preview:', text.substring(0, 200));
    
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Check if Gemini returned an error message instead of JSON
    if (text.length < 50 || !text.startsWith('{')) {
      console.warn('[Quiz Generation] Gemini returned unexpected response:', text.substring(0, 300));
      console.warn('[Quiz Generation] Attempting to retry with relaxed requirements...');
      
      // Retry with a more lenient prompt
      const fallbackPrompt = `Generate ${mcqCount} multiple-choice quiz questions based on this content:

Title: ${pageTitle}
Content: ${transcript}

Create content-based MCQ questions with 4 options each.
Return as JSON with this structure:
{
  "type": "quiz",
  "title": "Content Comprehension Quiz",
  "mcqCount": ${mcqCount},
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;

      const fallbackResult = await model.generateContent(fallbackPrompt);
      const fallbackResponse = await fallbackResult.response;
      text = fallbackResponse.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('[Quiz Generation] Fallback response length:', text.length);
    }
    
    const quizData = JSON.parse(text);
    
    // Validate structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      console.error('[Quiz Generation] Invalid structure:', quizData);
      throw new Error('Invalid quiz structure');
    }
    
    // Validate MCQ count matches requirements
    if (quizData.questions.length !== mcqCount) {
      console.warn(`[Quiz Generation] Warning: Expected ${mcqCount} MCQs but received ${quizData.questions.length}`);
    }
    
    // Add metadata
    quizData.mcqCount = mcqCount;
    quizData.videoDuration = videoDuration;
    
    console.log(`[Quiz Generation] ✓ Successfully generated ${quizData.questions.length} MCQs`);
    
    return quizData;
  } catch (error) {
    console.error('[Quiz Generation] Gemini API Error:', error.message);
    if (error instanceof SyntaxError) {
      console.error('[Quiz Generation] Failed to parse JSON response');
    }
    throw new Error('Failed to generate quiz content: ' + error.message);
  }
}

/**
 * Calculate Q&A count based on video duration and transcript length
 * @param {number} durationInSeconds - Video duration in seconds
 * @param {number} transcriptLength - Length of transcript in characters
 * @returns {number} Number of Q&A pairs to generate
 */
function calculateQACount(durationInSeconds, transcriptLength) {
  const durationInHours = durationInSeconds / 3600;
  
  // Calculate ideal count based on duration
  let idealCount;
  if (durationInHours < 1) {
    idealCount = 10;
  } else if (durationInHours < 2) {
    idealCount = 15;
  } else if (durationInHours < 3) {
    idealCount = 20;
  } else {
    idealCount = 25;
  }
  
  // Adjust based on transcript length (aim for ~200-300 chars per Q&A pair)
  const transcriptBasedCount = Math.floor(transcriptLength / 250);
  
  // Use the smaller of the two to avoid overpromising
  // But ensure minimum of 5 Q&A pairs if we have any content
  const adjustedCount = Math.max(5, Math.min(idealCount, transcriptBasedCount));
  
  console.log(`[Q&A Count Calculation] Duration-based: ${idealCount}, Transcript-based: ${transcriptBasedCount}, Final: ${adjustedCount}`);
  
  return adjustedCount;
}

/**
 * Generate Q&A content using Gemini AI with strict content-based rules
 * @param {string} transcript - Video transcript or page content
 * @param {string} pageTitle - Page title for context (NOT for question content)
 * @param {number} videoDuration - Video duration in seconds (optional, defaults to 10 Q&A)
 * @returns {Promise<Object>} Q&A data
 */
export async function generateQA(transcript, pageTitle, videoDuration = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  // Validate transcript
  const transcriptLength = transcript?.length || 0;
  if (transcriptLength < 100) {
    throw new Error('Transcript is too short or empty. Need at least 100 characters to generate Q&A.');
  }
  
  // Determine Q&A count based on video duration AND transcript length
  const qaCount = videoDuration ? calculateQACount(videoDuration, transcriptLength) : Math.max(5, Math.floor(transcriptLength / 250));
  const durationInHours = videoDuration ? (videoDuration / 3600).toFixed(2) : 'Unknown';
  
  // Enhanced logging
  console.log('='.repeat(60));
  console.log('[Q&A Generation] Parameters:');
  console.log(`  Video Duration: ${videoDuration ? `${videoDuration}s (${durationInHours}h)` : 'Not provided'}`);
  console.log(`  Required Q&A Pairs: ${qaCount}`);
  console.log(`  Title (Reference Only): ${pageTitle}`);
  console.log(`  Transcript Length: ${transcriptLength} characters`);
  console.log('='.repeat(60));

  const prompt = `You are an AI system that generates ONLY OPEN-ENDED QUESTIONS AND ANSWERS
strictly from the ACTUAL CONTENT delivered inside a video.

This is a CONTENT COMPREHENSION task.
Multiple-choice questions (MCQs) are NOT allowed.

━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE CONTENT RULE (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━

You MUST generate questions ONLY from:
- What the speaker explains verbally
- Concepts taught during the video
- Examples, demonstrations, analogies, or stories used
- Step-by-step explanations
- Reasoning, opinions, warnings, mistakes, best practices
- Conclusions or insights stated by the speaker

You are STRICTLY FORBIDDEN from using or referencing:
❌ Video title  
❌ Video length (except for deciding number of questions)  
❌ Upload date  
❌ Total views, likes, comments  
❌ Channel name or creator identity  
❌ Description, tags, thumbnails, SEO text  
❌ Any YouTube or platform metadata  

If a question references ANY of the above → it is INVALID and must NOT be generated.

━━━━━━━━━━━━━━━━━━━━━━
VIDEO LENGTH → Q&A COUNT RULE
━━━━━━━━━━━━━━━━━━━━━━

Video Duration: ${durationInHours} hours (${videoDuration} seconds)
REQUIRED Q&A COUNT: **EXACTLY ${qaCount} Q&A pairs**

⚠️ THIS NUMBER IS FIXED AND NON-NEGOTIABLE.
⚠️ You MUST generate EXACTLY ${qaCount} open-ended question-answer pairs.
⚠️ Do NOT generate more or fewer questions under ANY condition.

━━━━━━━━━━━━━━━━━━━━━━
Q&A GENERATION RULES
━━━━━━━━━━━━━━━━━━━━━━

- Questions must test deep understanding of the video content
- Answers must be derived ONLY from what the speaker says
- Answers should be clear, concise, and explanatory
- Do NOT ask factual or metadata-based questions

GOOD QUESTION EXAMPLES:
✔ "Why does the speaker recommend this approach?"
✔ "What problem does this technique solve according to the video?"
✔ "What mistake does the speaker warn beginners about?"
✔ "How does the speaker explain this concept using an example?"
✔ "What happens if the suggested step is skipped, as explained in the video?"

BAD QUESTION EXAMPLES (DO NOT GENERATE):
❌ "What is the title of the video?"
❌ "Who uploaded this video?"
❌ "How many views does it have?"
❌ "When was it published?"
❌ "What is the channel name?"

━━━━━━━━━━━━━━━━━━━━━━
MANDATORY SELF-CHECK
━━━━━━━━━━━━━━━━━━━━━━

Before outputting ANY Q&A pair, ask yourself:

"Could someone answer this WITHOUT watching the video?"

- If YES → DELETE or REWRITE the question
- If NO → Keep it

CRITICAL INSTRUCTION: 
You MUST generate Q&A pairs from whatever content is available in the transcript.
Even if the content seems limited, extract meaningful questions and answers from what IS there.
DO NOT respond with messages like "Insufficient video content" - just do your best with the available content.
Focus on quality over quantity, but ALWAYS generate the requested number of Q&A pairs.

━━━━━━━━━━━━━━━━━━━━━━
CONTENT FOR ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━

Content Title (Reference Only - DO NOT CREATE QUESTIONS ABOUT THIS TITLE): ${pageTitle}

Video Transcript/Content:
${transcript}

━━━━━━━━━━━━━━━━━━━━━━
FINAL VALIDATION STEP
━━━━━━━━━━━━━━━━━━━━━━

Before outputting, for EACH question ask:
"Could someone answer this without watching the video?"
- If YES → REWRITE the question to require video-specific knowledge
- If NO → Include it

Confirm you have generated EXACTLY ${qaCount} Q&A pairs.

GENERATE Q&A from the available transcript content.
Even if the content is limited, extract what you can while following the rules.

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━

Return ONLY a JSON object (no markdown, no code blocks) with this exact structure:
{
  "type": "qa",
  "title": "Video Content Comprehension Q&A",
  "qaCount": ${qaCount},
  "qa": [
    {
      "question": "Why does the speaker recommend this specific approach over alternatives?",
      "answer": "The speaker explains that this approach is recommended because [specific reasoning from video]. They demonstrated this by [example from video] and emphasized that [key insight from video]."
    }
  ]
}

Remember:
- EXACTLY ${qaCount} Q&A pairs
- ONLY content from the transcript
- NO metadata references
- Open-ended questions only
- Content-based answers only`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('[Q&A Generation] Raw response length:', text.length);
    
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Check if Gemini returned an error message instead of JSON
    if (text.length < 50 || text.includes("Insufficient") || text.includes("cannot generate")) {
      console.warn('[Q&A Generation] Gemini returned unexpected response:', text);
      console.warn('[Q&A Generation] Attempting to retry with relaxed requirements...');
      
      // Retry with a more lenient prompt
      const fallbackPrompt = `Generate ${qaCount} simple question-answer pairs based on this content:

Title: ${pageTitle}
Content: ${transcript}

Create open-ended questions that can be answered from the content above.
Return as JSON with this structure:
{
  "type": "qa",
  "title": "Content Comprehension Q&A",
  "qaCount": ${qaCount},
  "qa": [{"question": "...", "answer": "..."}]
}`;

      const fallbackResult = await model.generateContent(fallbackPrompt);
      const fallbackResponse = await fallbackResult.response;
      text = fallbackResponse.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('[Q&A Generation] Fallback response length:', text.length);
    }
    
    const qaData = JSON.parse(text);
    
    // Validate structure
    if (!qaData.qa || !Array.isArray(qaData.qa)) {
      console.error('[Q&A Generation] Invalid structure:', qaData);
      throw new Error('Invalid Q&A structure');
    }
    
    // Validate Q&A count matches requirements
    if (qaData.qa.length !== qaCount) {
      console.warn(`[Q&A Generation] Warning: Expected ${qaCount} Q&A pairs but received ${qaData.qa.length}`);
    }
    
    // Add metadata
    qaData.qaCount = qaCount;
    qaData.videoDuration = videoDuration;
    
    console.log(`[Q&A Generation] ✓ Successfully generated ${qaData.qa.length} Q&A pairs`);
    
    return qaData;
  } catch (error) {
    console.error('[Q&A Generation] Gemini API Error:', error.message);
    if (error instanceof SyntaxError) {
      console.error('[Q&A Generation] Failed to parse JSON response');
    }
    throw new Error('Failed to generate Q&A content: ' + error.message);
  }
}
