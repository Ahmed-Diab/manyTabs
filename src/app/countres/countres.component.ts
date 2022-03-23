import { Component, OnInit } from '@angular/core';
import { default as countries } from "../../assets/Countries.json";
@Component({
  selector: 'app-countres',
  templateUrl: './countres.component.html',
  styleUrls: ['./countres.component.scss']
})
export class CountresComponent implements OnInit {

  countriesList:any[] =[];
  constructor() { }

  ngOnInit(): void {
    this.countriesList = countries
  }

}
