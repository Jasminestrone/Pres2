// Function to send text to local AI model
async function sendToAIModel(text) {
  try {
    const response = await fetch('http://localhost:5005/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    });
    
    if (!response.ok) {
      throw new Error('Failed to process text with AI model');
    }
    
    const result = await response.json();
    return result.processedText;
  } catch (error) {
    throw error;
  }
}

document.getElementById('extract').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Extracting...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    output.textContent = 'Could not find a presentation tab.';
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const slides = Array.from(
          document.querySelectorAll("div[id^='page-thumb-container-with-index-']")
        ).map((slideEl, i) => {
          const lines = Array.from(
            slideEl.querySelectorAll('.item.ql-editor')
          )
            .map(item => item.innerText.trim())
            .filter(Boolean);
          return lines.length
            ? `--- Slide ${i + 1} ---\n${lines.join('\n')}`
            : '';
        }).filter(Boolean);
        return slides.join('\n\n');
      }
    });

    const text = results[0]?.result || '';
    if (!text) {
      output.textContent = "No slide text found—or presentation isn't fully rendered yet.";
    } else {
      // Store the extracted text
      chrome.storage.local.set({ 'extractedText': text });
      
      // Send to AI model
      try {
        const processedText = await sendToAIModel(text);
        output.textContent = processedText;
      } catch (error) {
        output.textContent = 'Error processing text with AI model.';
      }
    }
  } catch (err) {
    output.textContent = 'Error extracting slides.';
  }
});


// UI hook 
document.getElementById('extractplacement').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Extracting…';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    output.textContent = ' Could not find a presentation tab.';
    return;
  }

  try {
    const [{ result: slides }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },

      // ⬇️  make the injected function async and return `sorted`
      func: async () => {
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        const pageThumbs = document.querySelectorAll('#pageThumbs .slide');
        console.log('[NuVu-ext] total slides found:', pageThumbs.length);

        const slideMap = new Map();   // Map<slideNumber , ParagraphInfo[]>

        for (let i = 0; i < pageThumbs.length; i++) {
          /* ---------- navigate to real slide ---------- */
          pageThumbs[i].click();
          console.log(`[NuVu-ext] Navigating to slide ${i + 1}`);
          await sleep(400);           // wait for canvas to refresh

          /* ---------- collect all item-containers ---------- */
          const allContainers = Array.from(
            document.querySelectorAll('div.canvas .item-container')
          );
          console.log('[NuVu-ext] found', allContainers.length, 'item-containers in canvas');

          /* ---------- apply same filters ---------- */
          const containers = allContainers.filter(c => {
            if (c.closest('#pageThumbs'))                 return false;     // thumbnail
            const editor = c.querySelector('.ql-editor');
            if (!editor)                                   return false;     // not text
            if (!editor.innerText.trim())                  return false;     // empty
            if (c.dataset.isDeleted === 'true')            return false;     // deleted
            const st = getComputedStyle(c);
            if (st.display === 'none' || st.visibility === 'hidden')
                                                          return false;     // hidden
            return true;                                                   // keep
          });

          console.log('[NuVu-ext] keeping', containers.length, 'containers');

          /* ---------- stash paragraphs for this slide ---------- */
          containers.forEach(item => {
            const text   = item.querySelector('.ql-editor').innerText.trim();
            const t      = item.style.transform;
            const [, x = '0', y = '0'] =
              t.match(/translateX\(([-\d.]+)px\).*translateY\(([-\d.]+)px\)/) || [];
            const width  = parseFloat(item.dataset.width)  || item.offsetWidth  || 0;
            const height = parseFloat(item.dataset.height) || item.offsetHeight || 0;

            const slideNum = i + 1;
            const info = { text, x: +x, y: +y, width, height };

            if (!slideMap.has(slideNum)) slideMap.set(slideNum, []);
            slideMap.get(slideNum).push(info);
          });
        }

        /* ---------- return clean array back to popup ---------- */
        const sorted = Array.from(slideMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([slide, paragraphs]) => ({ slide, paragraphs }));

        console.log('[NuVu-ext] final slides:', sorted);
        return sorted;       // <<<<<<  THIS is what popup receives
      }
    });

    /* -------- popup UI -------- */
    console.log('[NuVu-ext] final slides returned to popup:', slides);
    output.innerHTML = buildFeedback(slides);   // your existing formatter
  } catch (err) {
    console.error(err);
    output.textContent = ' Error extracting slide content.';
  }
});


// layout-check helper 
function buildFeedback(slides) {
  return slides.map(({ slide, paragraphs }) => {
    const issues = [];

    if (!paragraphs.length) {
      issues.push('No paragraphs found.');
    } else {
      const xs = paragraphs.map(p => p.x);
      if (Math.max(...xs) - Math.min(...xs) > 10)
        issues.push('Paragraphs are not consistently left-aligned.');

      const sorted = [...paragraphs].sort((a, b) => a.y - b.y);
      sorted.forEach((p, i) => {
        if (i === 0) return;
        const prev = sorted[i - 1];
        const gap = p.y - (prev.y + prev.height);
        if (gap < 8)
          issues.push(`Paragraphs ${i} and ${i + 1} are too close (gap: ${gap.toFixed(1)} px).`);
      });

      sorted.forEach((p, i) => {
        if (p.x < 30) issues.push(`Paragraph ${i + 1} is too close to the left edge.`);
        if (p.y < 30) issues.push(`Paragraph ${i + 1} is too close to the top edge.`);
      });

      if (!issues.length) issues.push('No issues found');
    }

    return `
      <details style="margin-bottom: 12px;">
        <summary><strong>Slide ${slide}</strong></summary>
        <ul style="margin-top: 8px;">
          ${issues.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </details>`;
  }).join('');
}

