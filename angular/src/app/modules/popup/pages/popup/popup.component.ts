import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import { TAB_ID } from '../../../../providers/tab-id.provider';
import { AuthService } from 'src/app/modules/auth.service';
import axios from 'axios';
@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
  message: any;
  isLogin: boolean = false;
  isLoginObservable: any;
  loading: boolean = false;

  constructor(@Inject(TAB_ID) readonly tabId: number, private authService: AuthService) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    // Assuming you have an async initialization method in your AuthService
    await this.authService.ngOnInit();

    this.isLoginObservable = this.authService.isLogin$.subscribe(async (status: boolean) => {
      this.isLogin = await status;
      this.loading = false;
      console.log(status, this.loading, 'status');
    });
  }

  async signInWithGoogle(): Promise<void> {
    this.loading = true;

    try {
      const res: boolean = await this.authService.signInWithGoogle();
      console.log(this.loading, res, 'signinwithgoogle');
    } finally {
      this.loading = false;
    }
  }

  signout(): void {
    this.loading = true;
    this.authService.signout();

    this.createDbInNotion()
  }

  async onClick(): Promise<void> {
    if (!this.isLogin) {
      return
    }
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

      console.log('message = = = =', this.message);

      if (this.message?.success === false) {
        this.message = {
          Error: ["Go to people's LinkedIn profile and try again"]
        };
      }
    } catch (error) {
      // Handle the error here
      console.error('An error occurred:', error);
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

  async createDbInNotion() {
    let localData: any = localStorage.getItem('sb-qgkhqqydyzaxeqyskhrq-auth-token');
          localData = JSON.parse(localData);
    chrome.runtime.sendMessage({method: "getStatus",authData:localData}, function(response) {
      console.log('Test = = = = = = ',JSON.parse(response));

    });
    axios.post("http://localhost:3000/create", localData)
    .then(async (resp) => ( await resp.data))
    .catch((error) => console.error("Error during POST request:", error));
  }
}
