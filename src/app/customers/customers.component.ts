import { Component, OnInit } from '@angular/core';
import { ICustomer } from './customer.interface';
import customers from '../../assets/customers.json';
import { ITab } from '../tab.service';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customersData: ICustomer[] = [];
  pageId: number = 1;
  constructor(
  ) { }

  ngOnInit(): void {
    this.getCustomers()
  }
  getCustomers() {
    let openedTabsBeforParse: any = localStorage.getItem("openedTabs");
    if (openedTabsBeforParse != undefined) {
      let openedTabs: ITab[] = JSON.parse(openedTabsBeforParse);
      let page: any = openedTabs.find(p => p.id === this.pageId);
      if (page && page.data.length > 0) {
        this.customersData = page.data;
      } else {
        page.data = customers;
        this.customersData = customers;
        localStorage.setItem("openedTabs", JSON.stringify(openedTabs))
      }
    }
  }

}
