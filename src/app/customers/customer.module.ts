import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { components, CustomerRoutingModule } from './customer-routing.module';
import { CustomerGridComponent } from './customer-grid/customer-grid.component';

@NgModule({
  declarations: [...components, CustomerGridComponent],
  imports: [
    SharedModule,
    CommonModule,
    CustomerRoutingModule
  ]
})
export class CustomerModule { }
