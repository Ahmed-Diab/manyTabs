import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from './product.service';
import { SharedModule } from '../shared/shared.module';
import { components, ProductRoutingModule } from './product-routing.module';
import { ProductsGridComponent } from './products-grid/products-grid.component';
@NgModule({
  declarations: [...components, ProductsGridComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProductRoutingModule
    ], providers:[ProductService]
})
export class ProductModule { }
