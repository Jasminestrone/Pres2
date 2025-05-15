chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_tab") {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
        sendResponse({ dataUrl });
      });
      return true;
    }
  });
  