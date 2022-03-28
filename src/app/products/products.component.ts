
import { Subscription } from 'rxjs';
import { db, DBRowStateType } from '../db';
import { IProduct } from './product.interface';
import { ProductService } from './product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from '../core/services/filter.service';
import { GrowlerMessageType, GrowlerService } from '../core/growler/growler.service';
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
        // get data from local DB After DB Setting localID
        this.productsData = await db.getAllDataFromLocaleDB("products");
        this.filteredProducts = this.productsData;
      }));
    }
  }
  // to opem Form To Add New Data and Clear Product Object
  openProductForm(content: any) {
    this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 }
    this.modalService.open(content, { centered: true });
  }
  // Add New Product
  async addNewProduct() {
    // add data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      let product = this.productsData.find(p => p.name == this.product.name || p.barcode == this.product.barcode);
      if (product) {
        this.growlService.growl("product name and barcode must be uniqe and atlest one of this is alredy exist in our database ", GrowlerMessageType.Danger)
      } else {
        await db.addRecordToLocaleDB('products', this.product);
        this.productsData = await db.getAllDataFromLocaleDB("products");
        this.filteredProducts = await db.getAllDataFromLocaleDB("products");
        this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 };
      }
      // add data to Server if is Online
    } else {
      this.subscriptions.add(this.productService.addNewProduct(this.product).subscribe(async data => {
        if (data.success) {
          this.product = { _id: undefined, name: '', barcode: '', price: 0, balance: 0 };
          await db.addRecordToLocaleDB('products', data.product, DBRowStateType.ORIGINAL);
          this.productsData = await db.getAllDataFromLocaleDB("products");
          this.filteredProducts = this.productsData;
          this.growlService.growl(data.message, GrowlerMessageType.Success);
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
  }

  // Update Product
  updateProduct(modal: any) {
    // Update data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      db.updateRecordFromLocaleDB('products', this.product);
      this.growlService.growl("Sussess update", GrowlerMessageType.Success);
      modal.dismiss()
    } else {
      // Update data to Server if is Online
      this.subscriptions.add(this.productService.updateProduct(this.product).subscribe(async data => {
        if (data.success) {
          data.product.localId = this.product.localId;
          await db.updateRecordFromLocaleDB('products', data.product, DBRowStateType.ORIGINAL);
          this.growlService.growl(data.message, GrowlerMessageType.Success);
          modal.dismiss();
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
  }
  // filtring products data by name or barcode
  filterChanged(data: any) {
    if (data && this.productsData) {
      data = data.toUpperCase();
      const props = ['name', 'barcode'];
      this.filteredProducts = this.filterService.filter<IProduct[]>(this.productsData, data, props);
    } else {
      this.filteredProducts = this.productsData;
    }
  };

  ////////////////////////////////////////////////////////           
  //////////////// >>> PWA <<<<<<<///////////////////////
  //////////////////////////////////////////////////////     

  ////// this function to do check if the connction Changed to update data from Local DB to server DB
  private listenToConctionEvent(conction: NetworkConnectionService) {
    conction.connctionChanged.subscribe(async (online) => {
      if (online) {
        let addedData = await db.getDataByState("products", DBRowStateType.ADDED);
        let updatedData = await db.getDataByState("products", DBRowStateType.UPDATED);
        let deletedData = await db.getDataByState("products", DBRowStateType.DELETED);
        if (addedData != null) await this.addNewBulkOfProductsFromLocalDB(addedData);
        if (updatedData != null) await this.updateBulkOfProductsFromLocalDB(updatedData);
        if (deletedData != null) await this.deleteBulkOfProductsFromLocalDB(deletedData);
        console.log("went online");
      } else {
        console.log('went offline');
      }
    });
  }

  //////////////////  Update  Bulk Of Products  >>> PWA <<< ///////////////
  async updateBulkOfProductsFromLocalDB(updatedData: any) {
    let localIds: number[] = [];
    updatedData?.data?.forEach((obj: any) => {
      localIds.push(obj.localId);
    });
    await this.productService.updateBulkProduct(updatedData.data).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("products", localIds);
        let data: IProduct[] = res.products?.filter((p: IProduct, index: number) => res.products[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("products", data);
        this.productsData = await db.getAllDataFromLocaleDB("products");
        this.filteredProducts = await db.getAllDataFromLocaleDB("products");
      }
    });
  }
  //////////////////  Delete  Bulk Of Products  >>> PWA <<< ///////////////
  async deleteBulkOfProductsFromLocalDB(deletedData: any) {
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
  //////////////////  Add  Bulk Of Products  >>> PWA <<< ///////////////
  async addNewBulkOfProductsFromLocalDB(addedData: any) {
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
