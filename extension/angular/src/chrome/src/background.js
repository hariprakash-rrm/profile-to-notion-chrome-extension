

chrome.commands.onCommand.addListener(function(command) {
  if (command === "toggle-feature") {
    sendMessageToContentScript();
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.command === "toggle-feature") {
    sendMessageToContentScript();
  }
});

function sendMessageToContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs.length > 0) {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, {command: "contact"}, function(response) {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        } else {
          createDbInNotion(response);
        }
      });
    } else {
      console.error("No active tabs found.");
    }
  });
}

function handleTabUpdate(tabId, changeInfo, tab) {

  if(changeInfo.url){
    if(changeInfo.url.includes('https://www.linkedin.com/in')){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Ensure there's at least one tab
        if (tabs.length > 0) {
          // Get the tab ID
          let tabId = tabs[0].id;
          
          // Send a message to the content script
          chrome.tabs.sendMessage(tabId, {command: "url"});
        } else {
          console.error("No active tab found.");
        }
      });
    }
  }
  if (changeInfo.url) {

    if (changeInfo.url.includes("http://localhost:4200/?code=")) {

      const codeParam = new URL(changeInfo.url).searchParams.get("code");

      const extensionURL = `chrome-extension://efddgiiofffihbdmioelhlmckdidacpj/index.html#/?code=${codeParam}`;

      chrome.tabs.create({ url: extensionURL }, function (newTab) {
        chrome.tabs.remove(tabId);
      });
    }
  }
}

// Event listener for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  handleTabUpdate(tabId, changeInfo, tab);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getStatus") {
    chrome.storage.local.set({ authData: request.authData }, function () {
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
        // console.error("Error during getStatus:", error);
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

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.remove(["key", "id"], function () {
    var error = chrome.runtime.lastError;
    if (error) {
      // console.error(error);
    }
  });
  // Build the extension URL with the 'code' parameter
  const extensionURL = `chrome-extension://efddgiiofffihbdmioelhlmckdidacpj/index.html#/`;

  // Open the extension URL in a new tab
  chrome.tabs.create({ url: extensionURL }, function (newTab) {});
});

async function createDbInNotion(_data) {

  const apiUrl = "https://notion-backend-cvzk.onrender.com/add-data";

  try {
    const response = await fetch(apiUrl, {
      method: "POST", // or 'PUT', 'DELETE', etc.
      headers: {
        "Content-Type": "application/json",
        // Add any other headers if needed
      },
      body: JSON.stringify({ data: _data }),
    });
    if (response.ok) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "../../assets/logo.jpeg",
        title: "Profile To Notion",
        message: "Profile added to Notion",
      });
      // Handle the API response here
    } else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "../../assets/logo.jpeg",
        title: "Profile To Notion",
        message: `Failed to add profile to Notion: ${response.status} - ${response.statusText}`,
      });
    }
  } catch (error) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "../../assets/logo.jpeg",
      title: "Profile To Notion",
      message: "Something went wrong",
    });
    // console.error("Error:", error.message);
  }
}
