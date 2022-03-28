import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { PreloadModulesStrategy } from './core/strategies/preload-modules.strategy';

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'customers',
    loadChildren: () => import("../app/customers/customer.module").then(m => m.CustomerModule)

  },
  {
    path: 'products',
    loadChildren: () => import("../app/products/product.module").then(m => m.ProductModule)
  },
  {
    path: 'orders',
    loadChildren: () => import("../app/orders/order.module").then(m => m.OrderModule)
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadModulesStrategy, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [PreloadModulesStrategy]
})
export class AppRoutingModule { }
