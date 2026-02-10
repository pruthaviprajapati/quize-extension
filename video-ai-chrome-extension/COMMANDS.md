# Common Commands Reference

## 🚀 Quick Start Commands

### Initial Setup (One-time)
```powershell
# Run automated setup script
.\setup.ps1

# Or manually:
cd backend ; npm install
cd ..\extension ; npm install
cd ..\dashboard ; npm install
```

### Start Development

```powershell
# Terminal 1: Backend Server
cd c:\Rudra\video-ai-chrome-extension\backend
npm start

# Terminal 2 (Optional): Dashboard
cd c:\Rudra\video-ai-chrome-extension\dashboard
npm run dev
```

## 🔧 Backend Commands

```powershell
cd backend

# Install dependencies
npm install

# Start server (production mode)
npm start

# Start server with auto-reload (development)
npm run dev

# Test server is running
curl http://localhost:5000/health
# Or open in browser: http://localhost:5000/health
```

## 🎨 Extension Commands

```powershell
cd extension

# Install dependencies
npm install

# Build extension
npm run build

# Development mode (watch files, manual reload needed)
npm run dev

# Preview built extension
npm run preview
```

After building:
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `c:\Rudra\video-ai-chrome-extension\extension\dist`

## 🌐 Dashboard Commands

```powershell
cd dashboard

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🗄️ MongoDB Commands

### Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to: `mongodb://127.0.0.1:27017`
3. Browse `video_ai_extension` database
4. View `generatedcontents` collection

### Using MongoDB Shell (CLI)
```bash
# Connect to MongoDB
mongosh

# List databases
show dbs

# Use database
use video_ai_extension

# List collections
show collections

# View all documents
db.generatedcontents.find().pretty()

# Count documents
db.generatedcontents.countDocuments()

# Find by type
db.generatedcontents.find({ contentType: "quiz" })

# Delete all data (careful!)
db.generatedcontents.deleteMany({})

# Exit
exit
```

## 🔍 Testing & Debugging

### Check Backend is Running
```powershell
# PowerShell
Invoke-WebRequest -Uri http://localhost:5000/health

# Or use browser
# Open: http://localhost:5000/health
```

### Check Extension Logs
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Filter by "Video AI" messages

### Check Background Script Logs
1. Go to `chrome://extensions/`
2. Find "Video AI Generator"
3. Click "service worker" link
4. View console logs

### Test API Endpoints

#### Test Generate Endpoint
```powershell
# PowerShell
$body = @{
    videoIdentifier = "test123"
    pageTitle = "Test Video"
    domain = "example.com"
    pageUrl = "https://example.com/test"
    videoSrc = "https://example.com/video.mp4"
    contentType = "quiz"
    transcript = "This is a test transcript about science and technology."
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/generate `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

#### Test History Endpoint
```powershell
# Get all history
Invoke-WebRequest -Uri http://localhost:5000/api/history

# Get quiz only
Invoke-WebRequest -Uri http://localhost:5000/api/history?type=quiz

# Get Q&A only
Invoke-WebRequest -Uri http://localhost:5000/api/history?type=qa
```

## 🛠️ Development Workflow

### Making Changes to Extension

1. Edit files in `extension/src/`
2. Rebuild:
   ```powershell
   cd extension
   npm run build
   ```
3. Go to `chrome://extensions/`
4. Click reload button on extension
5. Refresh webpage to test

### Making Changes to Backend

1. Edit files in `backend/src/`
2. If using `npm run dev`: auto-restarts
3. If using `npm start`: restart manually:
   ```powershell
   # Press Ctrl+C to stop
   npm start  # Start again
   ```

### Making Changes to Dashboard

1. Edit files in `dashboard/src/`
2. If `npm run dev` is running: auto-reloads
3. Check browser at `http://localhost:3000`

## 📦 Building for Production

### Extension
```powershell
cd extension
npm run build

# Output in: extension/dist/
# Zip this folder for Chrome Web Store submission
```

### Backend
```powershell
cd backend

# Set environment to production
# Edit .env:
NODE_ENV=production

# Start server
npm start
```

### Dashboard
```powershell
cd dashboard
npm run build

# Output in: dashboard/dist/
# Deploy this folder to Vercel/Netlify/etc
```

## 🧹 Cleanup Commands

### Remove Dependencies
```powershell
# Remove all node_modules
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force extension\node_modules
Remove-Item -Recurse -Force dashboard\node_modules

# Remove build outputs
Remove-Item -Recurse -Force extension\dist
Remove-Item -Recurse -Force dashboard\dist
```

### Reset Database
```bash
# Using mongosh
mongosh
use video_ai_extension
db.generatedcontents.deleteMany({})
exit
```

## 📊 Monitoring Commands

### Check Server Logs
```powershell
cd backend
npm start

# Watch for:
# ✓ Connected to MongoDB
# ✓ Server running on http://localhost:5000
```

### Check Database Contents
```bash
mongosh
use video_ai_extension
db.generatedcontents.find().count()
db.generatedcontents.find().limit(5).pretty()
```

### Check Extension Status
1. `chrome://extensions/` - Ensure enabled
2. Click extension icon - Check popup opens
3. Check background script logs - No errors

## 🔐 Environment Variables

### Backend .env File
```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://127.0.0.1:27017/video_ai_extension
PORT=5000

# Optional
NODE_ENV=development
```

### Getting Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `.env` file

## 🚨 Troubleshooting Commands

### Port Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### MongoDB Not Running
```powershell
# Check if MongoDB service is running
Get-Service MongoDB*

# Start MongoDB service
net start MongoDB

# Or start MongoDB manually
mongod --dbpath C:\data\db
```

### Clear Extension Cache
1. Go to `chrome://extensions/`
2. Find extension
3. Click "Remove"
4. Reload unpacked extension
5. Refresh test page

## 📝 Git Commands (If Using Version Control)

```powershell
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Video AI Extension"

# Add remote
git remote add origin <your-repo-url>

# Push
git push -u origin main
```

## 🎯 Common Tasks

### Task: Test on YouTube
1. Ensure backend is running (`npm start`)
2. Extension is loaded in Chrome
3. Go to: https://youtube.com
4. Play any short video
5. Wait for video to end
6. Choose Quiz or Q&A

### Task: View Generated Content
**Option 1**: Extension Popup
1. Click extension icon
2. View history list
3. Click "View Content"

**Option 2**: Dashboard
1. Open: http://localhost:3000
2. Browse content grid
3. Click any card

**Option 3**: MongoDB Compass
1. Open Compass
2. Connect to local MongoDB
3. Browse `generatedcontents` collection

### Task: Change AI Model
1. Edit: `backend/src/services/gemini.js`
2. Change line 13:
   ```javascript
   model: 'gemini-1.5-pro'  // or 'gemini-1.5-flash'
   ```
3. Restart backend server

### Task: Update Extension Manifest
1. Edit: `extension/public/manifest.json`
2. Update version, name, or permissions
3. Rebuild: `npm run build`
4. Reload extension in Chrome

## 💡 Pro Tips

```powershell
# Use Windows Terminal for multiple tabs
# Tab 1: Backend
# Tab 2: Dashboard
# Tab 3: Extension builds

# Create aliases for common commands (optional)
Set-Alias -Name backend -Value "cd c:\Rudra\video-ai-chrome-extension\backend; npm start"
Set-Alias -Name dashboard -Value "cd c:\Rudra\video-ai-chrome-extension\dashboard; npm run dev"
```

---

**Quick Reference**: Keep this file open while developing!
