# Quiz Generation System - Strict Rules & Guidelines

## Overview

This AI-powered quiz generation system specializes in **deep video content comprehension**. It generates multiple-choice questions (MCQs) that can **only be answered** by users who have actually watched and understood the video content.

---

## Critical Constraints

### ✅ What Questions MUST Be Based On:

1. **Spoken Explanations**
   - What the speaker explains, teaches, or demonstrates
   - The logical flow of concepts presented

2. **Content Elements**
   - Examples, analogies, and demonstrations shown
   - Key insights and conclusions drawn
   - Warnings about common mistakes
   - Best practices recommended
   - Comparisons made between concepts
   - Terminology defined during the video

3. **Conceptual Understanding**
   - WHY concepts are important (as explained)
   - HOW to apply techniques (as demonstrated)
   - WHAT happens when certain approaches are used
   - Cause-effect relationships explained

### ❌ What Questions MUST NOT Be Based On:

1. **Video Metadata**
   - Video title
   - Upload date
   - Channel name or creator identity
   - Total views, likes, comments
   - Video description
   - Thumbnails or tags

2. **General Knowledge**
   - Information available without watching the video
   - Common facts about the topic
   - Information from the video title alone

---

## MCQ Count Rules (MANDATORY)

The number of MCQs generated is **strictly determined by video length**:

| Video Length | Number of MCQs |
|--------------|----------------|
| < 1 hour     | **EXACTLY 10** |
| 1-2 hours    | **EXACTLY 15** |
| 2-3 hours    | **EXACTLY 20** |
| > 3 hours    | **EXACTLY 25** |

⚠️ **These numbers are FIXED and NON-NEGOTIABLE.**  
⚠️ The system will NOT generate more or fewer questions.

---

## Question Design Guidelines

### Good Question Patterns ✅

```
✔ "According to the speaker, why is [concept] important?"
✔ "Which approach was recommended for solving [problem]?"
✔ "What common mistake did the instructor warn against when [doing X]?"
✔ "How did the speaker differentiate between [concept A] and [concept B]?"
✔ "In the example shown, what was the outcome of [specific action]?"
✔ "What analogy was used to explain [concept]?"
✔ "What did the speaker say happens when you [do X]?"
```

### Forbidden Question Patterns ❌

```
✗ "What is the title of this video?"
✗ "How long is the video?"
✗ "Who uploaded this video?"
✗ "When was the video published?"
✗ "How many views does the video have?"
✗ "What is the channel name?"
```

### Focus Areas

1. **Conceptual Understanding**
   - Not just "what is X" but "why does X work" or "when should you use X"

2. **Application-Based**
   - Scenario questions that test understanding through application
   - "What would happen if..." questions

3. **Comparison & Contrast**
   - Questions about distinctions made in the video
   - Advantages/disadvantages discussed

4. **Best Practices & Pitfalls**
   - Common mistakes warned about
   - Recommended approaches explained

---

## MCQ Format

Each MCQ must include:

```json
{
  "question": "Clear, specific question based on video content",
  "options": [
    "Option A",
    "Option B", 
    "Option C",
    "Option D"
  ],
  "answerIndex": 0,  // Index of correct answer (0-3)
  "explanation": "Brief explanation referencing what was explained in the video"
}
```

---

## Validation Checklist

Before generating each question, ask:

1. **Content Source**
   - ✓ Does this question reference actual video content?
   - ✗ Could this be answered from the title alone?

2. **Specificity**
   - ✓ Does this test comprehension of what was explained?
   - ✗ Is this generic knowledge about the topic?

3. **Video Dependency**
   - ✓ Must someone watch the video to answer this?
   - ✗ Can someone Google the answer without watching?

4. **MCQ Count**
   - ✓ Have I generated EXACTLY the required number of MCQs?

---

## API Usage

### Request Format

```http
POST /api/generate
Content-Type: application/json

{
  "videoIdentifier": "unique-video-id",
  "pageTitle": "Video Title",
  "domain": "youtube.com",
  "pageUrl": "https://youtube.com/watch?v=...",
  "videoSrc": "video-url",
  "contentType": "quiz",
  "transcript": "Full video transcript...",
  "videoDuration": 3600  // Duration in seconds (optional)
}
```

