import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, filter, map, merge, Observable, OperatorFunction, Subject, Subscription } from 'rxjs';
import { GrowlerMessageType, GrowlerService } from '../core/growler/growler.service';
import { FilterService } from '../core/services/filter.service';
import { NetworkConnectionService } from '../core/services/network-connection.service';
import { ICustomer } from '../customers/customer.interface';
import { CustomerService } from '../customers/customer.service';
import { db, DBRowStateType } from '../db';
import { IProduct } from '../products/product.interface';
import { ProductService } from '../products/product.service';
import { IOrder } from './order.interface';
import { OrderService } from './order.service';

const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
  'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  pageId: number = 3;
  ordersData: IOrder[] = [];
  filteredOrders: IOrder[] = [];
  subscriptions: Subscription = new Subscription();
  order: IOrder = { _id: undefined, total: 0, createdAt: new Date().toString(), orderLines: [], customer: { email: "", name: "", phoneNumber: "" } }
  customersList: ICustomer[] = [];
  productList: IProduct[] = [];
  formatter = (x: { name: string }) => x.name;
  constructor(
    private orderService: OrderService,
    private filterService: FilterService,
    private modalService: NgbModal,
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService,
    private customerService: CustomerService,
    private productService: ProductService

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
    this.order.orderLines =  this.order.orderLines.filter(o => o.product.barcode !== product.barcode);
  }
  selectProduct(data: any) {
    this.order.orderLines.push({ product: data, quntity: 1, price: data.price, total: data.price })
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
    // add data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      let order = this.ordersData.find(x => x.total <= 0 || x.customer._id == undefined || x.customer._id == "");
      if (order) {
        this.growlService.growl("order name, email and phone number must be uniqe and atlest one of this is alredy exist in our data base", GrowlerMessageType.Danger)
      } else {
        await db.addRecordToLocaleDB('orders', this.order);
        this.ordersData = await db.getAllDataFromLocaleDB("orders");
        this.filteredOrders = await db.getAllDataFromLocaleDB("orders");
        this.order = this.ordersData.find(x => x.total <= 0 || x.customer._id == undefined || x.customer._id == "");
      }
      // add data to Server if is Online
    } else {
      this.subscriptions.add(this.orderService.addNewOrder(this.order).subscribe(async data => {
        if (data.success) {
          this.order = { _id: undefined, total: 0, createdAt: new Date().toString(), orderLines: [], customer: { email: "", name: "", phoneNumber: "" } };
          await db.addRecordToLocaleDB('orders', data.order, DBRowStateType.ORIGINAL);
          this.ordersData = await db.getAllDataFromLocaleDB("orders");
          this.filteredOrders = this.ordersData;
          this.growlService.growl(data.message, GrowlerMessageType.Success);
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
  }

  // Update Order
  updateOrder(modal: any) {
    // Update data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      db.updateRecordFromLocaleDB('orders', this.order);
      this.growlService.growl("Sussess update", GrowlerMessageType.Success);
      modal.dismiss()
    } else {
      // Update data to Server if is Online
      this.subscriptions.add(this.orderService.updateOrder(this.order).subscribe(async data => {
        if (data.success) {
          data.order.localId = this.order.localId;
          await db.updateRecordFromLocaleDB('orders', data.order, DBRowStateType.ORIGINAL);
          this.growlService.growl(data.message, GrowlerMessageType.Success);
          modal.dismiss();
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
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
        let updatedData = await db.getDataByState("orders", DBRowStateType.UPDATED);
        let deletedData = await db.getDataByState("orders", DBRowStateType.DELETED);
        if (addedData != null) await this.addNewBulkOfOrdersFromLocalDB(addedData);
        if (updatedData != null) await this.updateBulkOfOrdersFromLocalDB(updatedData);
        if (deletedData != null) await this.deleteBulkOfOrdersFromLocalDB(deletedData);
        console.log("went online");
      } else {
        console.log('went offline');
      }
    });
  }

  //////////////////  Update  Bulk Of Orders  >>> PWA <<< ///////////////
  async updateBulkOfOrdersFromLocalDB(updatedData: any) {
    let localIds: number[] = [];
    updatedData?.data?.forEach((obj: any) => {
      localIds.push(obj.localId);
    });
    await this.orderService.updateBulkOrder(updatedData.data).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("orders", localIds);
        let data: IOrder[] = res.orders?.filter((p: IOrder, index: number) => res.orders[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("orders", data);
        this.ordersData = await db.getAllDataFromLocaleDB("orders");
        this.filteredOrders = await db.getAllDataFromLocaleDB("orders");
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
      }
    });
  }
  //////////////////  Add  Bulk Of Orders  >>> PWA <<< ///////////////
  async addNewBulkOfOrdersFromLocalDB(addedData: any) {
    await this.orderService.addBulkOrder(addedData.data).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("orders", addedData.ids);
        let data: IOrder[] = res.orders?.filter((p: IOrder, index: number) => res.orders[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("orders", data);
        this.ordersData = await db.getAllDataFromLocaleDB("orders");
        this.filteredOrders = await db.getAllDataFromLocaleDB("orders");
      }
    });
  }
}
