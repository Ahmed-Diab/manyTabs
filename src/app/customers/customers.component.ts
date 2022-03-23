import { Component, OnInit } from '@angular/core';
import { ICustomer } from './customer.interface';
import data from '../../assets/data.json';
import { ITab, TabService } from '../tab.service';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customersData: ICustomer[] = [];
  pageId: number = 1;
  constructor(
    private tabService:TabService
  ) { }

  ngOnInit(): void {
    this.getCustomers()
  }
  getCustomers() {
      // get tab from local storge
      let tab = this.tabService.findTabByPageIdFromLoclStorge(this.pageId);
      // if this tab is alredy opened will get data from local storge
      if (tab && tab.data.length > 0) {
        this.customersData = tab.data;
      } else {
        // if you open this tab for first time will get data from  json file
        //you can change the next line to get data from the server
        this.customersData = data.customers;
        // set data to the tab in local storge
        this.tabService.addDataToTabInLocalStorge(tab, data.customers);
      }
    }
}
