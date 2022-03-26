import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IProduct } from './product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private http: HttpClient
  ) { }

  getAllProducts() {
    return this.http.get<{ success: boolean, products: IProduct[] }>(`${environment.apiURL}/products`).pipe(
      map(products => {
        return products;
      }),
      catchError(this.handleError)
    );
  }
  addNewProduct(product: IProduct) {
      return this.http.post<{ success: boolean, product: IProduct, message: string }>(`${environment.apiURL}/products/create`, product).pipe(
        map(product => {
          return product;
        }),
        catchError(this.handleError)
      );
  }
  updateProduct(product: IProduct) {
    return this.http.put<{ success: boolean, product: IProduct, message: string }>(`${environment.apiURL}/products/update`, product).pipe(
      map(product => {
        return product;
      }),
      catchError(this.handleError)
    );
  }

  deleteProduct(product: IProduct) {
    return this.http.delete<{ success: boolean, message: string }>(`${environment.apiURL}/products/${product._id}`).pipe(
      map((data) => {
        return data;
      }),
      catchError(this.handleError)
    );
  }
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}
