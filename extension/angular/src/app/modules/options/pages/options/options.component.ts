import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth.service';
import { environment } from 'src/environments/environment';

import { TAB_ID } from 'src/app/providers/tab-id.provider';


@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {

  isLogin: boolean = false
  isLoginObservable: any
  loading: boolean = false
  isNotionLoggedIn = false
  currentState=0

  constructor(private authService: AuthService, @Inject(TAB_ID) readonly tabId: number) {

  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    // Assuming you have an async initialization method in your AuthService
    await this.authService.ngOnInit();

    this.isLoginObservable = this.authService.isLogin$.subscribe(async (status: boolean) => {
      this.isLogin = await status;
      this.currentState = 1
    });


    this.isLoginObservable = this.authService.isLOading$.subscribe(async (status: boolean) => {
      this.loading = status;
    });

    this.isLoginObservable = this.authService.isNotion.subscribe(async(status:boolean)=>{
      this.isNotionLoggedIn = status
      this.currentState=2
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

  getNotionCode(){
    this.authService.getNotionCode()
  }

}


