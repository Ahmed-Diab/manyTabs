import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { components, CustomerRoutingModule } from './customer-routing.module';
import { CustomerGridComponent } from './customer-grid/customer-grid.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [...components, CustomerGridComponent],
  imports: [
    SharedModule,
    CommonModule,
    CustomerRoutingModule
  ]
})
export class CustomerModule { }
