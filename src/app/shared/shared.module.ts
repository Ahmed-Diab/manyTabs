import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FilterTextboxModule } from './filter-textbox/filter-textbox.module';
import { PaginationModule } from './pagination/pagination.module';

import { CapitalizePipe } from './pipes/capitalize.pipe';
import { TrimPipe } from './pipes/trim.pipe';
import { SortByDirective } from './directives/sortby.directive';
import { FilterSelectComponent } from './filter-select/filter-select.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, FilterTextboxModule, PaginationModule, NgbModule,FormsModule ],
  exports: [ CommonModule, FormsModule, CapitalizePipe, TrimPipe, SortByDirective, FilterSelectComponent,FilterTextboxModule, PaginationModule ],
  declarations: [ CapitalizePipe, TrimPipe, SortByDirective, FilterSelectComponent ]
})
export class SharedModule { }
