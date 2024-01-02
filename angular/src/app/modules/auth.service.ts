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
    localData = JSON.parse(localData)
    if (localData) {
      this.signInWithGoogle()
    }
  }

  signInWithGoogle() {
    // this.setLoginStatus(false)
    this.initiateOAuth2()
  }

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
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: params.get('id_token'),
          })
          console.log(data, error)
          if (data) {
            let localData: any = localStorage.getItem('sb-qgkhqqydyzaxeqyskhrq-auth-token')
            localData = JSON.parse(localData)
            console.log(localData.access_token)
            if (localData) {

              this.setLoginStatus(true)
            }
          } else {
            localStorage.clear()

            this.setLoginStatus(false)

          }
        }
      }
    );
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
