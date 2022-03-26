import { Component, OnInit } from '@angular/core';
import { NetworkConnectionService } from './core/services/network-connection.service';
import { ProductService } from './products/product.service';
import { db, DBRowStateType } from "./db";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {
    localStorage.clear()
    localStorage.setItem("openedTabs", "[]");
  }
  title = 'tapsApp';

}
