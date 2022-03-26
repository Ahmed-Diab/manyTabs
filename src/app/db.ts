import Dexie, { Table } from 'dexie';
import { IProduct } from './products/product.interface';
export enum DBRowStateType {
    DELETED = "Deleted",
    UPDATED = "Updated",
    ADDED = "Added",
    ORIGINAL = "Original"
}
export class AppDB extends Dexie {
    products!: Table<IProduct, number>;
    constructor() {
        super('manyTabs');
        this.version(3).stores({
            products: '++localId, state'
        });
    }

    async addRecordToLocaleDB(table: string, data: any, state: string = DBRowStateType.ADDED) {
        data.state = state;
        if (data._id == undefined || data._id == "") {
            let newId = (await db.table("products").toArray()).length + 1
            data._id = newId.toString();
        }
        await db.table(table).add(data);
    }

    async updateRecordFromLocaleDB(table: string, data: any, state: string = DBRowStateType.UPDATED) {
        data.state = state;
        await db.table(table).update(data.localId, data);
    }

    async deleteRecordFromLocaleDB(table: string, data: any, state: string = DBRowStateType.DELETED) {
        if (state !== DBRowStateType.DELETED) {
            await db.table(table).delete(data.localId);
        } else {
            data.state = DBRowStateType.DELETED;
            await db.table(table).update(data.localId, data);

        }
    }

    async deleteBulkFromLocaleDB(table: string, data: any[]) {
        await db.table(table).bulkDelete(data);
    }

    async addBulkOfDataToLocaleDB(table: string, data: any[]) {
        await db.table(table).bulkAdd(data);
    }

    async getProductsLocale() {
        return await db.products.toArray();
    }

    getAllDataFromLocaleDB(table: string): Promise<any[]> {
        return db.table(table).where("state").notEqual(DBRowStateType.DELETED).toArray();
    }

    async getDataByState(table: string, state: string = undefined): Promise<{ data: any[], ids: number[] | null}> {
        var data: any[];
        data = await db.table(table).where("state").equals(state).toArray();
        console.log("🚀 ~ file: db.ts ~ line 61 ~ AppDB ~ getDataByState ~ data", data)
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

    clearTable(table: string) {
        db.table(table).clear();
    }
}

export const db = new AppDB();