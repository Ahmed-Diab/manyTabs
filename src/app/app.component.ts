import { db } from "./db";
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "./core/services/auth.service";
import { GrowlerService } from "./core/growler/growler.service";
import { LoggerService } from "./core/services/logger.service";
import { ITab, TabService } from "./main-content/tab.service";
import { Subscription } from "rxjs";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  navbarOpen:boolean = false;
  activeId=1;
  isCollapsed: boolean;
  loginLogoutText = 'Login';
  sub: Subscription;
  navbarCollapsed:boolean = true;
  menuOptions: ITab[] = [];
  @Output() TabEvent = new EventEmitter<ITab>();
  constructor(private router: Router,
      private authservice: AuthService,
      private growler: GrowlerService,
      private logger: LoggerService,
      private tabService: TabService) { }

  ngOnInit() {
    this.menuOptions = this.tabService.tabOptions;
    localStorage.clear()
    localStorage.setItem("openedTabs", "[]");
    db.initLocalDB();
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
 
 
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }
}
