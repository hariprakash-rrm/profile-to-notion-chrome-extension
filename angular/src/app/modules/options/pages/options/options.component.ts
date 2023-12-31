import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

const supabase = createClient(environment.supabase.url, environment.supabase.key);

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {
  userInfo: string | null = null;
  constructor(){

  }
  ngOnInit() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === 'userInfo') {
        this.userInfo = request.userInfo;
        console.log('userINfo : ',this.userInfo)
      }
    });
  }

  signInWithGoogle() {
    // chrome.runtime.sendMessage({ message: 'signInWithGoogle' });
    this.initiateOAuth2()
  }

  // Function to initiate OAuth2 authentication
 initiateOAuth2() {
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
        const params = new URLSearchParams(url.hash.substring(1)); // Remove the '#' character
        // // Extract the value of the id_token parameter
        // const idToken = params.get('id_token');
        // const userInfo = await this.getUserInfo(params.get('id_token'));
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: params.get('id_token'),
        })
        console.log(data,error)
        // sendMessageToAngularApp('userInfo', userInfo);
      }
    }
  );
}

// Function to get user information from the ID token
async  getUserInfo(idToken) {

  const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
  return decodedToken;
}
}
