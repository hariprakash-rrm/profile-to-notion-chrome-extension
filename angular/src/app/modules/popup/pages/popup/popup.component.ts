import { Component, HostListener, Inject } from '@angular/core';
import { bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import { TAB_ID } from '../../../../providers/tab-id.provider';
import { AuthService } from 'src/app/modules/auth.service';

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent {
  message: any;
  isLogin: boolean = false
  isLoginObservable: any
  loading:boolean =false

  constructor(@Inject(TAB_ID) readonly tabId: number,private authService:AuthService) {}

  async ngOnInit() {
    this.loading =true
    await this.authService.ngOnInit()
    this.isLoginObservable = this.authService.isLogin$.subscribe(async(status: boolean) => {
      this.isLogin =await status
      this.loading=await false
      console.log(status,this.loading,'status')
    })
  }


  signInWithGoogle() {
    this.loading =true
    this.authService.signInWithGoogle()
  }

  signout() {
    this.loading =true
    this.authService.signout()
  }

  async onClick(): Promise<void> {
    try {
      this.message = await bindCallback<any, any>(chrome.tabs.sendMessage.bind(this, this.tabId, 'request'))()
        .pipe(
          map(msg =>
            chrome.runtime.lastError
              ? msg
              : msg
          )
        )
        .toPromise();
        console.log('message = = = =',this.message)
        if(this.message?.success==false){
          this.message={
            Error:["Go to people's linkedIn profile and try again"]
          }
        }
    } catch (error) {
      // Handle the error here
      console.error("An error occurred:", error);
      // You can also set a default value for this.message or perform any other necessary action
    }
  }
  

  getObjectEntries(): { key: string; value: string[] }[] {
    return this.message ? Object.entries(this.message).map(([key, value]) => ({ key, value: value as unknown as string[] })) : [];
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Check for a specific key combination, e.g., Ctrl + Alt + C
    if (event.ctrlKey && event.altKey && event.key === 'c') {
      this.onClick();
    }
  }


 
}
