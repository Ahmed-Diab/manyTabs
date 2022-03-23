import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabService {

  tabs: ITab[] = [];
  private tabChanged = new Subject<any>();
  tabChanged$ = this.tabChanged.asObservable();
  tabOptions: ITab[] = [
    { id: 1, name: 'Customers', url: '/customers', data: [], isActive: false },
    { id: 2, name: 'Cuntries', url: '/cuntries', data: [], isActive: false },
    { id: 3, name: 'Products', url: '/products', data: [], isActive: false }
  ];

  constructor() { }
  onTabChange(key: any) {
    this.tabChanged.next(key);
  }
  addTab(url: string) {
    const tab: any = this.getTabOptionByUrl(url);
    if (!this.tabs.includes(tab)) {
      this.tabs.push(tab);
      this.tabs.filter(obj => {
        obj.id !== tab.id
          ? obj.isActive = false : obj.isActive = true;
      });
    }
  }

  getTabOptionByUrl(url: string) {
    return this.tabOptions.find((tab: ITab) => tab.url === url);
  }

  deleteTab(tab: ITab, index: number) {
    this.tabs.splice(index, 1);
    let openedTabsBeforParse: any = localStorage.getItem("openedTabs");
    if (openedTabsBeforParse != undefined) {
      let openedTabs: ITab[] = JSON.parse(openedTabsBeforParse);
      openedTabs = openedTabs.filter(p => p.id !== tab.id);
      localStorage.setItem("openedTabs", JSON.stringify(openedTabs))

    }
  }
}
export interface ITab {
  id: number;
  name: string;
  url: string;
  data: any[];
  isActive: boolean;
}