# Extension Icons

This folder should contain three icon files for the Chrome extension:

## Required Icons

1. **icon16.png** - 16×16 pixels (toolbar icon)
2. **icon48.png** - 48×48 pixels (extension management)
3. **icon128.png** - 128×128 pixels (Chrome Web Store)

## How to Create Icons

### Option 1: Use an Online Tool (Easiest)

1. Visit https://www.favicon-generator.org/
2. Upload any image you like (logo, emoji screenshot, etc.)
3. Download all generated sizes
4. Rename and place them in this folder

### Option 2: Use Canva (Free)

1. Go to https://www.canva.com/
2. Create three designs:
   - 16×16 pixels
   - 48×48 pixels
   - 128×128 pixels
3. Use education-themed graphics (📚, 🎓, 💡, ✓)
4. Download as PNG
5. Save to this folder

### Option 3: Use Photoshop/GIMP

1. Create three square canvases (16×16, 48×48, 128×128)
2. Design your icon
3. Export as PNG with transparency
4. Save to this folder

### Option 4: Screenshot an Emoji

1. Open https://emojicopy.com/
2. Find an education emoji: 📚 🎓 💡 ❓ ✓
3. Take a screenshot
4. Resize to three sizes using Paint or online tool
5. Save as PNG

## Recommended Icon Themes

- 📚 Book (learning, education)
- 🎓 Graduation cap (achievement)
- 💡 Light bulb (knowledge)
- ❓ Question mark (quiz)
- ✓ Checkmark (answers)
- 🧠 Brain (thinking)
- 📝 Note (test)

## Quick Icon Generators

- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
- https://www.flaticon.com/ (search "quiz" or "education")
- https://www.iconfinder.com/

## Color Suggestions

Use colors that match your brand or the extension theme:
- Purple: `#667eea` (matches quiz gradient)
- Blue: `#3498db`
- Green: `#4caf50`
- Orange: `#ff9800`

## File Format Requirements

- **Format:** PNG (with transparency recommended)
- **Color Mode:** RGB
- **Bit Depth:** 24-bit or 32-bit (with alpha channel)
- **Naming:** Exact - `icon16.png`, `icon48.png`, `icon128.png`

## Current Status

- [ ] icon16.png
- [ ] icon48.png
- [ ] icon128.png

## Note

The extension will work without icons, but Chrome will display warnings in the extension management page. Icons are recommended for a professional appearance.

## Example: Create from Command Line (ImageMagick)

If you have ImageMagick installed:

```powershell
# Create placeholder icons with text
magick -size 128x128 xc:#667eea -pointsize 72 -fill white -gravity center -annotate +0+0 "📚" icon128.png
magick icon128.png -resize 48x48 icon48.png
magick icon128.png -resize 16x16 icon16.png
```

## After Creating Icons

1. Place all three files in this folder
2. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the reload button on your extension
3. The new icons should appear immediately

---

**Quick tip:** For a professional look, use the same icon at all three sizes, just resized. Don't use different designs for different sizes.
