import { Component, OnInit } from '@angular/core';
import data from "../../assets/data.json";
import { ITab, TabService } from '../tab.service';
@Component({
  selector: 'app-countres',
  templateUrl: './countres.component.html',
  styleUrls: ['./countres.component.scss']
})
export class CountresComponent implements OnInit {

  countriesData: any[] = [];
  pageId: number = 2;
  constructor(
    private tabService: TabService

  ) { }

  ngOnInit(): void {
    this.getCountries();
  }

  getCountries() {
    // get tab from local storge
    let tab = this.tabService.findTabByPageIdFromLoclStorge(this.pageId);
    // if this tab is alredy opened will get data from local storge
    if (tab && tab.data.length > 0) {
      this.countriesData = tab.data;
    } else {
      // if you open this tab for first time will get data from  json file
      //you can change the next line to get data from the server
      this.countriesData = data.countries;
      // set data to the tab in local storge
      this.tabService.addDataToTabInLocalStorge(tab, data.countries);
    }
  }

}
