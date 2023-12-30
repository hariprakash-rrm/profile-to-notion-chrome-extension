console.log('j');
chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle-feature") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs.length > 0) {
                const tabId = tabs[0].id;

                chrome.tabs.sendMessage(
                    tabId,
                    { action: "toggleSidebarhkey" },
                    function (response) {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message:', chrome.runtime.lastError);
                        } else {
                            console.log('Message sent successfully:', response);
                        }
                    }
                );
                // chrome.runtime.openOptionsPage();
            } else {
                console.error('No active tabs found.');
            }
        });
    }
});

// background.js

// Function to initiate OAuth2 authentication
function initiateOAuth2() {
    const manifest = chrome.runtime.getManifest();
    const url = new URL('https://accounts.google.com/o/oauth2/auth');
    url.searchParams.set('client_id', manifest.oauth2.client_id);
    url.searchParams.set('response_type', 'id_token');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`);
    url.searchParams.set('scope', manifest.oauth2.scopes.join(' '));
  
    chrome.identity.launchWebAuthFlow(
      {
        url: url.href,
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError) {
          console.error('Authentication error:', chrome.runtime.lastError);
        } else {
          const url = new URL(redirectedTo);
          const params = new URLSearchParams(url.hash);
          const userInfo = await getUserInfo(params.get('id_token'));
          sendMessageToAngularApp('userInfo', userInfo);
        }
      }
    );
  }
  
  // Function to get user information from the ID token
  async function getUserInfo(idToken) {
    // In a real-world scenario, you would send the ID token to your server for verification.
    // For simplicity, let's just decode the ID token here.
    const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
    return decodedToken;
  }
  
  // Function to send messages to the Angular app
  function sendMessageToAngularApp(message, data) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(activeTab.id, { message, data });
      }
    });
  }
  
  // Listen for messages from the Angular app
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'signInWithGoogle') {
      initiateOAuth2();
    }
  });
  
