import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
const supabase = createClient(environment.supabase.url, environment.supabase.key);
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  localData: any
  private isLoginSubject = new BehaviorSubject<boolean>(false);

  isLogin$ = this.isLoginSubject.asObservable();

  private isLoadingSUbject = new BehaviorSubject<boolean>(false)
  isLOading$ = this.isLoadingSUbject.asObservable()

  private isNotionLoginSubject = new BehaviorSubject<boolean>(false)
  isNotion = this.isNotionLoginSubject.asObservable()

  constructor(private http: HttpClient, private route: ActivatedRoute) {
this.connectToNotion()
  }
  ngOnInit() {
    this.setLoadingStatus(true)
    this.localData = localStorage.getItem('sb-qgkhqqydyzaxeqyskhrq-auth-token')

    if (this.localData) {
      this.localData = JSON.parse(this.localData)
      this.getNotionCode()
      this.signInWithGoogle()
    }else{
      this.setLoadingStatus(false)
    }
  }

  async signInWithGoogle(): Promise<any> {
    // this.setLoginStatus(false)
    return await this.initiateOAuth2()
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
          // Successful authenticatio

          if (this.localData && this.localData.access_token) {

            // Set login status and perform additional actions if needed
            this.addGoogleTokenToSupabase()
            this.route.queryParams.subscribe(params => {
              // Access and log the 'code' parameter
              let codeParam = params['code'] ? params['code']:null;
              console.log('Code parameter:', codeParam);
              if (codeParam) {
                this.addNotionTokenToSupabase();
              }
            });
            
          }
          this.setLoadingStatus(false)
          this.setLoginStatus(true);
          return true;
        } else {
          // Clear local storage and set login status to false
          localStorage.clear();
          this.setLoginStatus(false);
          this.setLoadingStatus(false)

          return false;
        }
      }

    } catch (error) {
      this.setLoadingStatus(false)
      console.error('Error during OAuth2 authentication:', error);
      return false;
    }
  }

  async getNotionCode() {
    let postData = this.getPostData()
    console.log(postData)
    this.http.post(`${environment.base_url}code`, postData).subscribe((res: any) => {
      console.log('testetetetete',res)
      if(res){
        this.isNotionLoginSubject.next(true)
      }
    })
  }

  async addGoogleTokenToSupabase() {
    try {

      let postData = this.getPostData()
      this.http.post(`${environment.base_url}add-google-token-to-supabase`, postData).subscribe((res: any) => {
        console.log(res)
        
        this.setLoginStatus(true);
      })
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
    }
  }

  async addNotionTokenToSupabase() {
    try {

      let postData = this.getPostData()
      this.http.post(`${environment.base_url}add-notion-token-to-supabase`, postData).subscribe((res: any) => {
        console.log(res)
        if (res.data[0].code != "" || res.data[0].code == null) {

        }
        else {
          this.isNotionLoginSubject.next(true)
        }
        this.setLoginStatus(true);
      })
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
    }
  }

  getPostData() {
    let codeParam
    this.route.queryParams.subscribe(params => {
      // Access and log the 'code' parameter
      codeParam = params['code'];
      console.log('Code parameter:', codeParam);
    });
    localStorage.setItem('code', codeParam)
    let postData = {
      token: this.localData.access_token,
      user_id: this.localData.user.id,
      code: codeParam ? codeParam : "",
    }
    return postData

  }


  setLoginStatus(status: boolean) {
    this.isLoginSubject.next(status);
  }

  setLoadingStatus(status: boolean) {
    this.isLoadingSUbject.next(status)
  }

  connectToNotion(): string {
		const oauthClientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a'; // Replace with your actual OAuth client ID
		return `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
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