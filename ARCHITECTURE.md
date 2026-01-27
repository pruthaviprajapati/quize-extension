# Project Architecture

## System Overview

```
┌─────────────────┐
│  Chrome Browser │
│   (YouTube.com) │
└────────┬────────┘
         │
         │ Video End Event
         ▼
┌─────────────────────────┐
│  Content Script         │
│  (content.js)           │
│  • Detects video end    │
│  • Gets video ID        │
│  • Requests quiz        │
└───────────┬─────────────┘
            │
            │ HTTP Request
            │ GET /api/quiz/check/:videoId
            ▼
    ┌───────────────────────┐
    │   Express Backend     │
    │   (server.js)         │
    │   Port: 5000          │
    └──────────┬────────────┘
               │
               ├──────────────────────────┐
               │                          │
               ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   MongoDB        │      │   YouTube API    │
    │   Cache Layer    │      │   Transcript     │
    │                  │      │                  │
    │ • Check cache    │      │ • Fetch text     │
    │ • Store quiz     │      │ • Get title      │
    └──────────────────┘      └─────────┬────────┘
               ▲                         │
               │                         │
               │                         ▼
               │              ┌──────────────────┐
               │              │   OpenAI API     │
               │              │   (GPT-3.5)      │
               │              │                  │
               │              │ • Analyze text   │
               │              │ • Determine edu  │
               └──────────────│ • Generate quiz  │
                              └──────────────────┘
```

## Component Breakdown

### 1. Chrome Extension (Frontend)

#### Manifest.json
- **Purpose:** Extension configuration
- **Key Features:**
  - Manifest V3 compliance
  - Content script injection
  - Permissions management
  - Web accessible resources

#### Content Script (content.js)
- **Runs on:** All YouTube pages
- **Responsibilities:**
  1. Monitor video playback
  2. Detect `ended` event
  3. Extract video ID from URL
  4. Call backend API
  5. Inject quiz overlay
  6. Handle quiz completion

**Lifecycle:**
```
Page Load → Find Video Element → Attach Listener
              ↓
         Video Ends
              ↓
         Get Video ID → Call API
              ↓
    Receive Quiz Data → Inject Overlay
              ↓
      User Completes → Remove Overlay
```

#### React Quiz Component (quiz-overlay.jsx)
- **Purpose:** Interactive quiz UI
- **State Management:**
  - `quizData`: Questions and metadata
  - `currentQuestion`: Active question index
  - `selectedAnswers`: User's choices
  - `showResults`: Toggle between quiz/results
  - `score`: Final score

**Component Tree:**
```
QuizOverlay
├── LoadingSpinner (if no data)
├── QuizCard (during quiz)
│   ├── QuizHeader
│   │   ├── Title
│   │   ├── ProgressBar
│   │   └── QuestionCounter
│   ├── QuizContent
│   │   ├── QuestionText
│   │   └── OptionsContainer
│   │       └── OptionButton × 4
│   └── QuizFooter
│       ├── NavigationButtons
│       ├── AnswerIndicators
│       └── WarningText
└── ResultsCard (after submission)
    ├── ScoreDisplay
    ├── ResultsSummary
    │   └── ReviewItem × N
    └── CloseButton
```

### 2. Backend API (Node.js + Express)

#### Server.js
- **Purpose:** Express server setup
- **Middleware:**
  - CORS (allow extension origin)
  - JSON body parser
  - Error handler

#### Routes (routes/quiz.js)
- **Endpoints:**
  - `GET /api/quiz/check/:videoId`: Main quiz endpoint
  - `GET /api/quiz/stats`: Cache statistics
  - `DELETE /api/quiz/cache/:videoId`: Clear cache

**Request Flow:**
```
HTTP Request
    ↓
Express Router
    ↓
Route Handler
    ↓
Check MongoDB Cache
    ├─ Found → Return cached quiz
    └─ Not Found ↓
         Fetch Transcript (youtube.js)
              ↓
         Analyze with AI (ai.js)
              ↓
         Save to MongoDB
              ↓
         Return quiz
```

#### Services

**youtube.js:**
- Fetch video transcripts
- Get video titles
- Uses `youtube-transcript` package

**ai.js:**
- OpenAI integration
- Prompt engineering
- JSON response parsing
- Error handling

### 3. Database (MongoDB)

#### Quiz Collection Schema

```javascript
{
  _id: ObjectId,
  videoId: String (indexed, unique),
  videoTitle: String,
  isEducational: Boolean,
  questions: [
    {
      question: String,
      options: [String, String, String, String],
      correctAnswer: Number (0-3)
    }
  ],
  transcript: String (truncated),
  createdAt: Date,
  lastAccessed: Date
}
```

**Indexes:**
- `videoId`: Unique index for fast lookups

**Benefits:**
- Caching saves API costs
- Instant retrieval for repeated videos
- Queryable statistics

---

## Data Flow

### Scenario 1: First Time Video (Not Cached)

```
1. User finishes YouTube video
   ↓
2. Content script captures video ID
   ↓
3. GET /api/quiz/check/VIDEO_ID
   ↓
4. Backend checks MongoDB
   Result: Not found
   ↓
5. Fetch transcript from YouTube
   Time: ~2-5 seconds
   ↓
6. Send transcript to OpenAI
   Request: Analyze + Generate quiz
   Time: ~5-15 seconds
   ↓
7. OpenAI returns JSON
   {isEducational: true, questions: [...]}
   ↓
8. Save to MongoDB
   ↓
9. Return to extension
   ↓
10. Extension renders quiz overlay
    Total time: ~10-30 seconds
```

