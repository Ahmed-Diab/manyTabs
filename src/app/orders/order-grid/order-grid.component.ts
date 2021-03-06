import { Subscription } from 'rxjs';
import { IOrder } from '../order.interface';
import { db, DBRowStateType } from 'src/app/db';
import { OrderService } from '../order.service';
import { ModalService } from 'src/app/core/modal/modal.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GrowlerMessageType, GrowlerService } from 'src/app/core/growler/growler.service';
import { NetworkConnectionService } from 'src/app/core/services/network-connection.service';

@Component({
  selector: 'mt-order-grid',
  templateUrl: './order-grid.component.html',
  styleUrls: ['./order-grid.component.scss']
})
export class OrderGridComponent implements OnInit {
  @Input() pageId: number;
  @Input() orders: IOrder[];
  subscriptions: Subscription = new Subscription();
  @Output() UpdateOrder: EventEmitter<IOrder> = new EventEmitter<IOrder>();
  @Output() ChangesOrders: EventEmitter<IOrder[]> = new EventEmitter<IOrder[]>();

  constructor(
    private moduleService: ModalService,
     private orderService: OrderService,
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService
  ) { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void { }

  updateOrder(order: IOrder) {
    this.UpdateOrder.emit(order)
  }

  async deleteOrder(order: IOrder) {
    if (!this.conctionService.isOnline) {
      this.moduleService.show({ body: `Are you sure you want to delete this order` }).then(async okPressed => {
        if (okPressed) {
          await db.deleteRecordFromLocaleDB("orders", order);
          this.orders = await db.getAllDataFromLocaleDB("orders");
        }
      })
    } else {
      this.moduleService.show({ body: `Are you shure you want to delete  this order` }).then(okPressed => {
        if (okPressed) {
          this.subscriptions.add(this.orderService.deleteOrder(order).subscribe(async (data) => {
            if (data.success) {
              await db.deleteRecordFromLocaleDB("orders", order, DBRowStateType.ORIGINAL);
              this.orders = await db.getAllDataFromLocaleDB("orders");
              this.ChangesOrders.emit(this.orders);
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