### Response Format

```json
{
  "success": true,
  "cached": false,
  "generatedData": {
    "type": "quiz",
    "title": "Video Content Comprehension Quiz",
    "mcqCount": 10,
    "videoDuration": 3600,
    "questions": [
      {
        "question": "According to the speaker, what is the main advantage of using async/await?",
        "options": [
          "It makes code more readable and easier to debug",
          "It makes code run faster",
          "It reduces memory usage",
          "It automatically handles all errors"
        ],
        "answerIndex": 0,
        "explanation": "The instructor emphasized that async/await syntax makes asynchronous code look synchronous, improving readability"
      }
    ]
  }
}
```

---

## Implementation Details

### MCQ Count Calculation

```javascript
function calculateMCQCount(durationInSeconds) {
  const durationInHours = durationInSeconds / 3600;
  
  if (durationInHours < 1) return 10;
  else if (durationInHours < 2) return 15;
  else if (durationInHours < 3) return 20;
  else return 25;
}
```

### Duration Examples

- **30-minute video** (1800s) → 10 MCQs
- **45-minute video** (2700s) → 10 MCQs
- **1.5-hour video** (5400s) → 15 MCQs
- **2.5-hour video** (9000s) → 20 MCQs
- **4-hour video** (14400s) → 25 MCQs

---

## Examples

### Example 1: Programming Tutorial

**Bad Question** ❌
```
Q: What programming language is covered in this video?
```
*Problem: Can be answered from video title/thumbnail*

**Good Question** ✅
```
Q: According to the instructor, what is the main reason why beginners 
   struggle with managing state in React components?

A) They don't understand JavaScript closures
B) They try to mutate state directly instead of using setState
C) They create too many state variables
D) They forget to import useState

Answer: B
Explanation: The instructor specifically warned that directly mutating 
state is a common mistake and explained why setState must be used.
```

### Example 2: Science Lecture

**Bad Question** ❌
```
Q: Who discovered DNA?
```
*Problem: General knowledge, not specific to video content*

**Good Question** ✅
```
Q: In the experiment demonstrated, what happened when the temperature 
   was increased above 75°C?

A) The enzyme activity increased exponentially
B) The enzyme became denatured and stopped functioning
C) The reaction rate doubled
D) Nothing changed

Answer: B
Explanation: The lecturer showed a graph demonstrating how the enzyme 
lost its structure and function at high temperatures.
```

---

## Quality Assurance

### Final Check Before Output

For each MCQ, verify:

- [ ] Question requires watching the video to answer
- [ ] Question references specific content from transcript
- [ ] Options are plausible to someone who hasn't watched
- [ ] Explanation cites what was said/shown in video
- [ ] Total MCQ count matches the required number EXACTLY

### Logging

The system logs:
- Video duration and calculated MCQ count
- Warning if generated count doesn't match expected count
- Generation success/failure

---

## Error Handling

### If Video Duration is Not Provided

- **Default**: Generate 10 MCQs
- **Log**: "Video duration not provided, defaulting to 10 MCQs"

### If Transcript is Too Short

- **Behavior**: Generate with available content
- **Recommendation**: Minimum transcript length should support required MCQ count

### If Generated Count Mismatches

- **Warning**: System logs discrepancy
- **Metadata**: Includes both expected and actual count in response

---

## Best Practices for Implementation

1. **Always extract video duration** when fetching transcripts
2. **Pass duration** to the generation endpoint
3. **Cache generated quizzes** by video ID and content type
4. **Validate responses** to ensure MCQ count compliance
5. **Monitor logs** for generation quality issues

---

## Conclusion

This system ensures that quizzes are:
- ✅ **Valid**: Based on actual video content
- ✅ **Consistent**: Fixed MCQ count per video length
- ✅ **Meaningful**: Test comprehension, not memorization
- ✅ **Useful**: Help users verify they understood the content

For questions or issues, check the logs in the backend service.
