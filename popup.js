document.getElementById('extract').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Extracting…';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    output.textContent = '❌ Could not find a presentation tab.';
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
      output.textContent = ' No slide text found—or presentation isn’t fully rendered yet.';
    } else {
      output.textContent = text;
    }
  } catch (err) {
    console.error(err);
    output.textContent = 'Error extracting slides. See console for details.';
  }
});

//Obtain the placement
document.getElementById('extractplacement').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Extracting…';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    output.textContent = '❌ Could not find a presentation tab.';
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return Array.from(document.querySelectorAll('p')).map((el, i) => {
          const rect = el.getBoundingClientRect();
          return `Paragraph ${i + 1} at [x: ${Math.round(rect.x)}, y: ${Math.round(rect.y)}, w: ${Math.round(rect.width)}, h: ${Math.round(rect.height)}]`;
        }).join('\n');
      }
    });

    const text = results[0]?.result || '';
    if (!text) {
      output.textContent = 'No <p> tags found or page not fully rendered.';
    } else {
      output.textContent = text;
    }
  } catch (err) {
    console.error(err);
    output.textContent = '❌ Error extracting <p> positions. See console for details.';
  }
});
