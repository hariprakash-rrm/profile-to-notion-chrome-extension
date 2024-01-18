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
      // this.signInWithGoogle()
    }
  }

  async signInWithGoogle():Promise<any> {
    // this.setLoginStatus(false)
    return await  this.initiateOAuth2()
  }

  async initiateOAuth2(): Promise<boolean> {
    try {
     
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })

      console.log({ data, error })
      return true
      
    } catch (error) {
      console.error('Error during OAuth2 authentication:', error);
      return false;
    }
  }
  

  setLoginStatus(status: boolean) {
    this.isLoginSubject.next(status);
  }

  async getUserInfo(idToken:any) {

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
