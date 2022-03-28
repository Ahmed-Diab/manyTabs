import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { components, OrderRoutingModule } from './order-routing.module';


@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
    OrderRoutingModule
  ]
})
export class OrderModule { }
