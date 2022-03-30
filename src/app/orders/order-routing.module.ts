import { NgModule } from '@angular/core';
import { OrdersComponent } from './orders.component';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  { path: "", component: OrdersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }

export const components = [
  OrdersComponent
] 
