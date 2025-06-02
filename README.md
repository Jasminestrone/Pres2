# Pres2 - Presentation Enhancement Assistant

Pres2 is a Chrome extension that helps enhance presentation content using AI-powered text processing. It provides intelligent suggestions to make presentations more engaging, clear, and professional.

## Features

- AI-powered presentation text enhancement
- Chrome extension integration
- Real-time text processing
- User-friendly interface
- Context-aware suggestions
- Multiple AI model options

## Prerequisites

- Python 3.8 or higher
- Node.js and npm
- Chrome browser
- Windows operating system (for automated installation)
- Administrator privileges (for automated installation)

## Installation
# If automated instilation does not work try removing all files and redoing manually

### Automated Installation (Windows)

1. Run the PowerShell installation script as Administrator:
```powershell
.\install.ps1
```

2. During installation, you'll be prompted to select an AI model:
   - DeepSeek-R1-Distill-Qwen-1.5B (3.2GB)
   - DeepSeek-R1-Distill-Qwen-7B (14GB)
   - DeepSeek-R1-Distill-Qwen-14B (28GB)

### Manual Installation

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
- AI Models:
  - DeepSeek-R1-Distill-Qwen-1.5B (Default, 3.2GB)
  - DeepSeek-R1-Distill-Qwen-7B (14GB)
  - DeepSeek-R1-Distill-Qwen-14B (28GB)
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