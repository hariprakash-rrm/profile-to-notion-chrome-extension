import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';



  // const { id: tabId } = [...tabs].pop();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
