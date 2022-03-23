import { Component, OnInit } from '@angular/core';
import { IProduct } from './product.interface';
import { default as products } from "../../assets/products.json";
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  productsData:IProduct[] = [];
  constructor() { }

  ngOnInit(): void {
  }

}
