import { ITab, TabService } from './../tab.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  menuOptions: ITab[] = [];
  @Output()  TabEvent = new EventEmitter<ITab>(); 
  constructor(private tabService: TabService, private router: Router) { }

  ngOnInit() {
    this.menuOptions = this.tabService.tabOptions;
  }
  openTab(option: any) {
    this.tabService.addTab(option.url);
    this.router.navigateByUrl(option.url);
    var tabs = localStorage.getItem("openedTabs");
    if (tabs) {
      let openedTabsBeforParse: any = localStorage.getItem("openedTabs");
      let openedTabs: any[] = JSON.parse(openedTabsBeforParse);
      let page: any = openedTabs.find(p => p.id === option.id);
      if (!page) {
        option.isActive = true;
        openedTabs.push(option);
         openedTabs.filter(tab => {
          tab.id !== option.id
            ? tab.isActive = false : tab.isActive = true;
        });
        localStorage.setItem("openedTabs", JSON.stringify(openedTabs));
      }
      this.tabService.onTabChange(option);
    } else {
      let newTabs: any[] = [];
      option.isActive = true;
      newTabs.push(option)
      localStorage.setItem("openedTabs", JSON.stringify(newTabs))
    }
  }
}