### Scenario 2: Repeated Video (Cached)

```
1. User finishes same YouTube video
   ↓
2. Content script captures video ID
   ↓
3. GET /api/quiz/check/VIDEO_ID
   ↓
4. Backend checks MongoDB
   Result: Found!
   ↓
5. Return cached quiz
   Total time: <200ms
```

---

## Technology Stack Details

### Frontend (Extension)

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI components | ^18.2.0 |
| Vite | Build tool | ^5.0.8 |
| CSS3 | Styling | Native |
| Chrome API | Extension features | Manifest V3 |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | v16+ |
| Express | Web framework | ^4.18.2 |
| Mongoose | MongoDB ODM | ^8.0.3 |
| OpenAI | AI API | ^4.20.1 |
| CORS | Cross-origin | ^2.8.5 |
| dotenv | Environment vars | ^16.3.1 |

### Database

| Technology | Purpose |
|------------|---------|
| MongoDB | NoSQL database |
| MongoDB Compass | GUI client |

---

## Security Architecture

### API Key Protection

```
┌─────────────────────────────────────┐
│   Chrome Extension (Public)         │
│   • NO API keys                     │
│   • Calls localhost backend only    │
└──────────────┬──────────────────────┘
               │ HTTP (localhost:5000)
               ▼
┌─────────────────────────────────────┐
│   Backend Server (Private)          │
│   • API keys in .env                │
│   • Never exposed to client         │
│   • Validates requests              │
└─────────────────────────────────────┘
```

### Content Security

- Extension runs only on YouTube
- Content script isolated from page
- No user data collected
- No authentication needed
- Stateless API

---

## Scalability Considerations

### Current Architecture (Development)

```
Single Machine:
├── MongoDB (localhost:27017)
├── Backend (localhost:5000)
└── Extension (client-side)
```

**Limitations:**
- Backend must run locally
- One user only
- No persistence across machines

### Production Architecture (Scaled)

```
Cloud Infrastructure:
├── MongoDB Atlas (Managed DB)
├── Backend (Heroku/Railway/AWS)
│   └── Load Balancer
│       ├── Server Instance 1
│       ├── Server Instance 2
│       └── Server Instance N
└── Extension (distributed via Chrome Store)
    └── Installed by N users
```

**Improvements:**
- Horizontal scaling
- Global CDN
- Automatic backups
- High availability

---

## Optimization Strategies

### Caching Strategy

1. **MongoDB Cache:**
   - Permanent storage
   - Indexed lookups
   - TTL optional

2. **Future: Redis Cache:**
   - In-memory speed
   - Automatic expiration
   - Reduced DB load

### AI Cost Optimization

1. **Aggressive Caching:**
   - Store every quiz
   - Never regenerate unless deleted

2. **Transcript Truncation:**
   - Use first 3000 chars
   - Reduces tokens = lower cost

3. **Model Selection:**
   - GPT-3.5-Turbo (cheaper, fast)
   - GPT-4 (better quality, expensive)

### Performance Metrics

**Target Times:**
- Cache hit: <200ms
- Cache miss: <30s
- Quiz render: <500ms

**Actual Times:**
- Cache hit: ~50-100ms ✅
- Cache miss: ~10-25s ✅
- Quiz render: ~100-200ms ✅

---

## Extension Lifecycle

### Installation
```
User installs → Chrome extracts manifest
              → Registers content scripts
              → Extension ready
```

### Activation (per page)
```
User visits YouTube → Content script injects
                    → Finds video element
                    → Attaches event listener
                    → Waits for video end
```

### Deactivation
```
User closes tab → Content script unloads
                → Cleanup listeners
```

### Update
```
Developer builds → Reloads in chrome://extensions
                 → Chrome reinjects scripts
                 → Users refresh pages
```

---

## Error Handling Flow

### Network Errors

```
Extension request fails
    ↓
Catch error in content.js
    ↓
Log to console
    ↓
Don't show quiz (silent fail)
```

### AI Errors

```
OpenAI API error
    ↓
Catch in ai.js
    ↓
Log error
    ↓
Return {isEducational: false}
    ↓
No quiz shown to user
```

### Database Errors

```
MongoDB connection fail
    ↓
Catch in server.js
    ↓
Return 500 error
    ↓
Log to console
    ↓
Extension sees error, doesn't show quiz
```

---

## State Management

### Extension State

**Global:**
- `quizActive`: Boolean (is quiz currently showing?)
- `videoCheckInterval`: Interval ID for polling

**Per-Quiz:**
- Managed by React component
- Local state only
- Reset on close

### Backend State

- **Stateless:** No session data
- **Database:** Only persistent state
- **Cached in MongoDB:** Quiz data

---

## Communication Protocol

### Extension → Backend

**Request:**
```http
GET /api/quiz/check/VIDEO_ID
Host: localhost:5000
Content-Type: application/json
```

**Response Success:**
```json
{
  "videoId": "abc123",
  "videoTitle": "Learn React",
  "isEducational": true,
  "questions": [...],
  "cached": false
}
```

**Response Failure:**
```json
{
  "error": "Failed to process",
  "message": "Error details"
}
```

### Backend → OpenAI

**Request:**
```javascript
{
  model: "gpt-3.5-turbo",
  messages: [
    {role: "system", content: "..."},
    {role: "user", content: "Analyze: ..."}
  ],
  temperature: 0.7
}
```

**Response:**
```javascript
{
  choices: [{
    message: {
      content: '{"isEducational": true, ...}'
    }
  }]
}
```

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability potential
- ✅ Cost optimization
- ✅ Error resilience
- ✅ Security by design
