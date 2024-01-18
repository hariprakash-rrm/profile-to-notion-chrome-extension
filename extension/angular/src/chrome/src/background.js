
chrome.commands.onCommand.addListener(function (command) {
  if (command === "toggle-feature") {
    // Send a message to the background script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(
          tabId,
          { action: "toggleSidebarhkey" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else {
              console.log("Message sent successfully:", response);
              createDbInNotion(response);
              // localStorage.setItem("test", "tea1212st");
              chrome.storage.local.set({ key: "test" }, function () {
                console.log("Data saved:");
              });
            }
          }
        );
        // chrome.runtime.openOptionsPage();
      } else {
        console.error("No active tabs found.");
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("15:33 pm = ", request);

  if (request.method === "getStatus") {
    chrome.storage.local.set({ authData: request.authData }, function () {
      console.log("Data saved:");
    });
    // Use a Promise to handle asynchronous chrome.storage.local.get
    const getStatusPromise = new Promise((resolve, reject) => {
      chrome.storage.local.get(["authData"], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(JSON.stringify(result));
        }
      });
    });

    // Respond to the sender using the Promise
    getStatusPromise
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        console.error("Error during getStatus:", error);
        // You might want to send an error response back to the sender
        sendResponse({ error: "Failed to get status" });
      });

    // Indicate that the response will be sent asynchronously
    return true;
  } else {
    // If the method is not "getStatus", snub them.
    sendResponse({});
  }
});

// Additional background script logic can go here
// ...

async function createDbInNotion(response) {
  // axios.post("http://localhost:3000/create", response)
  //   .then(async (resp) => (this.dbs = await resp.data))
  //   .catch((error) => console.error("Error during POST request:", error));
}
