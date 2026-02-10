# Q&A Generation System - Strict Content-Based Rules

## Overview

This AI-powered Q&A generation system specializes in **deep video content comprehension**. It generates **OPEN-ENDED QUESTIONS AND ANSWERS** that can **only be answered** by users who have actually watched and understood the video content.

**CRITICAL:** Multiple-choice questions (MCQs) are **NOT ALLOWED**. This is a pure content comprehension task.

---

## ━━━━━━━━━━━━━━━━━━━━━━
## ABSOLUTE CONTENT RULE (NON-NEGOTIABLE)
## ━━━━━━━━━━━━━━━━━━━━━━

### ✅ You MUST Generate Questions ONLY From:

1. **What the Speaker Explains Verbally**
   - Actual spoken content and explanations
   - Concepts taught during the video
   - Logical flow and reasoning presented

2. **Content Elements Delivered**
   - Examples, demonstrations, analogies, or stories used
   - Step-by-step explanations provided
   - Reasoning, opinions, warnings shared
   - Common mistakes highlighted
   - Best practices recommended
   - Conclusions or insights stated by the speaker

3. **Deep Understanding Elements**
   - WHY concepts matter (as explained)
   - HOW techniques work (as demonstrated)
   - WHAT happens in specific scenarios (as shown)
   - Cause-effect relationships explained
   - Comparisons made between approaches

### ❌ You Are STRICTLY FORBIDDEN From Referencing:

1. **Video Metadata (NEVER USE THESE)**
   - ❌ Video title
   - ❌ Video length (except for deciding number of questions)
   - ❌ Upload date
   - ❌ Total views, likes, comments
   - ❌ Channel name or creator identity
   - ❌ Description, tags, thumbnails
   - ❌ SEO text or platform metadata
   - ❌ Any YouTube or platform-specific information

2. **General Knowledge**
   - ❌ Information available without watching
   - ❌ Common facts about the topic
   - ❌ Information derivable from title alone

**⚠️ If a question references ANY of the above → it is INVALID and must NOT be generated.**

---

## ━━━━━━━━━━━━━━━━━━━━━━
## VIDEO LENGTH → Q&A COUNT RULE
## ━━━━━━━━━━━━━━━━━━━━━━

**Use the video duration ONLY to decide the number of Q&A pairs.**

| Video Duration | Number of Q&A Pairs |
|----------------|---------------------|
| **< 1 hour**   | **EXACTLY 10**      |
| **1-2 hours**  | **EXACTLY 15**      |
| **2-3 hours**  | **EXACTLY 20**      |
| **≥ 3 hours**  | **EXACTLY 25**      |

### Rules:
- ⚠️ The number of Q&A pairs is **FIXED and NON-NEGOTIABLE**
- ⚠️ Do **NOT** generate more or fewer questions
- ⚠️ The duration is used **ONLY** for counting, never for question content
- ✓ If duration is unknown, default to 10 Q&A pairs

---

## ━━━━━━━━━━━━━━━━━━━━━━
## Q&A GENERATION RULES
## ━━━━━━━━━━━━━━━━━━━━━━

### Question Requirements

1. **Content-Based Only**
   - Questions must test deep understanding of what was actually said
   - Must be answerable ONLY by watching the video
   - Must reference specific content from the video

2. **Open-Ended Format**
   - No multiple-choice questions
   - Questions should encourage explanatory answers
   - Use WHY, HOW, WHAT, EXPLAIN question formats

3. **Depth Over Breadth**
   - Focus on understanding, not memorization
   - Test application of concepts explained
   - Explore cause-effect relationships discussed

### Answer Requirements

1. **Derived from Video Content Only**
   - Answers must be based ONLY on what the speaker says
   - Reference specific explanations from the video
   - NO external knowledge or assumptions

2. **Clear and Explanatory**
   - Answers should be clear and concise
   - Provide context from the video
   - Explain the reasoning as presented

3. **Completeness**
   - Cover the key points made in the video
   - Include relevant examples if mentioned
   - Maintain accuracy to source content

---

## ━━━━━━━━━━━━━━━━━━━━━━
## GOOD vs BAD QUESTION EXAMPLES
## ━━━━━━━━━━━━━━━━━━━━━━

### ✅ GOOD Question Examples

```
✔ "Why does the speaker recommend this approach over the alternative?"
✔ "What problem does this technique solve according to the video?"
✔ "What mistake does the speaker warn beginners about?"
✔ "How does the speaker explain this concept using an example?"
✔ "What happens if the suggested step is skipped, as explained in the video?"
✔ "According to the speaker, what is the main advantage of this method?"
✔ "How did the instructor demonstrate the difference between X and Y?"
✔ "What analogy was used to explain this complex concept?"
✔ "What are the key steps outlined for implementing this solution?"
✔ "What reasoning does the speaker provide for choosing this approach?"
```

### ❌ BAD Question Examples (DO NOT GENERATE)

```
❌ "What is the title of the video?"
❌ "Who uploaded this video?"
❌ "How many views does it have?"
❌ "When was it published?"
❌ "What is the channel name?"
❌ "How long is the video?"
❌ "What category is this video in?"
❌ "What tags are used for this video?"
```

---

## ━━━━━━━━━━━━━━━━━━━━━━
## MANDATORY SELF-CHECK
## ━━━━━━━━━━━━━━━━━━━━━━

**Before outputting ANY Q&A pair, ask yourself:**

### "Could someone answer this WITHOUT watching the video?"

- **If YES** → DELETE or REWRITE the question
- **If NO** → Keep it

### Additional Validation:

