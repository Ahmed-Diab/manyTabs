import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProduct } from './product.interface';
import { TabService } from '../tab.service';
import { FilterService } from '../core/services/filter.service';
import { ProductService } from './product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GrowlerMessageType, GrowlerService } from '../core/growler/growler.service';
import { Subscription } from 'rxjs';
import { db, DBRowStateType } from '../db';
import { NetworkConnectionService } from '../core/services/network-connection.service';

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
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService
  ) {
    this.listenToConctionEvent(this.conctionService)
  }


  ngOnInit(): void {
    this.getProducts();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private listenToConctionEvent(conction: NetworkConnectionService) {
    conction.connctionChanged.subscribe(async (online) => {
      if (online) {
        let addedData = await db.getDataByState("products", DBRowStateType.ADDED);
        let deletedData = await db.getDataByState("products", DBRowStateType.DELETED);
        if (addedData != null) await this.addNewBulkOfProductsFromLocalDB(addedData);
        if (deletedData != null) await this.deleteBulkOfProductsFromLocalDB(deletedData);
        console.log("went online");
      } else {
        console.log('went offline');
      }
    });
  }

  //////////////////  update offline data ///////////////
  async deleteBulkOfProductsFromLocalDB(deletedData: any) {
    if (deletedData != null) {
      let ids: string[] = [];
      let localIds: number[] = [];
      deletedData?.data?.forEach((obj: any) => {
        ids.push(obj._id);
        localIds.push(obj.localId);
      });
      await this.productService.deleteBulkProduct(ids).subscribe(async (res) => {
        if (res.success) {
          await db.deleteBulkFromLocaleDB("products", localIds);
          this.productsData = await db.getAllDataFromLocaleDB("products");
          this.filteredProducts = await db.getAllDataFromLocaleDB("products");
        }
      });
    }


  }
  async addNewBulkOfProductsFromLocalDB(addedData: any) {
    if (addedData != null) {
      await this.productService.addBulkProduct(addedData.data).subscribe(async (res) => {
        if (res.success) {
          await db.deleteBulkFromLocaleDB("products", addedData.ids);
          let data: IProduct[] = res.products?.filter((p: IProduct, index: number) => res.products[index].state = "Original")
          await db.addBulkOfDataToLocaleDB("products", data);
          this.productsData = await db.getAllDataFromLocaleDB("products");
          this.filteredProducts = await db.getAllDataFromLocaleDB("products");
        }
      });
    }
  }

  changeGridData(products: IProduct[]) {
    this.filteredProducts = products;
    this.productsData = products;
  }

  getProductDataFromGrid(content: any, product: any) {
    let data = product;
    this.product = data;
    this.modalService.open(content, { centered: true });
  }

  async getProducts() {
    // get data from local DB
    let data = await db.getAllDataFromLocaleDB("products");
    // if this tab is alredy opened will get data from local DB
    if (data && data.length > 0) {
      this.productsData = data;
      this.filteredProducts = data;
    } else {
      // if you open this tab for first time will get data from  API
      this.subscriptions.add(this.productService.getAllProducts().subscribe(async data => {
        // add Data to localDB
        let products: any[] = await data.products?.filter((p: IProduct, index: number) => data.products[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("products", products);
        this.productsData = await db.getAllDataFromLocaleDB("products");
        this.filteredProducts = await db.getAllDataFromLocaleDB("products");
      }));
    }
  }

  openProductForm(content: any) {
    this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 }
    this.modalService.open(content, { centered: true });
  }

  async addNewProduct() {
    if (!this.conctionService.isOnline) {
      await db.addRecordToLocaleDB('products', this.product);
      this.productsData = await db.getAllDataFromLocaleDB("products");
      this.filteredProducts = await db.getAllDataFromLocaleDB("products");
      this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 };

    } else {
      this.subscriptions.add(this.productService.addNewProduct(this.product).subscribe(async data => {
        if (data.success) {
          this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 };
          console.log(data.product);
          await db.addRecordToLocaleDB('products', data.product, DBRowStateType.ORIGINAL);
          this.productsData = await db.getAllDataFromLocaleDB("products");
          this.filteredProducts = await db.getAllDataFromLocaleDB("products");
          this.growlService.growl(data.message, GrowlerMessageType.Success);
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
  }

  updateProduct(modal: any) {
    if (!this.conctionService.isOnline) {
      db.updateRecordFromLocaleDB('products', this.product);
    } else {
      this.subscriptions.add(this.productService.updateProduct(this.product).subscribe(data => {
        if (data.success) {
          db.updateRecordFromLocaleDB('products', this.product, DBRowStateType.ORIGINAL);
          this.growlService.growl(data.message, GrowlerMessageType.Success);
          modal.dismiss()
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }

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
