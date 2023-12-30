import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ReactiveFormsModule } from '@angular/forms';
import { SupabaseClient } from '@supabase/supabase-js';

@NgModule({
  declarations: [AppComponent, ],
  imports: [BrowserModule, AppRoutingModule,ReactiveFormsModule],
  bootstrap: [AppComponent],
  providers:[]
})
export class AppModule {}
