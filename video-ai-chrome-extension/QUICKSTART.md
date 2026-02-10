# Video AI Extension - Quick Start Guide

## 🚀 Fast Setup (5 Minutes)

### 1. Prerequisites Check
- ✅ Node.js installed? Run: `node --version` (need v18+)
- ✅ MongoDB Compass installed?
- ✅ Gemini API key? Get at: https://makersuite.google.com/app/apikey

### 2. MongoDB Setup (1 min)
1. Open MongoDB Compass
2. Connect: `mongodb://127.0.0.1:27017`
3. Create database: `video_ai_extension`
4. Create collection: `generatedcontents`

### 3. Backend Setup (2 min)

```powershell
cd c:\Rudra\video-ai-chrome-extension\backend
npm install
```

Create `.env` file:
```env
GEMINI_API_KEY=YOUR_KEY_HERE
MONGO_URI=mongodb://127.0.0.1:27017/video_ai_extension
PORT=5000
NODE_ENV=development
```

Start server:
```powershell
npm start
```

### 4. Extension Setup (2 min)

```powershell
cd ..\extension
npm install
npm run build
```

Load in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension\dist` folder

### 5. Dashboard Setup (Optional)

```powershell
cd ..\dashboard
npm install
npm run dev
```

## ✅ Verify Installation

1. Backend running? → Open http://localhost:5000/health
2. Extension loaded? → See icon in Chrome toolbar
3. Dashboard running? → Open http://localhost:3000

## 🎮 First Test

1. Go to any website with a video (e.g., YouTube)
2. Play video until end
3. Choose "Quiz" or "Q&A"
4. Wait for AI generation
5. View your content!

## 📌 Quick Commands Reference

```powershell
# Start Backend
cd backend
npm start

# Build Extension
cd extension
npm run build

# Start Dashboard
cd dashboard
npm run dev
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB is running in Compass |
| Extension not working | Refresh page after installing |
| API errors | Verify Gemini API key in `.env` |
| Videos not detected | Check console, refresh page |

## 🎯 Next Steps

- Read full README.md for details
- Customize AI prompts in `backend/src/services/gemini.js`
- Change extension icons in `extension/public/`
- Deploy dashboard to production

---

**Need help?** Check the main README.md file!
