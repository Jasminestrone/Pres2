# Pres2 - Presentation Enhancement Assistant

Pres2 is a Chrome extension that helps enhance presentation content using AI-powered text processing. It provides intelligent suggestions to make presentations more engaging, clear, and professional.

## Features

- AI-powered presentation text enhancement
- Chrome extension integration
- Real-time text processing
- User-friendly interface
- Context-aware suggestions

## Prerequisites

- Python 3.8 or higher
- Node.js and npm
- Chrome browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jasminestrone/Pres2.git
cd Pres2
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Node.js dependencies:
```bash
npm install
```

4. Load the Chrome extension:
   - Open Chrome and navigate to [chrome://extensions/](chrome://extensions/)
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Setup

1. Start the backend server:
```bash
node server.js
```

2. The server will run on [http://localhost:5005](http://localhost:5005)

## Usage

1. Click the Pres2 extension icon in Chrome
2. Enter or paste your presentation text
3. Click "Process" to get AI-enhanced suggestions
4. Review and apply the suggested improvements

## Technical Details

- Backend: Node.js with Express
- AI Model: DeepSeek-R1-Distill-Qwen-1.5B
- Frontend: HTML, CSS, JavaScript
- Browser Integration: Chrome Extension API

## Project Structure

```
Pres2/
├── server.js           # Node.js backend server
├── process_text.py     # Python text processing script
├── manifest.json       # Chrome extension manifest
├── popup.js           # Extension popup logic
├── background.js      # Extension background script
├── index.html         # Extension popup interface
├── style.css          # Styling
└── icons/             # Extension icons
```

## Dependencies

### Python Dependencies
- torch
- transformers
- flask
- flask-cors
- sentencepiece
- accelerate
- bitsandbytes

### Node.js Dependencies
- express
- cors

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See the [LICENSE](LICENSE) file for details.

## Authors

- Jasmine
- Gabe