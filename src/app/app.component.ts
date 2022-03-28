import { db } from "./db";
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor() { }
  ngOnInit() {
    localStorage.clear()
    localStorage.setItem("openedTabs", "[]");
    db.initLocalDB();
  }
  title = 'tapsApp';

}
