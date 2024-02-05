chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  new Promise(async (resolve, reject) => {
    try {
      addCustomButton()
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

        // Assuming 'element' is the reference to your HTML element
        const _element = document.querySelector(".text-body-medium");

        // Check if the element is found
        if (_element) {
          // Log the text content
          // console.log(_element.textContent.trim());
          contactInfo.about = _element.textContent.trim();
        } else {
          // console.log("Element not found");
        }

        const photoWrapper = document.querySelector(
          ".pv-top-card__photo-wrapper"
        );

        const imgTag = document.querySelector(
          ".pv-top-card-profile-picture__image"
        );

        // Log the src attribute
        // console.log("test", imgTag);
        if (imgTag) {
          // Get the src attribute
          let _imgSrc = imgTag.getAttribute("src");
          contactInfo["img"] = _imgSrc;
          return contactInfo;
        } else {
          // Check if the container element is found
          if (photoWrapper) {
            // Find the image element within the container
            const imgElement = photoWrapper.querySelector(".evi-image");

            // Check if the image element is found
            if (imgElement) {
              // Log the src attribute
              // console.log(imgElement.getAttribute("src"));
              contactInfo["img"] = imgElement.getAttribute("src");
            } else {
              // console.log("Image element not found within the container");
            }
          } else {
            // console.log("Container element not found");
          }

          return contactInfo;
        }
      };

      // Example usage
      const collectedData = await collectHtmlData();
      // console.log(collectedData);

      const userData = await handleContactInfo();
      // console.log("User data:", userData);

      chrome.storage.local.get(["gAuth"]).then((result) => {
        // console.log("Value currently is " + result);
        userData.token = result.gAuth;
      });
      chrome.storage.local.get(["user_id"]).then((result) => {
        // console.log("Value currently is " + result);
        userData.user_id = result.user_id;
        resolve(userData);
      });
    } catch (error) {
      // console.error(error.message || "Something went wrong.");

      // Signal that an error occurred
      reject({ success: false, error: error.message });
    }
  })
    .then((response) => sendResponse(response))
    .catch((error) => sendResponse(error));

  // Important: Return true to indicate that you will respond asynchronously
  return true;
});


// content.js

function addCustomButton() {

  // console.log('Script loaded ')
  const button = document.createElement('button');
  button.innerHTML = 'Custom Button';
  button.addEventListener('click', function () {
    // Your custom logic when the button is clicked
    alert('Button clicked!');
  });

  // Find the LinkedIn profile's action bar (where the Connect button is)
  const actionBar = document.querySelector('.pv-s-profile-actions');
  if (actionBar) {
    actionBar.appendChild(button);
  }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', addCustomButton);
