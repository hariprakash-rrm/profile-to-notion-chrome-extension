import { Component, HostListener, Inject, OnInit } from '@angular/core';

import { TAB_ID } from '../../../../providers/tab-id.provider';
import { AuthService } from 'src/app/modules/auth.service';
@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
  message: any;
  isLogin: boolean = false;
  isLoginObservable: any;
  loading: boolean = true;
  isNotionLoggedIn = false
  extensionBasePath = "https://notion-backend-cvzk.onrender.com/";

  constructor(@Inject(TAB_ID) readonly tabId: number, private authService: AuthService) { }


    async ngOnInit(): Promise<void> {
      this.loading = true;
  
      // Assuming you have an async initialization method in your AuthService
      await this.authService.ngOnInit();
  
      this.isLoginObservable = this.authService.isLogin$.subscribe(async (status: boolean) => {
        this.isLogin = await status;
      });
  
  
      this.isLoginObservable = this.authService.isLOading$.subscribe(async (status: boolean) => {
        this.loading = status;
      });
  
      this.isLoginObservable = this.authService.isNotion.subscribe(async(status:boolean)=>{
        this.isNotionLoggedIn = status
      })
    }
  
    async signInWithGoogle(): Promise<void> {
      this.loading = true;
  
      try {
        const res: boolean = await this.authService.signInWithGoogle();
      } finally {
        this.loading = false;
      }
    }
  
    async signout() {
      this.loading = true;
      this.authService.signout();
    }
  
    connectToNotion(): string {
      const oauthClientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a'; // Replace with your actual OAuth client ID
      return `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
    }

    createTab(){
    let extensionURL = 'chrome-extension://efddgiiofffihbdmioelhlmckdidacpj/index.html#/'
      chrome.tabs.create({ url: extensionURL }, function (newTab) {
        // Close the tab with the old URL
        // chrome.tabs.remove(tabId);
      });
    }
}
