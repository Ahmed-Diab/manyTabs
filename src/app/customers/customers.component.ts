import { Subscription } from 'rxjs';
import { db, DBRowStateType } from '../db';
import { ICustomer } from './customer.interface';
import { CustomerService } from './customer.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from '../core/services/filter.service';
import { GrowlerMessageType, GrowlerService } from '../core/growler/growler.service';
import { NetworkConnectionService } from '../core/services/network-connection.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy {
  pageId: number = 2;
  customersData: ICustomer[] = [];
  filteredCustomers: ICustomer[] = [];
  subscriptions: Subscription = new Subscription();
  customer: ICustomer = { _id: undefined, name: '', email: '', phoneNumber: '' }

  constructor(
    private customerService: CustomerService,
    private filterService: FilterService,
    private modalService: NgbModal,
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService
  ) {
    this.listenToConctionEvent(this.conctionService)
  }

  ngOnInit(): void {
    this.getCustomers();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  changeGridData(customers: ICustomer[]) {
    this.filteredCustomers = customers;
    this.customersData = customers;
  }

  getCustomerDataFromGrid(content: any, customer: any) {
    let data = customer;
    this.customer = data;
    this.modalService.open(content, { centered: true });
  }

  async getCustomers() {
    // get data from local DB
    let data = await db.getAllDataFromLocaleDB("customers");
    // if this tab is alredy opened will get data from local DB
    if (data && data.length > 0) {
      this.customersData = data;
      this.filteredCustomers = data;
    } else {
      // if you open this tab for first time will get data from  API
      this.subscriptions.add(this.customerService.getAllCustomers().subscribe(async data => {
        // add Data to localDB
        let customers: any[] = await data.customers?.filter((p: ICustomer, index: number) => data.customers[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("customers", customers);
        // get data from local DB After DB Setting localID
        this.customersData = await db.getAllDataFromLocaleDB("customers");
        this.filteredCustomers = this.customersData;
      }));
    }
  }
  // to opem Form To Add New Data and Clear Customer Object
  openCustomerForm(content: any) {
    this.customer = { _id: undefined, name: '', email: '', phoneNumber: '' }
    this.modalService.open(content, { centered: true });
  }
  // Add New Customer
  async addNewCustomer() {
    // add data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      let customer = this.customersData.find(x => x.name == this.customer.name || x.email == this.customer.email || x.phoneNumber == this.customer.phoneNumber);
      if (customer) {
        this.growlService.growl("customer name, email and phone number must be uniqe and atlest one of this is alredy exist in our data base", GrowlerMessageType.Danger)
      } else {
        await db.addRecordToLocaleDB('customers', this.customer);
        this.customersData = await db.getAllDataFromLocaleDB("customers");
        this.filteredCustomers = await db.getAllDataFromLocaleDB("customers");
        this.customer = { _id: undefined, name: '', email: '', phoneNumber: '' };
      }
      // add data to Server if is Online
    } else {
      this.subscriptions.add(this.customerService.addNewCustomer(this.customer).subscribe(async data => {
        if (data.success) {
          this.customer = { _id: undefined, name: '', email: '', phoneNumber: '' };
          await db.addRecordToLocaleDB('customers', data.customer, DBRowStateType.ORIGINAL);
          this.customersData = await db.getAllDataFromLocaleDB("customers");
          this.filteredCustomers = this.customersData;
          this.growlService.growl(data.message, GrowlerMessageType.Success);
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
  }

  // Update Customer
  updateCustomer(modal: any) {
    // Update data to Local DB if Offline
    if (!this.conctionService.isOnline) {
      db.updateRecordFromLocaleDB('customers', this.customer);
      this.growlService.growl("Sussess update", GrowlerMessageType.Success);
      modal.dismiss()
    } else {
      // Update data to Server if is Online
      this.subscriptions.add(this.customerService.updateCustomer(this.customer).subscribe(async data => {
        if (data.success) {
          data.customer.localId = this.customer.localId;
          await db.updateRecordFromLocaleDB('customers', data.customer, DBRowStateType.ORIGINAL);
          this.growlService.growl(data.message, GrowlerMessageType.Success);
          modal.dismiss();
        } else {
          this.growlService.growl(data.message, GrowlerMessageType.Danger);
        }
      }));
    }
  }
  // filtring customers data by name or barcode
  filterChanged(data: any) {
    if (data && this.customersData) {
      data = data.toUpperCase();
      const props = ['name', 'phoneNumber', 'email'];
      this.filteredCustomers = this.filterService.filter<ICustomer[]>(this.customersData, data, props);
    } else {
      this.filteredCustomers = this.customersData;
    }
  };

  ////////////////////////////////////////////////////////           
  //////////////// >>> PWA <<<<<<<///////////////////////
  //////////////////////////////////////////////////////     

  ////// this function to do check if the connction Changed to update data from Local DB to server DB
  private listenToConctionEvent(conction: NetworkConnectionService) {
    conction.connctionChanged.subscribe(async (online) => {
      if (online) {
        let addedData = await db.getDataByState("customers", DBRowStateType.ADDED);
        let updatedData = await db.getDataByState("customers", DBRowStateType.UPDATED);
        let deletedData = await db.getDataByState("customers", DBRowStateType.DELETED);
        if (addedData != null) await this.addNewBulkOfCustomersFromLocalDB(addedData);
        if (updatedData != null) await this.updateBulkOfCustomersFromLocalDB(updatedData);
        if (deletedData != null) await this.deleteBulkOfCustomersFromLocalDB(deletedData);
        console.log("went online");
      } else {
        console.log('went offline');
      }
    });
  }

  //////////////////  Update  Bulk Of Customers  >>> PWA <<< ///////////////
  async updateBulkOfCustomersFromLocalDB(updatedData: any) {
    let localIds: number[] = [];
    updatedData?.data?.forEach((obj: any) => {
      localIds.push(obj.localId);
    });
    await this.customerService.updateBulkCustomer(updatedData.data).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("customers", localIds);
        let data: ICustomer[] = res.customers?.filter((p: ICustomer, index: number) => res.customers[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("customers", data);
        this.customersData = await db.getAllDataFromLocaleDB("customers");
        this.filteredCustomers = await db.getAllDataFromLocaleDB("customers");
      }
    });
  }
  //////////////////  Delete  Bulk Of Customers  >>> PWA <<< ///////////////
  async deleteBulkOfCustomersFromLocalDB(deletedData: any) {
    let ids: string[] = [];
    let localIds: number[] = [];
    deletedData?.data?.forEach((obj: any) => {
      ids.push(obj._id);
      localIds.push(obj.localId);
    });
    await this.customerService.deleteBulkCustomer(ids).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("customers", localIds);
        this.customersData = await db.getAllDataFromLocaleDB("customers");
        this.filteredCustomers = await db.getAllDataFromLocaleDB("customers");
      }
    });
  }
  //////////////////  Add  Bulk Of Customers  >>> PWA <<< ///////////////
  async addNewBulkOfCustomersFromLocalDB(addedData: any) {
    await this.customerService.addBulkCustomer(addedData.data).subscribe(async (res) => {
      if (res.success) {
        await db.deleteBulkFromLocaleDB("customers", addedData.ids);
        let data: ICustomer[] = res.customers?.filter((p: ICustomer, index: number) => res.customers[index].state = "Original")
        await db.addBulkOfDataToLocaleDB("customers", data);
        this.customersData = await db.getAllDataFromLocaleDB("customers");
        this.filteredCustomers = await db.getAllDataFromLocaleDB("customers");
      }
    });
  }
}
