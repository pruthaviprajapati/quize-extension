# Video AI Chrome Extension - Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Webpage with HTML5 Video                              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Content Script (Video Detection)                │  │ │
│  │  │  - MutationObserver for dynamic videos           │  │ │
│  │  │  - Event listeners on <video> elements           │  │ │
│  │  │  - Transcript extraction                          │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Overlay (Shadow DOM)                            │  │ │
│  │  │  - React UI components                            │  │ │
│  │  │  - Quiz/Q&A rendering                             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Extension Popup                                       │ │
│  │  - History list                                        │  │
│  │  - Filters (All/Quiz/Q&A)                             │  │
│  │  - Preview viewer                                      │  │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Express)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes & Controllers                                  │ │
│  │  - /api/generate (POST)                                │ │
│  │  - /api/history (GET)                                  │ │
│  │  - /api/history/:id (GET)                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware                                            │ │
│  │  - CORS validation                                     │ │
│  │  - Rate limiting                                       │ │
│  │  - Request validation                                  │ │
│  │  - Error handling                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services                                              │ │
│  │  - Gemini AI client                                    │ │
│  │  - Content generation logic                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
          │                                    │
          │ MongoDB Driver                     │ Google Gemini API
          ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────────┐
│  MongoDB Database    │          │  Google Gemini Service   │
│                      │          │                          │
│  - generatedcontents │          │  - gemini-1.5-flash      │
│  - Indexes           │          │  - JSON responses        │
└──────────────────────┘          └──────────────────────────┘
```

## Component Details

### 1. Content Script (`extension/src/content/index.jsx`)

**Responsibilities:**
- Detect all `<video>` elements on page load
- Use MutationObserver to detect dynamically added videos
- Attach `ended` event listeners
- Extract video metadata (src, page title, domain, URL)
- Generate unique video identifier (SHA-256)
- Extract transcript from `<track>` elements or fallback to page text
- Trigger overlay UI when video ends

**Key Technologies:**
- Vanilla JavaScript for DOM manipulation
- Web Crypto API for SHA-256 hashing
- MutationObserver API
- WeakSet for tracking processed videos

### 2. Overlay UI (`extension/src/content/overlay.jsx`)

**Responsibilities:**
- Render in Shadow DOM for style isolation
- Show choice overlay (Quiz vs Q&A)
- Handle content generation via API call
- Render quiz with mandatory completion
- Render Q&A with optional viewing
- Disable page scrolling during quiz

**Key Features:**
- Fullscreen z-index (2147483647)
- Shadow DOM prevents style conflicts
- React state management
- API integration

### 3. Extension Popup (`extension/src/popup/PopupApp.jsx`)

**Responsibilities:**
- Display content history
- Filter by type (All/Quiz/Q&A)
- Preview content inline
- Link to dashboard

**API Calls:**
- GET `/api/history?type=...`
- GET `/api/history/:contentId`

### 4. Backend API (`backend/src/`)

#### Routes (`routes/content.js`)
```
POST   /api/generate        - Generate or retrieve cached content
GET    /api/history         - List all content (with optional filter)
GET    /api/history/:id     - Get specific content by ID
```

#### Controllers (`controllers/contentController.js`)
- Handle request/response logic
- Check MongoDB cache
- Call Gemini service if needed
- Save to database
- Return formatted responses

#### Services (`services/gemini.js`)
- Initialize Google Gemini client
- Build prompts for Quiz/Q&A generation
- Parse and validate JSON responses
- Handle API errors

#### Models (`models/GeneratedContent.js`)
- Mongoose schema definition
- Compound unique index for caching
- Timestamp handling

#### Middleware
- `validation.js` - Input sanitization with express-validator
- `rateLimiter.js` - Rate limiting per IP
- `errorHandler.js` - Centralized error responses

### 5. Database Schema

```javascript
{
  contentId: String,           // UUID v4
  videoIdentifier: String,     // SHA-256(domain|pageUrl|videoSrc)
  pageTitle: String,
  domain: String,
  pageUrl: String,
  videoSrc: String,
  contentType: "quiz" | "qa",
  generatedData: {
    type: String,
    title: String,
    questions: [...],  // For quiz
    qa: [...]          // For Q&A
  },
  createdAt: Date
}
```

**Indexes:**
- `{ videoIdentifier: 1, contentType: 1 }` - Unique compound (caching)
- `{ createdAt: -1 }` - Sort by date

### 6. Dashboard (`dashboard/src/`)

**Components:**
- `App.jsx` - Main layout and routing
- `ContentList.jsx` - Grid view with filters
- `ContentPreview.jsx` - Full content viewer

**Features:**
- Responsive grid layout
- Beautiful gradient design
- Real-time filtering
- Detailed preview with syntax highlighting

## Data Flow

### Content Generation Flow

1. **Video Ends**
   ```
   User watches video → Video ends → Content script detects
   ```

2. **Metadata Collection**
   ```
   Extract: videoSrc, pageTitle, domain, pageUrl, transcript
   Generate: videoIdentifier = SHA-256(domain|pageUrl|videoSrc)
   ```

3. **User Choice**
   ```
   Show overlay → User selects "Quiz" or "Q&A"
   ```

4. **API Request**
   ```javascript
   POST /api/generate
   {
     videoIdentifier: "abc123...",
     pageTitle: "...",
     domain: "...",
     pageUrl: "...",
     videoSrc: "...",
     contentType: "quiz",
     transcript: "..."
   }
   ```

5. **Backend Processing**
   ```
   Check cache → If found: return cached
              → If not: Generate with Gemini → Save to MongoDB → Return
   ```

6. **Content Display**
   ```
   Quiz: Fullscreen interactive → Answer all → Submit → See results
   Q&A: Readable overlay → Can close anytime
   ```

## Security Architecture

### Defense Layers

1. **API Key Protection**
   - Key stored in backend `.env` only
   - Never sent to browser
   - Environment variable isolation

2. **CORS Protection**
   ```javascript
   origin: function (origin, callback) {
     if (!origin || 
         origin.startsWith('chrome-extension://') ||
         allowedOrigins.includes(origin)) {
       callback(null, true);
     }
   }
   ```

3. **Rate Limiting**
   - Generate: 20 req/15min per IP
   - History: 100 req/15min per IP
   - Prevents abuse and cost overruns

4. **Input Validation**
   - All inputs validated with express-validator
   - Transcript max 50,000 chars
   - Type checking on all fields

5. **Error Handling**
   - No stack traces in production
   - Generic error messages
   - Detailed logging server-side only

## Caching Strategy

### Why Cache?

- **Cost**: Gemini API calls cost money
- **Speed**: Instant responses for repeated requests
- **Reliability**: Works even if API is down

### Cache Key

```javascript
videoIdentifier + contentType
```

Example:
- Video: `https://example.com/video.mp4` on `example.com/watch`
- Type: `quiz`
- Cache key: `SHA-256(example.com|https://example.com/watch|https://example.com/video.mp4)` + `quiz`

