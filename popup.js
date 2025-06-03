// Function to send text to local AI model
async function sendToAIModel(text) {
  try {
    const response = await fetch('http://localhost:8000/process', {
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
// Global for storing highlight buttons
const viewButtons = [];

// Main UI hook for layout extraction
document.getElementById('extractplacement').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Extracting...';
  viewButtons.length = 0;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    output.textContent = 'Could not find a presentation tab.';
    return;
  }

  try {
    const [{ result: slides }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        function edgeDistances(el) {
          const rect = el.getBoundingClientRect();
          const canvas = document.querySelector('.canvasContainer')?.getBoundingClientRect();
          if (!rect || !canvas) return { left: 0, right: 0, top: 0, bottom: 0 };
          return {
            left:   Math.round(rect.left - canvas.left),
            right:  Math.round(canvas.right - rect.right),
            top:    Math.round(rect.top - canvas.top),
            bottom: Math.round(canvas.bottom - rect.bottom)
          };
        }

        const sleep = ms => new Promise(res => setTimeout(res, ms));
        const pageThumbs = document.querySelectorAll('#pageThumbs .slide');
        const slideMap = new Map();

        for (let i = 0; i < pageThumbs.length; i++) {
          pageThumbs[i].click();
          await sleep(400);
          const allContainers = Array.from(document.querySelectorAll(
            'div.canvas .draggable-item-container.item-type-text, div.canvas .draggable-item-container.item-type-image'
          ));
          const containers = allContainers.filter(c => {
            if (c.closest('#pageThumbs')) return false;
            if (c.dataset.isDeleted === 'true') return false;
            const st = getComputedStyle(c);
            if (st.display === 'none' || st.visibility === 'hidden') return false;
            if (c.classList.contains('item-type-text')) {
              const editor = c.querySelector('.ql-editor');
              if (!editor || !editor.innerText.trim()) return false;
            }
            return true;
          });

          containers.forEach(item => {
            const editor = item.querySelector('.ql-editor');
            const isText = !!editor;
            const text = isText ? editor.innerText.trim() : '[Image]';
            const t = item.style.transform || '';
            const [, x = '0', y = '0'] = t.match(/translateX\(([-\d.]+)px\).*translateY\(([-\d.]+)px\)/) || [];
            const width  = parseFloat(item.dataset.width)  || item.offsetWidth  || 0;
            const height = parseFloat(item.dataset.height) || item.offsetHeight || 0;
            const gap = edgeDistances(item);
            const slideNum = i + 1;
            const type = item.dataset.itemType || 'unknown';
            const info = {
              id: item.id || item.dataset.itemId,
              type,
              text,
              x: +x,
              y: +y,
              width,
              height,
              gap
            };
            if (!slideMap.has(slideNum)) slideMap.set(slideNum, []);
            slideMap.get(slideNum).push(info);
          });
        }

        return Array.from(slideMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([slide, paragraphs]) => ({ slide, paragraphs }));
      }
    });

    const container = document.createElement('div');
    container.innerHTML = buildFeedback(slides);
    output.replaceChildren(container);

    // Delay to ensure DOM is painted before attaching listeners
    setTimeout(() => {
      viewButtons.forEach(({ btnId, targetId }) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.addEventListener('click', () => highlightBlock(targetId));
        } else {
          console.warn('Missing button:', btnId);
        }
      });
    }, 0);

  } catch (err) {
    console.error(err);
    output.textContent = 'Error extracting slide content.';
  }
});

function buildFeedback(slides) {
  return slides.map(({ slide, paragraphs }) => {
    const issues = [];

    if (!paragraphs.length) {
      issues.push('No content blocks found.');
    } else {
      const xs = paragraphs.map(p => p.x);
      if (Math.max(...xs) - Math.min(...xs) > 10)
        issues.push('Blocks are not consistently left-aligned.');

      const sorted = [...paragraphs].sort((a, b) => a.y - b.y);
      sorted.forEach((p, i) => {
        if (i === 0) return;
        const prev = sorted[i - 1];
        const gap = p.y - (prev.y + prev.height);
        if (Math.abs(gap) < 8) {
          const typeA = prev.type === 'image' ? 'Image' : 'Paragraph';
          const typeB = p.type === 'image' ? 'Image' : 'Paragraph';
          issues.push(`${typeA} ${i} and ${typeB} ${i + 1} are too close (gap: ${gap.toFixed(1)} px).`);
        }
      });

      sorted.forEach((p, i) => {
        const g = p.gap;
        if (!g) return;
        const label = p.type === 'image' ? `Image ${i + 1}` : `Paragraph ${i + 1}`;
        const btnId = `highlight-${slide}-${i}`;
        viewButtons.push({ btnId, targetId: p.id });

        const viewBtn = `<button id="${btnId}" class="highlight-btn" style="margin-left: 6px;"> View</button>`;

        if (Math.abs(g.left) < 10)
          issues.push(`${label} is too close to the left edge. ${viewBtn}`);
        if (Math.abs(g.right) < 10)
          issues.push(`${label} is too close to the right edge. ${viewBtn}`);
        if (Math.abs(g.top) < 10)
          issues.push(`${label} is too close to the top edge. ${viewBtn}`);
        if (Math.abs(g.bottom) < 10)
          issues.push(`${label} is too close to the bottom edge. ${viewBtn}`);
      });
    }

    return `
      <details style="margin-bottom: 12px;" open>
        <summary><strong>Slide ${slide}</strong></summary>
        <ul style="margin-top: 8px;">
          ${issues.length ? issues.map(i => `<li>${i}</li>`).join('') : '<li>No issues found ✅</li>'}
        </ul>
      </details>
    `;
  }).join('');
}

window.highlightBlock = (blockId) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (id) => {
        const sleep = (ms) => new Promise(res => setTimeout(res, ms));

        // Try to find the element
        let el = document.getElementById(id);

        // If not found, try switching slides
        if (!el) {
          // Try to extract slide-id from the element ID pattern
          const match = id.match(/draggable-item-container-(\d+)/);
          const itemId = match ? match[1] : null;

          if (itemId) {
            const selector = `[data-item-id="${itemId}"]`;
            const thumb = [...document.querySelectorAll('#pageThumbs .slide')]
              .find(t => t.querySelector(selector));

            if (thumb) {
              thumb.click();
              await sleep(500); // wait for slide to load
              el = document.getElementById(id);
            }
          }
        }

        if (!el) {
          console.warn(`[NuVu-ext] Could not find element with ID: ${id}`);
          return;
        }

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s ease';
        el.style.boxShadow = '0 0 0 4px yellow';
        setTimeout(() => (el.style.boxShadow = ''), 2000);
      },
      args: [blockId]
    });
  });
};



async function waitForElement(id, timeout = 3000) {
  const interval = 100;
  const maxTries = timeout / interval;
  for (let i = 0; i < maxTries; i++) {
    const el = document.getElementById(id);
    if (el) return el;
    await new Promise(r => setTimeout(r, interval));
  }
  return null;
}