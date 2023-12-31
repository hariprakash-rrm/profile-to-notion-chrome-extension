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
  message: string;
  userInfo: string | null = null;

  constructor(@Inject(TAB_ID) readonly tabId: number) {}

  async onClick(): Promise<void> {
    this.message = await bindCallback<any, any>(chrome.tabs.sendMessage.bind(this, this.tabId, 'request'))()
      .pipe(
        map(msg =>
          chrome.runtime.lastError
            ? 'The current page is protected by the browser, goto: https://www.google.nl and try again.'
            : msg
        )
      )
      .toPromise();

      console.log(this.message,'messageee = = ')
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
