// content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'extractSlides') {
    // Grab all <text> elements
    const texts = Array.from(document.querySelectorAll('[role="textbox"]'))
      .map(el => el.innerText.trim())
      .filter(t => t.length);
    sendResponse({ text: texts.join('\n\n') });
  }
});
