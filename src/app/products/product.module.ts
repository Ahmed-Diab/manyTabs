import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { components, ProductRoutingModule } from './product-routing.module';
import { ProductsGridComponent } from './products-grid/products-grid.component';
import { SharedModule } from '../shared/shared.module';
import { ProductService } from './product.service';
@NgModule({
  declarations: [...components, ProductsGridComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProductRoutingModule
    ], providers:[ProductService]
})
export class ProductModule { }
