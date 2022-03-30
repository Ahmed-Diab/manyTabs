import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, map, Observable, OperatorFunction } from 'rxjs';

@Component({
  selector: 'mt-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss']
})
export class FilterSelectComponent implements OnInit {
  @Input() lable: string = "";
  @Input() data: any[];
  @Output() SelectedItem: EventEmitter<any> = new EventEmitter<any>();
  @Input() model: any;
  formatter = (state: any) => state.name;
  constructor() { }

  ngOnInit(): void {
  }
  search: OperatorFunction<string, readonly { id: any, name: any }[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter(term => term.length >= 2),
      map(term => this.data.filter(data => new RegExp(term, 'mi').test(data.name)).slice(0, 10))
    )
  }

  selectedItem(event: any) { this.SelectedItem.emit(event.item) }
}
