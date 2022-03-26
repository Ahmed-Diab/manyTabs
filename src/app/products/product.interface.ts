export interface IProduct{
    localId?:number;
    _id?:string;
    name:string;
    barcode:string;
    price:number;
    balance:number;
    state?:string;
}