export interface IProduct{
    localId?:number;
    _id?:string;
    state?:string;

    name:string;
    barcode:string;
    price:number;
    balance:number;
}