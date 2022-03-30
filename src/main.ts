import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// //import {NgbdTypeaheadConfigModule} from './app/typeahead-config.module';

// platformBrowserDynamic()
//     .bootstrapModule(NgbdTypeaheadConfigModule)
//     .then(ref => {
//       // Ensure Angular destroys itself on hot reloads.
//       if (window['ngRef']) {
//         window['ngRef'].destroy();
//       }
//       window['ngRef'] = ref;

//       // Otherwise, log the boot error
//     })
//     .catch(err => console.error(err));

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
