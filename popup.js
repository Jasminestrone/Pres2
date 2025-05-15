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
  