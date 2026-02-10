# Extension Icon Files

This folder needs icon files for the Chrome Extension:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Quick Icon Generation

### Option 1: Use Online Tools
1. Go to https://www.favicon-generator.org/
2. Upload your logo/image
3. Download as PNG
4. Resize to 16x16, 48x48, 128x128
5. Save as `icon16.png`, `icon48.png`, `icon128.png`

### Option 2: Use Canva
1. Go to https://www.canva.com/
2. Create 128x128 design
3. Add icon (📺 or 🎬 emoji works great)
4. Export as PNG
5. Use online tools to resize for 16x16 and 48x48

### Option 3: Simple Placeholder (Development)
For development, you can use any PNG images:
- Just rename them to `icon16.png`, `icon48.png`, `icon128.png`
- Place in this folder
- Extension will work with any PNG files

## Recommended Design

- **Theme**: Video/AI related (🎬, 📺, 🤖, 💡)
- **Colors**: Blue/Purple gradient (matches UI)
- **Style**: Modern, flat design
- **Text**: Optional "AI" or "V" letter mark

## Current Status

⚠️ **Icons not included** - Please add your own icon files here before building the extension.

For testing purposes, the extension will work without icons, but Chrome will show a default puzzle piece icon.
