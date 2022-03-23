import { ITab } from './../tab.service';
import { Component, OnInit } from '@angular/core';
import { TabService } from '../tab.service';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {
  tabs: ITab[] = [];
  activeTabUrl: any;
  active: any;
  constructor(public sanitizer: DomSanitizer, private tabService: TabService, private router: Router) {
    this.tabService.tabChanged$.subscribe((data: ITab) => {
      if (data) {
        this.tabs.filter(obj => {
          obj.id !== data.id
            ? obj.isActive = false : obj.isActive = true;
        });
      }
    })
  }

  ngOnInit() {
    this.tabs = this.tabService.tabs;
    if (this.tabs.length == 0) this.router.navigateByUrl('home');
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     this.activeTabUrl = event.urlAfterRedirects;
    //     if (this.tabs.length === 0) {
    //       this.tabService.addTab(this.activeTabUrl);
    //     }
    //   }
    // });
  }

  closeTab(tab: ITab, event: Event, index: number) {
    this.tabService.deleteTab(tab, index);
    event.preventDefault();
    if (this.tabs.length == 0) this.router.navigateByUrl('home');
  }
  onTabChange(tab: ITab) {
    this.tabs.filter(obj => {
      obj.id !== tab.id
        ? obj.isActive = false : obj.isActive = true;
    });
    this.router.navigateByUrl(tab.url);
  }
}
