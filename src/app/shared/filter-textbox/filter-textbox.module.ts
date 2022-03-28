import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterTextboxComponent } from './filter-textbox.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [FilterTextboxComponent],
  declarations: [FilterTextboxComponent]
})
export class FilterTextboxModule { }
