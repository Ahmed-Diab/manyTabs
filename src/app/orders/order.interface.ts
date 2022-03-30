import { IProduct } from "../products/product.interface";
import { ICustomer } from "../customers/customer.interface";
export interface IOrder {
    localId?: number;
    _id?: string;
    state?: string;
    total: number;
    createdAt: string;
    orderLines: IOrderLine[],
    customer: ICustomer
}
export interface IOrderLine {
    price: number;
    quntity: number
    total: number;
    product?: IProduct,
    _id?: string;
}
