# Quiz Generation System - Quick Reference

## tl;dr

This system generates **video content comprehension quizzes** with:
- ✅ **Fixed MCQ counts**: 10/15/20/25 based on video length
- ✅ **Strict content rules**: Questions ONLY from actual video content
- ✅ **No metadata questions**: Title, views, channel name, etc. are forbidden

---

## MCQ Count Rules

| Video Length | MCQs |
|--------------|------|
| < 1 hour     | 10   |
| 1-2 hours    | 15   |
| 2-3 hours    | 20   |
| > 3 hours    | 25   |

**Examples:**
- 45-minute tutorial → 10 MCQs
- 90-minute lecture → 15 MCQs
- 2.5-hour course → 20 MCQs
- 4-hour workshop → 25 MCQs

---

## What Makes a Valid Question?

### ✅ Good (Content-Based)
```
"According to the speaker, why should you avoid mutating state directly in React?"
"In the example shown, what happened when the temperature exceeded 75°C?"
"What analogy did the instructor use to explain closures?"
"What common mistake did the speaker warn against when using async/await?"
```

### ❌ Bad (Metadata/Generic)
```
"What is the title of this video?"
"How long is the video?"
"Who created this video?"
"What is a closure?" (generic definition)
```

---

## Quick Test

Run the test suite:
```bash
cd backend
npm run test:quiz
```

This will:
1. Test all duration ranges (10/15/20/25 MCQs)
2. Validate question quality
3. Check for forbidden patterns
4. Show sample questions

---

## API Request Example

```javascript
POST /api/generate

{
  "videoIdentifier": "xyz123",
  "pageTitle": "React Hooks Tutorial",
  "domain": "youtube.com",
  "pageUrl": "https://youtube.com/watch?v=...",
  "videoSrc": "https://...",
  "contentType": "quiz",
  "transcript": "Today I'll explain React hooks...",
  "videoDuration": 3600  // ← Duration in seconds
}
```

**Response:**
```javascript
{
  "success": true,
  "generatedData": {
    "type": "quiz",
    "mcqCount": 10,           // ← Automatically calculated
    "videoDuration": 3600,
    "questions": [...]
  }
}
```

---

## Files Changed

1. **`backend/src/services/gemini.js`** - MCQ logic & AI prompt
2. **`backend/src/controllers/contentController.js`** - Duration handling
3. **`backend/src/middleware/validation.js`** - Duration validation
4. **`extension/src/content/index.jsx`** - Extract video duration

---

## Validation Checklist

Before each question, ask:
- [ ] Does this question reference actual video content?
- [ ] Can someone answer this WITHOUT watching?
- [ ] Is this about metadata (title, views, etc.)?
- [ ] Does the explanation cite what was said in the video?

---

## Logging

**Backend logs:**
```
Generating new content: quiz React Hooks Tutorial
Video duration: 1.00 hours
Warning: Expected 10 MCQs but received 8  ← If count mismatch
```

**Frontend logs:**
```
Video duration: 1h 30m (5400s)
```

---

## Common Issues & Solutions

### Issue: Wrong MCQ count generated
**Solution:** Check backend logs for warnings; AI may need stricter enforcement

### Issue: Generic questions appear
**Solution:** Questions should fail validation; review transcript quality

### Issue: No video duration extracted
**Solution:** Check if `video.duration` is available; defaults to 10 MCQs

---

## Documentation

- **Full Rules**: `QUIZ_GENERATION_RULES.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_REFERENCE.md`

---

## Example Output

**Question:**
> According to the instructor, what is the main reason developers struggle with closures in loops?

**Options:**
- A) Closures don't work with loops
- B) All closures reference the same variable value
- C) Loops are too slow with closures
- D) You can't use var in loops

**Answer:** B

**Explanation:** The speaker specifically demonstrated how all closures in a loop can end up capturing the same variable, explaining this is a common gotcha.

---

## Key Principle

> **Questions must be unanswerable without watching the video.**

If you can Google the answer or guess from the title, **it's invalid**.

---

For detailed documentation, see `QUIZ_GENERATION_RULES.md`
