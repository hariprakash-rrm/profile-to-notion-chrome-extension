import { Component, HostListener, Inject } from '@angular/core';
import { bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import { TAB_ID } from '../../../../providers/tab-id.provider';

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent {
  message: any;
  userInfo: string | null = null;

  constructor(@Inject(TAB_ID) readonly tabId: number) {}

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

  ngOnInit() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === 'userInfo') {
        this.userInfo = request.userInfo;
        console.log('user = = == = ',this.userInfo)
      }
    });
  }
 
}
