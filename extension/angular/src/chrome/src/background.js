
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


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(request, "reqqqqqq");
//   // Check if the received message has the expected method property
//   if (request && request.method === "get") {
//     // Perform the desired actions based on the received message
//     // You can send a response back if needed
//     const responseData = {
//       status: "success",
//       message: "Data successfully retrieved.",
//     };
//     sendResponse(responseData);

//     // Log the received message
//     console.log("Received message:", request);

//     // You can also handle the message further as needed
//   } else {
//     // Handle unexpected or unhandled messages
//     console.error("Unexpected message:", request);
//   }
// });



// Function to handle tab updates
function handleTabUpdate(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    console.log("Tab updated. New URL:", changeInfo.url);

    // Check if the new URL contains 'http://localhost:4200/?code='
    if (changeInfo.url.includes("http://localhost:4200/?code=")) {
      // Extract the 'code' parameter from the URL
      const codeParam = new URL(changeInfo.url).searchParams.get("code");

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

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.remove(["key","id"],function(){
    var error = chrome.runtime.lastError;
       if (error) {
           console.error(error);
       }
   })
  // Build the extension URL with the 'code' parameter
  const extensionURL = `chrome-extension://efddgiiofffihbdmioelhlmckdidacpj/index.html#/`;

  // Open the extension URL in a new tab
  chrome.tabs.create({ url: extensionURL }, function (newTab) {

  });
});


async function createDbInNotion(_data){
  console.log('working = = =', _data)

   // Replace 'https://api.example.com/endpoint' with the actual API endpoint
  const apiUrl = 'http://localhost:3000/add-data';

  // Example data to send in the body
  const requestData = {
    data:_data
  };

  fetch(apiUrl, {
    method: 'POST', // or 'PUT', 'DELETE', etc.
    headers: {
      'Content-Type': 'application/json',
      // Add any other headers if needed
    },
    body: JSON.stringify(requestData)
  })
    
    .then(async(data) => {
     
      chrome.notifications.create({
        type: 'basic',
        iconUrl:'../../assets/asdss.jpeg',
        title: 'My Extension',
        message: 'Profile added to notion'
      });
      // Handle the API response here
    })
    .catch(error => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl:'../../assets/asdss.jpeg',
        title: 'My Extension',
        message: 'Something went wront'
      });
      console.error('API Error:', error);
    });
}


