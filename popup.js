document.getElementById('captureButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "capture_tab" }, (response) => {
      if (response && response.dataUrl) {
        const img = document.getElementById('capturedImage');
        img.src = response.dataUrl;
        img.style.display = "block";
      } else {
        console.error("Failed to capture tab.");
      }
    });
  });
  

// popup.js
document.getElementById('improve').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // 1. grab slide text
  chrome.tabs.sendMessage(tab.id, { action: 'extractSlides' }, async (resp) => {
    const slides = resp.text;
    document.getElementById('output').innerText = '🧠 Thinking…';

    // 2. fetch your DeepSeek R1 endpoint
    const { apiKey } = await chrome.storage.local.get('apiKey');
    const res = await fetch('https://your-vm.example.com/improve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ slides })
    });
    const { storyline } = await res.json();
    document.getElementById('output').innerText = storyline;
  });
};
