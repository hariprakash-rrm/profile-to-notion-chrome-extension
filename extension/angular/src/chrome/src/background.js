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

// background.js

// Function to handle tab updates
function handleTabUpdate(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    console.log("Tab updated. New URL:", changeInfo.url);

    // Check if the new URL contains 'http://localhost:4200/?code='
    if (changeInfo.url.includes("http://localhost:4200/?code=")) {
      // Extract the 'code' parameter from the URL
      const codeParam = new URL(changeInfo.url).searchParams.get("code");
      chrome.storage.local.get(["key"]).then((result) => {
        let aToken = result.key;
        console.log("Value currently is " + result.key);
        chrome.storage.local.get(["id"]).then((result) => {
          let id = result.id;
          let postData = {
            token: aToken,
            user_id: id,
            code: codeParam ? codeParam : "",
          };
          addGoogleTokenToSupabase(postData);
          addNotionTokenToSupabase(postData)
        });
      });

      // Build the extension URL with the 'code' parameter
      const extensionURL = `chrome-extension://efddgiiofffihbdmioelhlmckdidacpj/index.html#/?code=${codeParam}`;

      // Open the extension URL in a new tab
      chrome.tabs.create({ url: extensionURL }, function (newTab) {
        // Close the tab with the old URL
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

// background.js

const extensionBasePath = "http://localhost:3000/"; // Adjust the path as needed

async function addGoogleTokenToSupabase(postData) {
  try {
    const response = await fetch(
      `${extensionBasePath}add-google-token-to-supabase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify(postData),
      }
    );

    // Handle the response if needed
    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
  }
}

async function addNotionTokenToSupabase(postData) {
  try {
    const response = await fetch(
      `${extensionBasePath}add-notion-token-to-supabase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify(postData),
      }
    );

    // Handle the response if needed
    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
  }
}
