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
              chrome.storage.local.set({ "key": "test" }, function () {
                console.log('Data saved:');
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

// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, "reqqqqqq");
  // Check if the received message has the expected method property
  if (request && request.method === "get") {
    // Perform the desired actions based on the received message
    // You can send a response back if needed
    const responseData = {
      status: "success",
      message: "Data successfully retrieved.",
    };
    sendResponse(responseData);

    // Log the received message
    console.log("Received message:", request);

    // You can also handle the message further as needed
  } else {
    // Handle unexpected or unhandled messages
    console.error("Unexpected message:", request);
  }
});

// Additional background script logic can go here
// ...

async function createDbInNotion(response) {
  // axios.post("http://localhost:3000/create", response)
  //   .then(async (resp) => (this.dbs = await resp.data))
  //   .catch((error) => console.error("Error during POST request:", error));
}
