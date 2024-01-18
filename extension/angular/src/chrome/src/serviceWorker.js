// Event listener for onInstalled
chrome.runtime.onInstalled.addListener(function (details) {
  document.addEventListener('keydown', function (event) {
    // Check if the key combination matches your desired shortcut
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
      // Your logic when the shortcut is pressed
      console.log('Shortcut pressed!');
  
      // Prevent the default behavior (e.g., opening a new tab)
      event.preventDefault();
    }
  });
});