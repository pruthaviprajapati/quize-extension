# Project Directory Structure

```
youtube-quiz-extension/
│
├── README.md                           # Main documentation
├── QUICKSTART.md                       # Quick start guide
│
├── extension/                          # Chrome Extension Frontend
│   ├── manifest.json                   # Extension configuration (Manifest V3)
│   ├── content.js                      # Content script (video detection)
│   ├── popup.html                      # Extension popup interface
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite build configuration
│   ├── .gitignore                      # Git ignore rules
│   │
│   ├── icons/                          # Extension icons
│   │   ├── icon16.png                  # 16x16 icon
│   │   ├── icon48.png                  # 48x48 icon
│   │   └── icon128.png                 # 128x128 icon
│   │
│   ├── src/                            # React source files
│   │   ├── quiz-overlay.jsx            # Quiz UI component
│   │   └── quiz-overlay.css            # Quiz styles
│   │
│   └── dist/                           # Build output (generated)
│       ├── quiz-overlay.js             # Compiled React bundle
│       └── quiz-overlay.css            # Compiled CSS
│
└── backend/                            # Node.js Backend API
    ├── server.js                       # Express server entry point
    ├── package.json                    # Backend dependencies
    ├── .env.example                    # Environment variables template
    ├── .env                            # Actual environment variables (git-ignored)
    ├── .gitignore                      # Git ignore rules
    │
    ├── models/                         # MongoDB models
    │   └── Quiz.js                     # Quiz schema definition
    │
    ├── routes/                         # API route handlers
    │   └── quiz.js                     # Quiz endpoints
    │
    └── services/                       # Business logic services
        ├── youtube.js                  # YouTube transcript fetching
        └── ai.js                       # OpenAI/Gemini integration
```

## File Descriptions

### Extension Files

- **manifest.json**: Chrome extension configuration with permissions and scripts
- **content.js**: Runs on YouTube pages, detects video end events
- **popup.html**: Shows extension status in toolbar popup
- **quiz-overlay.jsx**: React component for the quiz interface
- **quiz-overlay.css**: Styling for the quiz overlay

### Backend Files

- **server.js**: Express server setup and middleware
- **Quiz.js**: MongoDB schema for cached quizzes
- **quiz.js**: API routes for quiz operations
- **youtube.js**: Service to fetch video transcripts
- **ai.js**: AI integration for quiz generation

### Configuration Files

- **package.json**: Lists dependencies and scripts
- **.env**: Stores API keys and configuration (not in git)
- **vite.config.js**: Build configuration for React
- **.gitignore**: Files to exclude from version control
