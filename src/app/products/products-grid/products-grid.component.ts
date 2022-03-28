import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GrowlerMessageType, GrowlerService } from 'src/app/core/growler/growler.service';
import { ModalService } from 'src/app/core/modal/modal.service';
import { TabService } from 'src/app/tab.service';
import { IProduct } from '../product.interface';
import { ProductService } from '../product.service';
import { db, DBRowStateType } from '../../db';
import { NetworkConnectionService } from 'src/app/core/services/network-connection.service';
@Component({
  selector: 'mt-products-grid',
  templateUrl: './products-grid.component.html',
  styleUrls: ['./products-grid.component.scss']
})
export class ProductsGridComponent implements OnInit, OnDestroy {
  @Input() produacts: IProduct[];
  @Input() pageId: number;
  @Output() UpdateProduct: EventEmitter<IProduct> = new EventEmitter<IProduct>();
  @Output() ChangesProducts: EventEmitter<IProduct[]> = new EventEmitter<IProduct[]>();
  subscriptions: Subscription = new Subscription();

  constructor(
    private moduleService: ModalService,
    private tabService: TabService,
    private productService: ProductService,
    private growlService: GrowlerService,
    private conctionService: NetworkConnectionService
  ) { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {

  }

  updateProduct(product: IProduct) {
    this.UpdateProduct.emit(product)
  }

  async deleteProduct(product: IProduct) {
    if (!this.conctionService.isOnline) {
      this.moduleService.show({ body: `Are you sure you want to delete ${product.name}` }).then(async okPressed => {
        if (okPressed) {
          await db.deleteRecordFromLocaleDB("products", product);
          this.produacts = await db.getAllDataFromLocaleDB("products");
        }
      })
    } else {
      this.moduleService.show({ body: `Are you shure you want to delete ${product.name}` }).then(okPressed => {
        if (okPressed) {
          this.subscriptions.add(this.productService.deleteProduct(product).subscribe(async (data) => {
            if (data.success) {
              await db.deleteRecordFromLocaleDB("products", product, DBRowStateType.ORIGINAL);
              this.produacts = await db.getAllDataFromLocaleDB("products");
              this.ChangesProducts.emit(this.produacts);
              this.growlService.growl(data.message, GrowlerMessageType.Success);
            } else {
              this.growlService.growl(data.message, GrowlerMessageType.Danger);
            }
          }));
        }
      });
    }

  }
}
