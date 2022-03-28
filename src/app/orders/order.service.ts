import { Injectable } from '@angular/core';
import { IOrder } from './order.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private http: HttpClient
  ) { }

  // get all orders from server
  getAllOrders() {
    return this.http.get<{ success: boolean, orders: IOrder[] }>(`${environment.apiURL}/orders`).pipe(
      map(orders => {
        return orders;
      }),
      catchError(this.handleError)
    );
  }

  // add new order
  addNewOrder(order: IOrder) {
    return this.http.post<{ success: boolean, order: IOrder, message: string }>(`${environment.apiURL}/orders/create`, order).pipe(
      map(order => {
        return order;
      }),
      catchError(this.handleError)
    );
  }

  // update order
  updateOrder(order: IOrder) {
    return this.http.put<{ success: boolean, order: IOrder, message: string }>(`${environment.apiURL}/orders/update`, order).pipe(
      map(order => {
        return order;
      }),
      catchError(this.handleError)
    );
  }
  // delete order
  deleteOrder(order: IOrder) {
    return this.http.delete<{ success: boolean, message: string }>(`${environment.apiURL}/orders/${order._id}`).pipe(
      map((data) => {
        return data;
      }),
      catchError(this.handleError)
    );
  }

  /////////////// >>> Handling PWA <<<<<<<<\\\\\\\\\\\\\\\\
  //  add Bulk of orders >>> PWA <<<
  addBulkOrder(orders: IOrder[]) {
    if (orders) {
      return this.http.post<{ success: boolean, orders: IOrder[], message: string }>(`${environment.apiURL}/orders/createMany`, orders).pipe(
        map(orders => orders),
        catchError(this.handleError)
      );
    }
    return null;
  }

  //  Update Bulk of orders >>> PWA <<<
  updateBulkOrder(data: any[]) {
    return this.http.post<{ success: boolean, orders: IOrder[] }>(`${environment.apiURL}/orders/updateMany`, data).pipe(
      map(data => data),
      catchError(this.handleError)
    );
  }

  //  Delete Bulk of orders >>> PWA <<<
  deleteBulkOrder(ids: string[]) {
    if (ids && ids.length > 0) {
      return this.http.post<{ success: boolean, message: string }>(`${environment.apiURL}/orders/deleteMany`, ids).pipe(
        map(data => data),
        catchError(this.handleError)
      );
    }
    return null;
  }
  // handle errors
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => {
      return errorMessage;
    });
  }
}
