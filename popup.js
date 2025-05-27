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
    output.textContent = 'Could not find a presentation tab.';
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const slides = Array.from(document.querySelectorAll("div[id^='page-thumb-container-with-index-']")).map((slideEl, slideIndex) => {
          const paragraphs = Array.from(slideEl.querySelectorAll('p'));
          const lines = paragraphs.map((pEl, pIndex) => {
            const rect = pEl.getBoundingClientRect();
            return `Paragraph ${pIndex + 1}:\n  Text: "${pEl.innerText.trim()}"\n  Position: [x: ${Math.round(rect.x)}, y: ${Math.round(rect.y)}, w: ${Math.round(rect.width)}, h: ${Math.round(rect.height)}]`;
          });

          return lines.length
            ? `--- Slide ${slideIndex + 1} ---\n${lines.join('\n\n')}`
            : '';
        }).filter(Boolean);

        return slides.join('\n\n');
      }
    });

    const text = results[0]?.result || '';
    if (!text) {
      output.textContent = 'No <p> tags found—or presentation isn’t fully rendered yet.';
    } else {
      output.textContent = text;
    }
  } catch (err) {
    console.error(err);
    output.textContent = 'Error extracting <p> positions. See console for details.';
  }
});