### Cache Hit Logic

```javascript
const existing = await GeneratedContent.findOne({
  videoIdentifier,
  contentType
});

if (existing) {
  return cached response;
}
// Generate new...
```

## Scalability Considerations

### Current Limitations

- Single server (no load balancing)
- MongoDB local instance
- No CDN for static assets
- No caching layer (Redis)

### Production Scaling Options

1. **Database**
   - Use MongoDB Atlas with replicas
   - Add connection pooling
   - Implement TTL for old content

2. **API Server**
   - Deploy to cloud (AWS, GCP, Azure)
   - Use container orchestration (Docker + Kubernetes)
   - Add Redis for session/cache layer
   - Implement horizontal scaling

3. **Extension**
   - Publish to Chrome Web Store
   - Use CDN for dashboard
   - Implement offline mode with IndexedDB

4. **Monitoring**
   - Add logging (Winston, Morgan)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - Usage analytics

## Development Workflow

### Extension Development

```bash
cd extension
npm run dev       # Watch mode (manual reload needed)
npm run build     # Production build
```

Reload extension after changes:
1. Go to `chrome://extensions/`
2. Click reload icon on extension

### Backend Development

```bash
cd backend
npm run dev       # Auto-restart on changes
npm start         # Production mode
```

### Dashboard Development

```bash
cd dashboard
npm run dev       # Hot reload at localhost:3000
npm run build     # Production build
```

## Testing Recommendations

### Manual Testing Checklist

- [ ] Video detection on YouTube
- [ ] Video detection on custom site
- [ ] Dynamic video loading (SPA)
- [ ] Quiz generation works
- [ ] Q&A generation works
- [ ] Quiz mandatory completion
- [ ] Score calculation correct
- [ ] History list shows items
- [ ] Preview works in popup
- [ ] Dashboard displays content
- [ ] Caching works (duplicate request)
- [ ] Rate limiting triggers
- [ ] Error handling graceful

### Automated Testing (Future)

- Unit tests for utilities
- Integration tests for API
- E2E tests for extension flow
- Load testing for backend

## Maintenance

### Regular Tasks

- Monitor Gemini API usage/costs
- Clean old content (optional TTL)
- Update dependencies
- Review error logs
- Check rate limit effectiveness

### Version Updates

- Extension: Update manifest version
- Backend: Update package.json version
- Database: Plan migrations if schema changes

---

**Architecture designed for:**
- ✅ Simplicity
- ✅ Security
- ✅ Scalability
- ✅ Maintainability
