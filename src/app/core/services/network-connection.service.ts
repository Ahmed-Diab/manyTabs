import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
declare const window:any;
@Injectable({
  providedIn: 'root'
})
export class NetworkConnectionService {

  private internetConnctionChanged = new Subject<boolean>();

  constructor() {
    window.addEventListener('online', () => this.updateNetworkConnectionStatus())
    window.addEventListener('offline', () => this.updateNetworkConnectionStatus())
  }
  get isOnline() {
    return !!window.navigator.onLine;
  }
  get connctionChanged() {
    return this.internetConnctionChanged.asObservable();
  }

  private updateNetworkConnectionStatus() {
     this.internetConnctionChanged.next(window.navigator.onLine);
  }
}