import { Component, OnInit } from '@angular/core';
import { IProduct } from './product.interface';
import data from "../../assets/data.json";
import { TabService } from '../tab.service';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  pageId: number = 3;
  productsData: IProduct[] = [];
  constructor(private tabService: TabService) { }
  ngOnInit(): void {
    this.getProducts();
  }
  getProducts() {
    // get tab from local storge
    let tab = this.tabService.findTabByPageIdFromLoclStorge(this.pageId);
    // if this tab is alredy opened will get data from local storge
    if (tab && tab.data.length > 0) {
      this.productsData = tab.data;
    } else {
      // if you open this tab for first time will get data from  json file
      //you can change the next line to get data from the server
      this.productsData = data.products;
      // set data to the tab in local storge
      this.tabService.addDataToTabInLocalStorge(tab, data.products);
    }
  }
}
