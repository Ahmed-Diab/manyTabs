import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router
  ) { }

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

  // remove tab from local storge and tabs
  deleteTab(tab: ITab, index: number) {
    this.tabs.splice(index, 1);
    let openedTabs: ITab[] = this.getTabsFromLocalStorge();
    openedTabs = openedTabs.filter(p => p.id !== tab.id);
    if (openedTabs.length > 0) {
      this.onTabChange(openedTabs[0])
      this.router.navigateByUrl(openedTabs[0].url)
    };
    localStorage.setItem("openedTabs", JSON.stringify(openedTabs));
  }

  findTabByPageIdFromLoclStorge(id: number): ITab {
    let openedTabs: ITab[] = this.getTabsFromLocalStorge();
    let page: any = openedTabs.find(p => p.id === id);
    return page ? page : null;
  }

  getTabsFromLocalStorge(): ITab[] {
    let openedTabsBeforParse: any = localStorage.getItem("openedTabs");
    let openedTabs: ITab[] = JSON.parse(openedTabsBeforParse);
    return openedTabs;
  }

  addDataToTabInLocalStorge(tab: ITab, data: any[]) {
    let tabs = this.getTabsFromLocalStorge();
    tabs.forEach(obj => {
      if (obj.id == tab.id) {
        obj.data = data;
      }
    });
    localStorage.setItem("openedTabs", JSON.stringify(tabs))
  }

  // async findByIdAndAddData(tabId: number, data: any[]) {
  //   let tabs = await this.getTabsFromLocalStorge();
  //   await tabs.forEach(obj => {
  //     if (obj.id == tabId) {
  //       obj.data = data;
  //     }
  //   });
  //   await localStorage.setItem("openedTabs", JSON.stringify(tabs))
  // }
  // to update tabs Data if Changed
  // findByIdAndUpdateData(tabId: number, data: any) {
  //   let tabs = this.getTabsFromLocalStorge();
  //   tabs.forEach(obj => {
  //     if (obj.id == tabId) {
  //       // filter to find data by id and update
  //       obj.data = obj.data.filter((x: any) => {
  //         if (x._id === data._id) {
  //           x = data;
  //         }
  //       });
  //     }
  //   });
  //   localStorage.setItem("openedTabs", JSON.stringify(tabs))
  // }
}
export interface ITab {
  id: number;
  name: string;
  url: string;
  data: any[];
  isActive: boolean;
}