import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProduct } from './product.interface';
import { TabService } from '../tab.service';
import { FilterService } from '../core/services/filter.service';
import { ProductService } from './product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GrowlerMessageType, GrowlerService } from '../core/growler/growler.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  pageId: number = 3;
  product: IProduct = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 }
  productsData: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private tabService: TabService,
    private filterService: FilterService,
    private modalService: NgbModal,
    private growlService: GrowlerService
  ) {
  }


  ngOnInit(): void {
    this.getProducts();

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  changeGridData(products: IProduct[]) {
    this.filteredProducts = products;
    this.productsData = products;
  }

  getProductData(content: any, product: any) {
    let data = product;
    this.product = data;
    this.modalService.open(content, { centered: true });
  }

  getProducts() {
    // get tab from local storge
    let tab = this.tabService.findTabByPageIdFromLoclStorge(this.pageId);
    // if this tab is alredy opened will get data from local storge
    if (tab && tab.data.length > 0) {
      this.productsData = tab.data;
      this.filteredProducts = tab.data;
    } else {
      // if you open this tab for first time will get data from  json file
      //you can change the next line to get data from the server
      //this.productsData = data.products;
      this.subscriptions.add(this.productService.getAllProducts().subscribe(data => {
        this.productsData = data.products;
        this.filteredProducts = data.products;
        this.tabService.addDataToTabInLocalStorge(tab, data.products);
      }))
      // set data to the tab in local storge
    }
  }

  addProduct(content: any) {
    this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 }
    this.modalService.open(content, { centered: true });
  }

  addNewProduct() {
    this.subscriptions.add(this.productService.addNewProduct(this.product).subscribe(data => {
      if (data.success) {
        this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 }
        this.productsData.push(data.product);
        this.tabService.findByIdAndAddData(this.pageId, this.productsData)
        this.growlService.growl(data.message, GrowlerMessageType.Success);
      } else {
        this.growlService.growl(data.message, GrowlerMessageType.Danger);
      }
    }));
  }

  updateProduct(modal: any) {
    this.subscriptions.add(this.productService.updateProduct(this.product).subscribe(data => {
      if (data.success) {
        this.tabService.findByIdAndUpdateData(this.pageId, this.product)
        this.growlService.growl(data.message, GrowlerMessageType.Success);
        modal.dismiss()
      } else {
        this.growlService.growl(data.message, GrowlerMessageType.Danger);
      }
    }));
  }

  filterChanged(data: any) {
    if (data && this.productsData) {
      data = data.toUpperCase();
      const props = ['name', 'barcode'];
      this.filteredProducts = this.filterService.filter<IProduct[]>(this.productsData, data, props);
    } else {
      this.filteredProducts = this.productsData;
    }
  };

}
