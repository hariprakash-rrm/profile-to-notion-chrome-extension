chrome.runtime.onMessage.addListener((request, sender, respond) => {
  const handler = new Promise((resolve, reject) => {
    if (request) {
      let allData = document.getElementsByClassName("pv-contact-info__contact-type");

      let contactInfo = {};

      for (let i = 0; i < allData.length; i++) {
        let headerElement = allData[i].querySelector('.pv-contact-info__header');
        let headerText = headerElement ? headerElement.textContent.trim() : 'Unknown Header';

        let ciContainerElements = allData[i].getElementsByClassName('pv-contact-info__ci-container');
        let ciValues = [];

        for (let j = 0; j < ciContainerElements.length; j++) {
          ciValues.push(ciContainerElements[j].textContent.trim());
        }

        contactInfo[headerText] = ciValues;
      }

      console.log(contactInfo);

      resolve(contactInfo);
    } else {
      reject('request is empty.');
    }
  });

  handler.then(message => respond(message)).catch(error => respond(error));

  return true;
});

