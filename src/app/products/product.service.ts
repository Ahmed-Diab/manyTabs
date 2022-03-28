import { Injectable } from '@angular/core';
import { IProduct } from './product.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(
    private http: HttpClient
  ) { }

  // get all products from server
  getAllProducts() {
    return this.http.get<{ success: boolean, products: IProduct[] }>(`${environment.apiURL}/products`).pipe(
      map(products => {
        return products;
      }),
      catchError(this.handleError)
    );
  }

  // add new product
  addNewProduct(product: IProduct) {
    return this.http.post<{ success: boolean, product: IProduct, message: string }>(`${environment.apiURL}/products/create`, product).pipe(
      map(product => {
        return product;
      }),
      catchError(this.handleError)
    );
  }

  // update product
  updateProduct(product: IProduct) {
    return this.http.put<{ success: boolean, product: IProduct, message: string }>(`${environment.apiURL}/products/update`, product).pipe(
      map(product => {
        return product;
      }),
      catchError(this.handleError)
    );
  }
  // delete product
  deleteProduct(product: IProduct) {
    return this.http.delete<{ success: boolean, message: string }>(`${environment.apiURL}/products/${product._id}`).pipe(
      map((data) => {
        return data;
      }),
      catchError(this.handleError)
    );
  }

  /////////////// >>> Handling PWA <<<<<<<<\\\\\\\\\\\\\\\\
  //  add Bulk of products >>> PWA <<<
  addBulkProduct(products: IProduct[]) {
    if (products) {
      return this.http.post<{ success: boolean, products: IProduct[], message: string }>(`${environment.apiURL}/products/createMany`, products).pipe(
        map(products => products),
        catchError(this.handleError)
      );
    }
    return null;
  }

  //  Update Bulk of products >>> PWA <<<
  updateBulkProduct(data: any[]) {
    return this.http.post<{ success: boolean, products: IProduct[] }>(`${environment.apiURL}/products/updateMany`, data).pipe(
      map(data => data),
      catchError(this.handleError)
    );
  }

  //  Delete Bulk of products >>> PWA <<<
  deleteBulkProduct(ids: string[]) {
    if (ids && ids.length > 0) {
      return this.http.post<{ success: boolean, message: string }>(`${environment.apiURL}/products/deleteMany`, ids).pipe(
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
