import { Subscription } from 'rxjs';
import { db, DBRowStateType } from 'src/app/db';
import { ICustomer } from '../customer.interface';
import { CustomerService } from '../customer.service';
import { ModalService } from 'src/app/core/modal/modal.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GrowlerMessageType, GrowlerService } from 'src/app/core/growler/growler.service';
import { NetworkConnectionService } from 'src/app/core/services/network-connection.service';

@Component({
  selector: 'mt-customer-grid',
  templateUrl: './customer-grid.component.html',
  styleUrls: ['./customer-grid.component.scss']
})
export class CustomerGridComponent  implements OnInit, OnDestroy {
  @Input() pageId: number;
  @Input() customers: ICustomer[];
  subscriptions: Subscription = new Subscription();
  @Output() UpdateCustomer: EventEmitter<ICustomer> = new EventEmitter<ICustomer>();
  @Output() ChangesCustomers: EventEmitter<ICustomer[]> = new EventEmitter<ICustomer[]>();

  constructor(
    private moduleService: ModalService,
     private customerService: CustomerService,
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService
  ) { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {

  }

  updateCustomer(customer: ICustomer) {
    this.UpdateCustomer.emit(customer)
  }

  async deleteCustomer(customer: ICustomer) {
    if (!this.conctionService.isOnline) {
      this.moduleService.show({ body: `Are you sure you want to delete ${customer.name}` }).then(async okPressed => {
        if (okPressed) {
          await db.deleteRecordFromLocaleDB("customers", customer);
          this.customers = await db.getAllDataFromLocaleDB("customers");
        }
      })
    } else {
      this.moduleService.show({ body: `Are you shure you want to delete ${customer.name}` }).then(okPressed => {
        if (okPressed) {
          this.subscriptions.add(this.customerService.deleteCustomer(customer).subscribe(async (data) => {
            if (data.success) {
              await db.deleteRecordFromLocaleDB("customers", customer, DBRowStateType.ORIGINAL);
              this.customers = await db.getAllDataFromLocaleDB("customers");
              this.ChangesCustomers.emit(this.customers);
              this.growlService.growl(data.message, GrowlerMessageType.Success);
            } else {
              this.growlService.growl(data.message, GrowlerMessageType.Danger);
            }
          }));
        }
      });
    }

  }
}
