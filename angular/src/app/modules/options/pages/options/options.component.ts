import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {
  userInfo: string | null = null;
  constructor(){

  }
  ngOnInit() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === 'userInfo') {
        this.userInfo = request.userInfo;
      }
    });
  }

  signInWithGoogle() {
    chrome.runtime.sendMessage({ message: 'signInWithGoogle' });
  }
}
