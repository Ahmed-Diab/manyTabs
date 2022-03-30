import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { components, OrderRoutingModule } from './order-routing.module';
import { OrderGridComponent } from './order-grid/order-grid.component';

@NgModule({
  declarations: [...components, OrderGridComponent],
  imports: [
    CommonModule,
    SharedModule,
    OrderRoutingModule
  ]
})
export class OrderModule { }