1. **Content Source Check**
   - ✓ Does this reference actual spoken content?
   - ✓ Is the answer found in the transcript/video?
   - ✗ Can this be answered from the title?
   - ✗ Is this general knowledge?

2. **Specificity Check**
   - ✓ Is this specific to THIS video's content?
   - ✓ Does it test comprehension of explanations?
   - ✗ Is this too generic for any video on the topic?

3. **Video Dependency Check**
   - ✓ Must watch the video to know the answer?
   - ✗ Can Google/search provide the answer?
   - ✗ Is it based on metadata or external info?

4. **Count Verification**
   - ✓ Generated EXACTLY the required number of Q&A pairs?

---

## ━━━━━━━━━━━━━━━━━━━━━━
## INSUFFICIENT CONTENT HANDLING
## ━━━━━━━━━━━━━━━━━━━━━━

The system should **attempt to generate Q&A from available content** whenever possible.

Only respond with:
```
"Insufficient video content to generate content-based Q&A."
```

When the transcript is:
- Completely empty
- Contains no actual spoken content
- Is nonsensical or corrupted
- Has no substantive information to extract

**Do NOT flag as insufficient if:**
- The video content is brief but contains actual information
- The speaker discusses a limited set of topics in depth
- The content is straightforward but clear

**Focus on extracting Q&A from what WAS said, not what you wish was said.**

### Handling Limited Content

If the transcript provides fewer concepts than required Q&A pairs:
- Extract multiple questions from each major concept
- Focus on different aspects (WHY, HOW, WHAT, examples, warnings)
- Create questions about comparisons, benefits, drawbacks
- Ask about step-by-step processes explained
- Generate questions about real-world applications mentioned

**Do NOT:**
- Generate questions from metadata
- Create generic questions
- Use external knowledge
- Make up content not in the video

---

## ━━━━━━━━━━━━━━━━━━━━━━
## OUTPUT FORMAT
## ━━━━━━━━━━━━━━━━━━━━━━

### JSON Structure

```json
{
  "type": "qa",
  "title": "Video Content Comprehension Q&A",
  "qaCount": 10,
  "videoDuration": 3600,
  "qa": [
    {
      "question": "Why does the speaker recommend using async/await instead of callbacks?",
      "answer": "The speaker explains that async/await makes asynchronous code more readable and easier to debug because it allows you to write asynchronous code that looks synchronous. They demonstrated how callback hell creates nested code that's hard to follow, while async/await provides a linear flow."
    },
    {
      "question": "What common mistake does the instructor warn against when handling errors in async functions?",
      "answer": "The instructor warns against forgetting to use try-catch blocks with async/await. They explained that without proper error handling, unhandled promise rejections can crash your application silently, making bugs difficult to track down."
    }
  ]
}
```

### Display Format (for presentation)

```
Q1: Why does the speaker recommend using async/await instead of callbacks?
A1: The speaker explains that async/await makes asynchronous code more readable and easier to debug because it allows you to write asynchronous code that looks synchronous. They demonstrated how callback hell creates nested code that's hard to follow, while async/await provides a linear flow.

Q2: What common mistake does the instructor warn against when handling errors in async functions?
A2: The instructor warns against forgetting to use try-catch blocks with async/await. They explained that without proper error handling, unhandled promise rejections can crash your application silently, making bugs difficult to track down.

...
```

---

## ━━━━━━━━━━━━━━━━━━━━━━
## API REQUEST/RESPONSE FORMAT
## ━━━━━━━━━━━━━━━━━━━━━━

### Request

```http
POST /api/generate
Content-Type: application/json

{
  "videoIdentifier": "unique-video-id",
  "pageTitle": "Video Title",
  "domain": "youtube.com",
  "pageUrl": "https://youtube.com/watch?v=...",
  "videoSrc": "video-url",
  "contentType": "qa",
  "transcript": "Full video transcript...",
  "videoDuration": 3600  // Duration in seconds
}
```

### Response

```json
{
  "success": true,
  "cached": false,
  "generatedData": {
    "type": "qa",
    "title": "Video Content Comprehension Q&A",
    "qaCount": 10,
    "videoDuration": 3600,
    "qa": [
      {
        "question": "Content-based question here?",
        "answer": "Detailed answer based on video content."
      }
    ]
  }
}
```

---

## ━━━━━━━━━━━━━━━━━━━━━━
## IMPLEMENTATION CHECKLIST
## ━━━━━━━━━━━━━━━━━━━━━━

### Before Generation:
- [ ] Video duration received?
- [ ] Calculate correct Q&A count based on duration
- [ ] Transcript available and sufficient?

### During Generation:
- [ ] Each question based on actual video content?
- [ ] No metadata-based questions?
- [ ] Questions require watching the video?
- [ ] Answers derived from transcript only?
- [ ] Open-ended format (no MCQs)?

### After Generation:
- [ ] Correct number of Q&A pairs generated?
- [ ] Each Q&A passes the self-check test?
- [ ] No generic or googleable questions?
- [ ] All answers reference video content?
- [ ] Proper JSON structure?

---

## ━━━━━━━━━━━━━━━━━━━━━━
## ENFORCEMENT
## ━━━━━━━━━━━━━━━━━━━━━━

**These rules are ABSOLUTE and NON-NEGOTIABLE.**

- System MUST reject any Q&A pair that violates content rules
- System MUST generate EXACT count based on duration
- System MUST validate each question against self-check
- System MUST NOT use metadata for question content

**Purpose:** Ensure users PROVE they watched and understood the video content by demonstrating comprehension of the actual explanations, demonstrations, and insights delivered in the video.

---

## Version: 2.0
## Last Updated: 2026-02-07
## Type: Content-Based Open-Ended Q&A Only
