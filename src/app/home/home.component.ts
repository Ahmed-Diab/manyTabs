import { Component, OnInit } from '@angular/core';
import { fromEvent, map, merge, Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
//function to check the internet connection
checkinterent:any;
checkConnection:string = '';
therichpost$() {
 return merge<any>(
   fromEvent(window, 'offline').pipe(map(() => false)),
   fromEvent(window, 'online').pipe(map(() => true)),
   new Observable((sub: Observer<boolean>) => {
     sub.next(navigator.onLine);
     sub.complete();
   }));
}
  constructor() { }

  ngOnInit(): void {
    this.therichpost$().subscribe(isOnline => this.checkinterent = isOnline);
    //checking internet connection
    if(this.checkinterent == true)
    {
      //show success alert if internet is working
      this.checkConnection = 'Your internet is working';
      
    }
    else{
     //show danger alert if net internet not working
     this.checkConnection = 'Your internet is not working';
    }
    console.log(this.checkConnection);
    
  }

}
