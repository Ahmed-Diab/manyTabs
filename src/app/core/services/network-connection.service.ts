import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkConnectionService {

  // public static status: ConnectionStatusEnum = ConnectionStatusEnum.Online;
  // private static online$: Observable<string>;
  // private static offline$: Observable<string>;
  // public static init() {
  //   NetworkConnectionService.online$ = Observable.(window, 'online');
  //   NetworkConnectionService.offline$ = Observable.fromEvent(window, 'offline');

  //   NetworkConnectionService.online$.subscribe(e => {
  //     console.log('Online');
  //     NetworkConnectionService.status = ConnectionStatusEnum.Online;
  //   });

  //   NetworkConnectionService.offline$.subscribe(e => {
  //     console.log('Offline');
  //     NetworkConnectionService.status = ConnectionStatusEnum.Offline;
  //   });
  // }

  // constructor() {
  //   NetworkConnection.init();
  // }
}

export enum ConnectionStatusEnum {
  Online,
  Offline
}
