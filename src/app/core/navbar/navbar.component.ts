import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { GrowlerService, GrowlerMessageType } from '../growler/growler.service';
import { LoggerService } from '../services/logger.service';
import { ITab, TabService } from 'src/app/tab.service';

@Component({
    selector: 'mt-navbar',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
    activeId=1;
    isCollapsed: boolean;
    loginLogoutText = 'Login';
    sub: Subscription;

    menuOptions: ITab[] = [];
    @Output() TabEvent = new EventEmitter<ITab>();
    constructor(private router: Router,
        private authservice: AuthService,
        private growler: GrowlerService,
        private logger: LoggerService,
        private tabService: TabService) { }
  
    ngOnInit() {
      this.menuOptions = this.tabService.tabOptions;
    //   this.sub = this.authservice.authChanged
    //   .subscribe((loggedIn: boolean) => {
    //       this.setLoginLogoutText();
    //   },
    //   (err: any) => this.logger.log(err));
    }
    openTab(option: any) {
      this.tabService.addTab(option.url);
      this.router.navigateByUrl(option.url);
      var tabs: ITab[] = this.tabService.getTabsFromLocalStorge();
      let page: any = tabs.find(p => p.id === option.id);
      if (!page) {
        tabs.push(option);
        tabs.filter(tab => {
          tab.id !== option.id
            ? tab.isActive = false : tab.isActive = true;
        });
        localStorage.setItem("openedTabs", JSON.stringify(tabs));
      }
      this.tabService.onTabChange(option);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
