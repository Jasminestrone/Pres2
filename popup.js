// Function to send text to local AI model
async function sendToAIModel(text) {
  try {
    const response = await fetch('http://localhost:5000/process', {
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
      output.textContent = "No <p> tags found—or presentation isn't fully rendered yet.";
    } else {
      output.textContent = text;
    }
  } catch (err) {
    output.textContent = 'Error extracting <p> positions.';
  }
});
