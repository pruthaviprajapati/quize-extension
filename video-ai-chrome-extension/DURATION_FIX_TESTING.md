# YouTube Duration Fix - Testing Guide

## Issue Fixed

YouTube videos with duration > 3 hours (like 3:11:11) were only generating 10 MCQs instead of 25.

## What Was Fixed

1. **Created YouTube-specific duration extractor** (`youtube.js`)
   - Extracts duration from `window.ytInitialPlayerResponse`
   - Parses duration from page metadata
   - Falls back to video element duration
   - Supports multiple YouTube data sources

2. **Enhanced logging**
   - Shows extracted duration in console
   - Displays expected MCQ count
   - Logs detailed generation parameters

## How to Test

### Step 1: Reload the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Find "Video AI Extension"
3. Click the **Reload** button (🔄 icon)

### Step 2: Test on YouTube

1. Go to a YouTube video with duration > 3 hours
   - Example: Any long lecture, course, or tutorial
2. Let the video play to the end (or skip to the end)
3. When the overlay appears, click **"Quiz"**

### Step 3: Check Console Logs

1. Press `F12` to open DevTools
2. Go to the **Console** tab
3. You should see:

```
[Video AI] Video duration: 3h 11m 11s (11471 seconds total)
[Video AI] Expected MCQ count: 25
```

### Step 4: Verify Backend

In the backend terminal, you should see:

```
============================================================
[Quiz Generation] Parameters:
  Video Duration: 11471s (3.19h)
  Required MCQs: 25
  Title: Your Video Title
============================================================
```

## Duration → MCQ Count Table

| Video Duration | Example    | MCQs Generated |
|----------------|------------|----------------|
| 0:00:00 - 0:59:59 | 45 min  | 10             |
| 1:00:00 - 1:59:59 | 1.5 hrs | 15             |
| 2:00:00 - 2:59:59 | 2.5 hrs | 20             |
| 3:00:00+          | 3:11:11 | **25**         |

## Troubleshooting

### Still Getting 10 MCQs?

**Check Console:**
```javascript
// Should see this:
[YouTube] Duration extracted: 11471 seconds

// If you see this instead:
[Duration] Could not extract video duration
```

**Solutions:**

1. **Clear cache and reload extension**
   ```
   chrome://extensions/ → Remove → Re-add
   ```

2. **Check if duration is being passed**
   - Open DevTools Network tab
   - Filter for `/api/generate`
   - Check request payload for `videoDuration` field

3. **Manual test in console**
   ```javascript
   // Run this in the YouTube page console:
   console.log(window.ytInitialPlayerResponse?.videoDetails?.lengthSeconds);
   ```

### Extension Not Rebuilding?

```bash
# Clean build
cd video-ai-chrome-extension\extension
rm -rf dist
npm run build
```

### Backend Not Receiving Duration?

Check the API request payload:
```javascript
// Should include:
{
  "videoDuration": 11471,  // ← Must be present
  "transcript": "...",
  // ... other fields
}
```

## YouTube Duration Extraction Methods

The extension tries these methods in order:

1. ✅ **`window.ytInitialPlayerResponse.videoDetails.lengthSeconds`** (Most reliable)
2. ✅ **`window.ytInitialData`** (Backup)
3. ✅ **`<meta itemprop="duration">`** (Metadata)
4. ✅ **Player time display** (`.ytp-time-duration`)
5. ✅ **JSON-LD structured data** (SEO data)
6. ✅ **Video element** (`video.duration`)

## Example Output

For a **3:11:11 video**, you should get:

```json
{
  "success": true,
  "generatedData": {
    "type": "quiz",
    "mcqCount": 25,           // ← Should be 25
    "videoDuration": 11471,
    "questions": [
      // ... 25 questions
    ]
  }
}
```

## Testing Different Durations

| Test Case | Duration | Expected MCQs |
|-----------|----------|---------------|
| Short tutorial | 0:45:00 | 10 |
| Medium lecture | 1:30:00 | 15 |
| Long course | 2:45:00 | 20 |
| **Your video** | 3:11:11 | **25** |
| Very long workshop | 5:00:00 | 25 |

## Quick Verification

Run this in the browser console on a YouTube video page:

```javascript
// Check if duration is available
const duration = window.ytInitialPlayerResponse?.videoDetails?.lengthSeconds;
console.log('Duration:', duration, 'seconds');

// Calculate expected MCQs
let mcqs;
if (duration < 3600) mcqs = 10;
else if (duration < 7200) mcqs = 15;
else if (duration < 10800) mcqs = 20;
else mcqs = 25;

console.log('Expected MCQs:', mcqs);
```

## Success Criteria

✅ Extension extracts 11471 seconds for 3:11:11 video  
✅ Console shows "Expected MCQ count: 25"  
✅ Backend receives `videoDuration: 11471`  
✅ Quiz generates exactly 25 MCQs  

## Common Issues

### Issue: "Duration not available"
**Cause:** YouTube hasn't loaded player data yet  
**Fix:** Wait for page to fully load before video ends

### Issue: Getting 10 instead of 25
**Cause:** Duration not being extracted  
**Fix:** Check console logs, verify YouTube page structure

### Issue: Backend shows "Duration: Unknown"
**Cause:** Duration not in API request  
**Fix:** Verify frontend extraction is working

---

## Need Help?

1. Check console logs (F12 → Console)
2. Check backend logs (terminal)
3. Verify request payload (F12 → Network)
4. Test with the verification script above

The fix should now work for all YouTube videos! 🎉
