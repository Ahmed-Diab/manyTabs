import Dexie, { Table } from 'dexie';
import { IProduct } from './products/product.interface';
import { ICustomer } from './customers/customer.interface';

export enum DBRowStateType {
    DELETED = "Deleted",
    UPDATED = "Updated",
    ADDED = "Added",
    ORIGINAL = "Original"
}

export class AppDB extends Dexie {
    products!: Table<IProduct, number>;
    customers!: Table<ICustomer, number>;
    constructor() {
        super('manyTabs');
        this.version(3).stores({
            products: '++localId, state',
            customers: '++localId, state'
        });
    }

    initLocalDB(){
        Dexie.exists('manyTabs').then(function (exists) {
            if (!exists) {
                var db = new Dexie('manyTabs');
                db.version(3).stores({
                    products: '++localId, state',
                    customers: '++localId, state'
                });
                db.open();
            }
        });
    }
    // Dexie Code To Add New Record TO Local DB 
    async addRecordToLocaleDB(table: string, data: any, state: string = DBRowStateType.ADDED) {
        data.state = state;
        if (data._id == undefined || data._id == "") {
            let newId = (await db.table(table).toArray()).length + 1
            data._id = newId.toString();
        }
        await db.table(table).add(data);
    }
    // Dexie Code To Update Record At Local DB By Local Id
    async updateRecordFromLocaleDB(table: string, data: any, state: string = DBRowStateType.UPDATED) {
        data.state = state;
        await db.table(table).update(data.localId, data);
    }
    // Dexie Code To Delete Record From Local DB By Local Id
    async deleteRecordFromLocaleDB(table: string, data: any, state: string = DBRowStateType.DELETED) {
        if (state !== DBRowStateType.DELETED) {
            await db.table(table).delete(data.localId);
        } else {
            data.state = DBRowStateType.DELETED;
            await db.table(table).update(data.localId, data);
        }
    }

    // Dexie Code To Delete Bulk Of Record From Local DB By Arry of Local Ids
    async deleteBulkFromLocaleDB(table: string, ids: any[]) {
        await db.table(table).bulkDelete(ids);
    }
    // Dexie Code To Add New Bulk Of Record To Local DB;
    async addBulkOfDataToLocaleDB(table: string, data: any[]) {
        await db.table(table).bulkAdd(data);
    }

    // Dexie Code To Get All Table Records form Local DB;
    getAllDataFromLocaleDB(table: string): Promise<any[]> {
        return db.table(table).where("state").notEqual(DBRowStateType.DELETED).toArray();
    }
    // Dexie Code To Filter Data Table And Get Records By Stata Type like <Added, Updated, Deleted, Original>
    // And Return Arry Of Data And Array Of ids; 
    async getDataByState(table: string, state: string = undefined): Promise<{ data: any[], ids: number[] | null }> {
        var data: any[];
        data = await db.table(table).where("state").equals(state).toArray();
        if (data != null && data.length > 0) {
            let ids: number[] = [];
            data.filter(obj => {
                state == DBRowStateType.ADDED ? delete obj._id : null;
                ids.push(obj.localId);
            });
            return { data: data, ids: ids }
        }
        return null;
    }
// Dexie Code To Clear Table
    clearTable(table: string) { db.table(table).clear(); }
    
}

export const db = new AppDB();