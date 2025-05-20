// listen for extraction requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'extractSlides') {
      // find every slide-thumb container
      const slideThumbs = document.querySelectorAll("div[id^='page-thumb-container-with-index-']");
      const slides = [];
  
      slideThumbs.forEach((slideEl, i) => {
        // grab all text items in that slide
        const lines = Array.from(
          slideEl.querySelectorAll('.item.ql-editor')
        ).map(item => item.innerText.trim())
         .filter(t => t.length);
        if (lines.length) {
          slides.push(`--- Slide ${i+1} ---\n${lines.join('\n')}`);
        }
      });
  
      sendResponse({ text: slides.join('\n\n') });
    }
    // keep channel open
    return true;
  });
  
