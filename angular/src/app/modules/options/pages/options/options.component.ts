import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from 'src/app/modules/auth.service';
import { environment } from 'src/environments/environment';

import { TAB_ID } from 'src/app/providers/tab-id.provider';
const supabase = createClient(environment.supabase.url, environment.supabase.key);

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {

  isLogin: boolean = false
  isLoginObservable: any
  loading: boolean = false
  constructor(private authService: AuthService, @Inject(TAB_ID) readonly tabId: number) {

  }

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

  async signout() {
    this.loading = true;
    this.authService.signout();
  }

}


