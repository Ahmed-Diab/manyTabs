import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICustomer } from '../customers/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(
    private http: HttpClient
  ) { }

  // get all customers from server
  getAllCustomers() {
    return this.http.get<{ success: boolean, customers: ICustomer[] }>(`${environment.apiURL}/customers`).pipe(
      map(customers => {
        return customers;
      }),
      catchError(this.handleError)
    );
  }

  // add new customer
  addNewCustomer(customer: ICustomer) {
    return this.http.post<{ success: boolean, customer: ICustomer, message: string }>(`${environment.apiURL}/customers/create`, customer).pipe(
      map(customer => {
        return customer;
      }),
      catchError(this.handleError)
    );
  }

  // update customer
  updateCustomer(customer: ICustomer) {
    return this.http.put<{ success: boolean, customer: ICustomer, message: string }>(`${environment.apiURL}/customers/update`, customer).pipe(
      map(customer => {
        return customer;
      }),
      catchError(this.handleError)
    );
  }
  // delete customer
  deleteCustomer(customer: ICustomer) {
    return this.http.delete<{ success: boolean, message: string }>(`${environment.apiURL}/customers/${customer._id}`).pipe(
      map((data) => {
        return data;
      }),
      catchError(this.handleError)
    );
  }

  /////////////// >>> Handling PWA <<<<<<<<\\\\\\\\\\\\\\\\
  //  add Bulk of customers >>> PWA <<<
  addBulkCustomer(customers: ICustomer[]) {
    if (customers) {
      return this.http.post<{ success: boolean, customers: ICustomer[], message: string }>(`${environment.apiURL}/customers/createMany`, customers).pipe(
        map(customers => customers),
        catchError(this.handleError)
      );
    }
    return null;
  }

  //  Update Bulk of customers >>> PWA <<<
  updateBulkCustomer(data: any[]) {
    return this.http.post<{ success: boolean, customers: ICustomer[] }>(`${environment.apiURL}/customers/updateMany`, data).pipe(
      map(data => data),
      catchError(this.handleError)
    );
  }

  //  Delete Bulk of customers >>> PWA <<<
  deleteBulkCustomer(ids: string[]) {
    if (ids && ids.length > 0) {
      return this.http.post<{ success: boolean, message: string }>(`${environment.apiURL}/customers/deleteMany`, ids).pipe(
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
