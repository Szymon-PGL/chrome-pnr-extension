# Chrome Extension

A Chrome browser extension built with Manifest V3.

## 📁 Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest file
├── background.js          # Service worker script
├── content.js            # Content script for web pages
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── icon16.png            # 16x16 icon for toolbar
├── icon48.png            # 48x48 icon for extension management
└── icon128.png           # 128x128 icon for Chrome Web Store
```

## 🚀 Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your Chrome toolbar

### Prerequisites

- Google Chrome browser
- Basic knowledge of JavaScript, HTML, and CSS

### File Descriptions

- **`manifest.json`**: Defines extension metadata, permissions, and file references
- **`background.js`**: Service worker that runs in the background
- **`content.js`**: Script injected into web pages
- **`popup.html`**: HTML structure for the extension popup
- **`popup.js`**: JavaScript functionality for the popup interface
- **Icon files**: Various sizes for different display contexts

### Common Issues

- **Extension not loading**: Check the console in `chrome://extensions/` for errors
- **Content script not working**: Verify the `matches` pattern in manifest.json
- **Popup not displaying**: Check popup.html and popup.js for syntax errors

### Debug Mode

1. Right-click the extension icon and select "Inspect popup"
2. Use Chrome DevTools to debug popup functionality
3. Check background script logs in the extension details page
