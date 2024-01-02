import { Component, OnDestroy, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from 'src/app/modules/auth.service';
import { environment } from 'src/environments/environment';

const supabase = createClient(environment.supabase.url, environment.supabase.key);

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {

  isLogin: boolean = false
  isLoginObservable: any
  loading:boolean =false
  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    this.loading =true
    this.authService.ngOnInit()
    this.isLoginObservable = this.authService.isLogin$.subscribe((status: boolean) => {
      this.isLogin = status
      this.loading=false
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

}
