import { Client } from "https://cdn.skypack.dev/@notionhq/client";
const notion = new Client({
  auth: "secret_AqkabPOhbHMewAmZEbRLXZCInHNV3xSCVOa8fgrEaoP",
});

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
  try {
    // const newDatabase = await notion.databases.create({
    //   parent: {
    //     type: "page_id",
    //     page_id: "2c29b58f206a4a62a3240346ccf87905",
    //   },
    //   title: [
    //     {
    //       type: "text",
    //       text: {
    //         content: "LinkedIn Profiles",
    //       },
    //     },
    //   ],
    // properties: {
    //   "Your Profile": {
    //     type: "title",
    //     title: {},
    //   },
    //   "Name": {
    //     type: "url",
    //     url: {},
    //   },
    //   "Phone_Numbers": {
    //     type: "url",
    //     url: {},
    //   },
    //   "Email": {
    //     type: "email",
    //     email: {},
    //   },
    //   "Websites": {
    //     type: "url",
    //     url: {},
    //   },
    //   // Add more properties as needed based on the collected data
    // },
    // });

    // // // Print the new database response
    // console.log(newDatabase);

    // Add a few new pages to the database that was just created

    await addNotionPageToDatabase("4bcd163d5aa34e788ab33d52173fc032", response);
  } catch (error) {
    console.error("Error creating database:", error);
  }
}

// Create a new page in the Notion database
async function addNotionPageToDatabase(key, collectedData) {
  try {
    const websiteKey = collectedData.Websites
      ? "Websites"
      : collectedData.Website
      ? "Website"
      : "Unknown";
    // Create a new page in the Notion database
    const newPage = await notion.pages.create({
      parent: {
        database_id: key, // Replace with your Notion database ID
      },

      properties: {
        "Your Profile": {
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: collectedData["Your Profile"]
                  ? collectedData["Your Profile"][0]
                  : "Unknown",
              },
            },
          ],
        },
        Name: {
          type: "url",
          url: collectedData.Name ? collectedData.Name : "Unknown",
        },
        Phone_Numbers: {
          type: "url",
          url: collectedData.Phone ? collectedData.Phone[0] : "Unknown",
        },
        Email: {
          type: "email",
          email: collectedData.Email ? collectedData.Email[0] : "Unknown",
        },
        Websites: {
          type: "url",
          url: collectedData.Websites
            ? collectedData.Websites.join(", ")
            : "Unknown",
        },
        Websites: {
          type: "url",
          url: collectedData[websiteKey]
            ? Array.isArray(collectedData[websiteKey])
              ? collectedData[websiteKey].join(", ")
              : collectedData[websiteKey].toString()
            : "Unknown",
        },

        // Add more properties as needed based on the collected data
      },
    });

    console.log("New page added to Notion:", newPage);
  } catch (error) {
    console.error("Error adding data to Notion database:", error);
  }
}
