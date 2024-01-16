import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

const supabase = createClient(environment.supabase.url, environment.supabase.key);
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoginSubject = new BehaviorSubject<boolean>(false);

  isLogin$ = this.isLoginSubject.asObservable();

  constructor() {

  }
  ngOnInit() {
    let localData: any = localStorage.getItem('sb-qgkhqqydyzaxeqyskhrq-auth-token')
    
    if (localData) {
      localData = JSON.parse(localData)
      this.signInWithGoogle()
    }
  }

  async signInWithGoogle():Promise<any> {
    // this.setLoginStatus(false)
    return await  this.initiateOAuth2()
  }

  async initiateOAuth2(): Promise<boolean> {
    try {
      const manifest = chrome.runtime.getManifest();
      const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
      
      // Set OAuth2 parameters
      authUrl.searchParams.set('client_id', manifest.oauth2.client_id);
      authUrl.searchParams.set('response_type', 'id_token');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`);
      authUrl.searchParams.set('scope', manifest.oauth2.scopes.join(' '));
  
      // Launch OAuth2 flow
      const redirectedTo = await chrome.identity.launchWebAuthFlow({
        url: authUrl.href,
        interactive: true,
      });
  
      // Handle authentication response
      if (chrome.runtime.lastError) {
        console.error('Authentication error:', chrome.runtime.lastError);
        return false;
      } else {
        const redirectUrl = new URL(redirectedTo);
        const params = new URLSearchParams(redirectUrl.hash.substring(1)); // Remove the '#' character
  
        // Sign in with id_token using Supabase authentication
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: params.get('id_token'),
        });
  
        console.log(data, error);
  
        if (data) {
          // Successful authentication
          let localData: any = localStorage.getItem('sb-qgkhqqydyzaxeqyskhrq-auth-token');
          localData = JSON.parse(localData);
  
          if (localData && localData.access_token) {
           
            // Set login status and perform additional actions if needed
            this.setLoginStatus(true);
          }
  
          return true;
        } else {
          // Clear local storage and set login status to false
          localStorage.clear();
          this.setLoginStatus(false);
  
          return false;
        }
      }
    } catch (error) {
      console.error('Error during OAuth2 authentication:', error);
      return false;
    }
  }
  

  setLoginStatus(status: boolean) {
    this.isLoginSubject.next(status);
  }

  async getUserInfo(idToken) {

    const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
    return decodedToken;
  }

  signout(): void {

    const { error }: any = supabase.auth.signOut().then((res: any) => {
      this.setLoginStatus(false)
      console.log(res)
    })
    console.log(error)

  }
}
