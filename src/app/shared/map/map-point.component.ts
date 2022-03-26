import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mt-map-point',
  template: ``
})
export class MapPointComponent implements OnInit {

  @Input() longitude: number;
  @Input() latitude: number;
  @Input() markerText: string;

  constructor() { }

  ngOnInit() {

  }

}
