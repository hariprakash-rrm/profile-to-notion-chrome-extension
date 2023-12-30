import { Component, OnInit } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {

  constructor(private supabase:SupabaseClient){

  }
  ngOnInit(): void {
    // this.supabase.auth.signInWithOAuth({
    //   provider: 'google',
    // })
    
  }
}
