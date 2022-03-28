
import { Router } from '@angular/router';
import { ITab, TabService } from './../tab.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  menuOptions: ITab[] = [];
  @Output() TabEvent = new EventEmitter<ITab>();
  constructor(private tabService: TabService, private router: Router) { }

  ngOnInit() {
    this.menuOptions = this.tabService.tabOptions;
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
}
