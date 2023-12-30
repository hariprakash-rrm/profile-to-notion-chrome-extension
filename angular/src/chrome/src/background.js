console.log('j');
chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle-feature") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs.length > 0) {
                const tabId = tabs[0].id;

                chrome.tabs.sendMessage(
                    tabId,
                    { action: "toggleSidebarhkey" },
                    function (response) {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message:', chrome.runtime.lastError);
                        } else {
                            console.log('Message sent successfully:', response);
                        }
                    }
                );
                // chrome.runtime.openOptionsPage();
            } else {
                console.error('No active tabs found.');
            }
        });
    }
});
