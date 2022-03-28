import { Component, OnInit, Input } from '@angular/core';
import { GrowlerService, GrowlerMessageType } from './growler.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'mt-growler',
  template: `
    <div [ngClass]="position" class="growler" style="overflow: auto;max-width=200px;min-width=200px;">
      <div class="alert  {{growl.messageType}}" role="alert" *ngFor="let growl of growls" [ngClass]="{active: growl.enabled}">
        {{ growl.message }}
      </div>
    </div>
  `,
  styleUrls: ['growler.component.css']
})
export class GrowlerComponent implements OnInit {

  private growlCount = 0;
  growls: Growl[] = [];

  @Input() position = 'bottom-right';
  @Input() timeout = 3000;

  constructor(private growlerService: GrowlerService,
    private logger: LoggerService) {
    growlerService.growl = this.growl.bind(this);
  }

  ngOnInit() { }

  growl(message: string, growlType: GrowlerMessageType): number {
    this.growlCount++;
    const bootstrapAlertType = GrowlerMessageType[growlType].toLowerCase();
    const messageType = `alert-${bootstrapAlertType}`;

    const growl = new Growl(this.growlCount, message, messageType, this.timeout, this);
    this.growls.push(growl);
    return growl.id;
  }

  removeGrowl(id: number) {
    this.growls.forEach((growl: Growl, index: number) => {
      if (growl.id === id) {
        this.growls.splice(index, 1);
        this.growlCount--;
        this.logger.log('removed ' + id);
      }
    });
  }
}

class Growl {

  enabled: boolean;
  timeoutId: number;

  constructor(public id: number,
    public message: string,
    public messageType: string,
    private timeout: number,
    private growlerContainer: GrowlerComponent) {
    this.show();
  }

  show() {
    window.setTimeout(() => {
      this.enabled = true;
      this.setTimeout();
    }, 0);
  }

  setTimeout() {
    window.setTimeout(() => {
      this.hide();
    }, this.timeout);
  }

  hide() {
    this.enabled = false;
    window.setTimeout(() => {
      this.growlerContainer.removeGrowl(this.id);
    }, this.timeout);
  }

}
