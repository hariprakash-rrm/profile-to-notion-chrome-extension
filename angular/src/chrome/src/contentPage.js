
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  new Promise(async (resolve, reject) => {
    try {
      if (!request) {
        throw new Error("Request is empty.");
      }
      if (!window.location.href.startsWith("https://www.linkedin.com")) {
        reject(new error("Only works on linkedin"));
      }

      const handleContactInfo = () => {
        return new Promise((resolve, reject) => {
          const contactInfoLink = document.querySelector(
            "#top-card-text-details-contact-info"
          );

          if (!contactInfoLink) {
            reject(new Error("Contact info link not found."));
          }

          const targetSuffix = "/overlay/contact-info/";
          const maxIntervals = 10;
          let intervalCount = 0;

          const intervalId = setInterval(() => {
            const currentUrl = window.location.href;

            if (currentUrl.endsWith(targetSuffix)) {
              clearInterval(intervalId);
              const userData = collectHtmlData();
              resolve(userData);
            }

            intervalCount++;

            if (intervalCount >= maxIntervals) {
              clearInterval(intervalId);
              reject(
                new Error(
                  "Timeout: URL change did not occur within 10 seconds."
                )
              );
            }
          }, 1000);

          contactInfoLink.click();
        });
      };

      const collectHtmlData = () => {
        const allData = document.getElementsByClassName(
          "pv-contact-info__contact-type"
        );
        const contactInfo = {};

        // Get the name element by its ID
        const nameElement = document.getElementById("pv-contact-info");

        // Check if the name element exists
        if (nameElement) {
          const name = nameElement.innerText.trim();
          contactInfo["Name"] = name;
        }

        for (let i = 0; i < allData.length; i++) {
          const headerElement = allData[i].querySelector(
            ".pv-contact-info__header"
          );
          const headerText = headerElement
            ? headerElement.textContent.trim()
            : "Unknown Header";

          if (i === 0) {
            contactInfo["Your Profile"] = [window.location.href];
          } else {
            const ciContainerElements = allData[i].getElementsByClassName(
              "pv-contact-info__ci-container"
            );
            const ciValues = [];

            for (let j = 0; j < ciContainerElements.length; j++) {
              ciValues.push(ciContainerElements[j].textContent.trim());
            }

            contactInfo[headerText] = ciValues;
          }
        }

        return contactInfo;
      };

      // Example usage
      const collectedData = collectHtmlData();
      console.log(collectedData);

      const userData = await handleContactInfo();
      console.log("User data:", userData);

      // Signal that processing is complete
      resolve(userData);
    } catch (error) {
      console.error(error.message || "Something went wrong.");

      // Signal that an error occurred
      reject({ success: false, error: error.message });
    }
  })
    .then((response) => sendResponse(response))
    .catch((error) => sendResponse(error));
    
  // Important: Return true to indicate that you will respond asynchronously
  return true;
});
