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
  // try {
  // Create a new database
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
  //   properties: {
  //     // These properties represent columns in the database (i.e. its schema)
  //     Name: {
  //       type: "title",
  //       title: {},
  //     },
  //     Number: {
  //       type: "number",
  //       number: {},
  //     },
  //     Email: {
  //       type: "email",
  //       email: {},
  //     },
  //     Website: {
  //       type: "url",
  //       url: {},
  //     },
  //   },
  // });

  // // Print the new database response
  // console.log(newDatabase);

  for (let i = 0; i < propertiesForNewPages.length; i++) {
    // Add a few new pages to the database that was just created
    let data = await setProfileDataToProperties(response);
    console.log(data[i]);
    await addNotionPageToDatabase("2784c53b9e024a908f925cab4690fe2b", data[i]);
  }
}
// } catch (error) {
//   console.error("Error creating database:", error);
// }
// }
function setProfileDataToProperties(profileData) {
  const properties = propertiesForNewPages[0];

  // Set values dynamically from the profileData variable
  properties["Name"].title = [
    { type: "text", text: { content: profileData["Your Profile"][0] } },
  ];
  properties["Number"].number = parseFloat(profileData["Phone"][0]);
  properties["Email"].email = profileData["Email"][0];
  properties["Website"].url = profileData["Websites"].join(", ").trim();

  return propertiesForNewPages;
}

async function addNotionPageToDatabase(databaseId, pageProperties) {
  try {
    const newPage = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: pageProperties,
    });

    console.log("new page = = = = = =", newPage);
  } catch (error) {
    console.error("Error adding page to database:", error);
  }
}

export const propertiesForNewPages = [
  {
    Name: {
      type: "title",
      title: [{ type: "text", text: { content: "Hari" } }],
    },
    Number: {
      type: "number",
      number: 1.49,
    },
    Email: {
      type: "email",
      email: "hari@gmil.com",
    },
    Website: {
      type: "url",
      url: "teamquantum.in",
    },
  },
];
