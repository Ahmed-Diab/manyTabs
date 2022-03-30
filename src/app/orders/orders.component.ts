import {  Subscription } from 'rxjs';
import { db, DBRowStateType } from '../db';
import { OrderService } from './order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IOrder, IOrderLine } from './order.interface';
import { IProduct } from '../products/product.interface';
import { ICustomer } from '../customers/customer.interface';
import { ProductService } from '../products/product.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomerService } from '../customers/customer.service';
import { FilterService } from '../core/services/filter.service';
import { LoggerService } from '../core/services/logger.service';
import { GrowlerMessageType, GrowlerService } from '../core/growler/growler.service';
import { NetworkConnectionService } from '../core/services/network-connection.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  pageId: number = 3;
  ordersData: IOrder[] = [];
  productList: IProduct[] = [];
  filteredOrders: IOrder[] = [];
  customersList: ICustomer[] = [];
  formatter = (x: { name: string }) => x.name;
  filterProductModel: any = { name: "", _id: "" };
  subscriptions: Subscription = new Subscription();
  filterCustomerModel: any = { name: "", _id: "" };
  order: IOrder = { _id: undefined, total: 0, createdAt: new Date().toString(), orderLines: [], customer: { email: "", name: "", phoneNumber: "" } }

  constructor(
    private orderService: OrderService,
    private filterService: FilterService,
    private modalService: NgbModal,
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService,
    private customerService: CustomerService,
    private productService: ProductService,
    private logger:LoggerService

  ) {
    this.listenToConctionEvent(this.conctionService)
  }

  ngOnInit() {
    this.getOrders();
    this.subscriptions.add(this.productService.getAllProducts().subscribe((res) => {
      if (res.success) {
        this.productList = res.products;
      }
    }))
    this.subscriptions.add(this.customerService.getAllCustomers().subscribe((res) => {
      if (res.success) {
        this.customersList = res.customers;
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  deleteProduct(product: IProduct) {
    this.order.orderLines = this.order.orderLines.filter(o => o.product.barcode !== product.barcode);
  }
  selectProduct(data: any) {
    if (data.barcode) {
      this.order.orderLines.push({ product: data, quntity: 1, price: data.price, total: data.price });
    }
    this.filterProductModel = { name: "", _id: "" };
    this.getOrderTotal(this.order.orderLines);
  }
  changeGridData(orders: IOrder[]) {
    this.filteredOrders = orders;
    this.ordersData = orders;
  }

  getOrderDataFromGrid(content: any, order: any) {
    let data = order;
    this.order = data;
    this.modalService.open(content, { centered: true });
  }
  getOrderTotal(orderLines: IOrderLine[] = []) {
    setTimeout(() => {
      this.order.total = orderLines?.reduce((a, b) => {
        b.total = b.quntity * b.price;
        return a + b.total; }, 0);
     }, 100);
  }
  async getOrders() {
    // get data from local DB
    let data = await db.getAllDataFromLocaleDB("orders");
    // if this tab is alredy opened will get data from local DB
    if (data && data.length > 0) {
      this.ordersData = data;
      this.filteredOrders = data;
    } else {
      // if you open this tab for first time will get data from  API
      this.subscriptions.add(this.orderService.getAllOrders().subscribe(async data => {
        // add Data to localDB
        let orders: any[] = await data.orders?.filter((p: IOrder, index: number) => data.orders[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("orders", orders);
        // get data from local DB After DB Setting localID
        this.ordersData = await db.getAllDataFromLocaleDB("orders");
        this.filteredOrders = this.ordersData;
      }));
    }
  }
  // to opem Form To Add New Data and Clear Order Object
  openOrderForm(content: any) {
    this.order = { _id: undefined, total: 0, createdAt: new Date().toString(), orderLines: [], customer: { email: "", name: "", phoneNumber: "" } }
    this.modalService.open(content, { centered: true });
  }
  // Add New Order
  async addNewOrder() {
    let order = this.ordersData.find(obj => obj.total <= 0 || obj.customer._id == undefined || obj.customer._id == "");
    if (order) {
      return this.growlService.growl("order name, email and phone number must be uniqe and atlest one of this is alredy exist in our data base", GrowlerMessageType.Danger)
    }
    // add data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      await db.addRecordToLocaleDB('orders', this.order);
      this.ordersData = await db.getAllDataFromLocaleDB("orders");
      this.filteredOrders = await db.getAllDataFromLocaleDB("orders");
      this.clearOrderData();
      // add data to Server if is Online
    } else {
      this.subscriptions.add(this.orderService.addNewOrder(this.order).subscribe(async (res) => {
        if (res.success) {
          await db.addRecordToLocaleDB('orders', res.order, DBRowStateType.ORIGINAL);
          this.ordersData = await db.getAllDataFromLocaleDB("orders");
          this.filteredOrders = this.ordersData;
          this.growlService.growl(res.message, GrowlerMessageType.Success);
          this.clearOrderData();
        } else {
          this.growlService.growl(res.message, GrowlerMessageType.Danger);
          this.logger.logError(res.message)
        }
      }));
    }
    return null;
  }

  clearOrderData() {
    this.order = { _id: undefined, total: 0, createdAt: new Date().toString(), orderLines: [], customer: { email: "", name: "", phoneNumber: "" } }
    this.filterCustomerModel = { name: "", _id: "" };
    this.filterProductModel = { name: "", _id: "" };
  }
 
  // filtring orders data by name or barcode
  filterChanged(data: any) {
    if (data && this.ordersData) {
      data = data.toUpperCase();
      const props = ['name', 'phoneNumber', 'email'];
      this.filteredOrders = this.filterService.filter<IOrder[]>(this.ordersData, data, props);
    } else {
      this.filteredOrders = this.ordersData;
    }
  };

  ////////////////////////////////////////////////////////           
  //////////////// >>> PWA <<<<<<<///////////////////////
  //////////////////////////////////////////////////////     

  ////// this function to do check if the connction Changed to update data from Local DB to server DB
  private listenToConctionEvent(conction: NetworkConnectionService) {
    conction.connctionChanged.subscribe(async (online) => {
      if (online) {
        let addedData = await db.getDataByState("orders", DBRowStateType.ADDED);
         //let updatedData = await db.getDataByState("orders", DBRowStateType.UPDATED);
        let deletedData = await db.getDataByState("orders", DBRowStateType.DELETED);
        if (addedData != null) await this.addNewBulkOfOrdersFromLocalDB(addedData);
        //if (updatedData != null) await this.updateBulkOfOrdersFromLocalDB(updatedData);
        if (deletedData != null) await this.deleteBulkOfOrdersFromLocalDB(deletedData);
        this.logger.log('went offline');
      } else {
        this.logger.log('went offline');
      }
    });
  }
 
  //////////////////  Delete  Bulk Of Orders  >>> PWA <<< ///////////////
  async deleteBulkOfOrdersFromLocalDB(deletedData: any) {
    let ids: string[] = [];
    let localIds: number[] = [];
    deletedData?.data?.forEach((obj: any) => {
      ids.push(obj._id);
      localIds.push(obj.localId);
    });
    await this.orderService.deleteBulkOrder(ids).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("orders", localIds);
        this.ordersData = await db.getAllDataFromLocaleDB("orders");
        this.filteredOrders = await db.getAllDataFromLocaleDB("orders");
      }else{
        this.growlService.growl(res.message, GrowlerMessageType.Danger);
        this.logger.log(res.message)
      }
    });
  }
  //////////////////  Add  Bulk Of Orders  >>> PWA <<< ///////////////
  async addNewBulkOfOrdersFromLocalDB(addedData: any) {
    await this.orderService.addBulkOrder(addedData.data).subscribe(async (res) => {
      if (res.success && res.orders.length > 0) {
        await db.deleteBulkFromLocaleDB("orders", addedData.ids);
        let data: IOrder[] = res.orders?.filter((p: IOrder, index: number) => res.orders[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("orders", data);
        this.ordersData = await db.getAllDataFromLocaleDB("orders");
        this.filteredOrders = await db.getAllDataFromLocaleDB("orders");
      }else{
        this.growlService.growl(res.message, GrowlerMessageType.Danger);
        this.logger.logError(res.message)
      }
    });
  }
}
