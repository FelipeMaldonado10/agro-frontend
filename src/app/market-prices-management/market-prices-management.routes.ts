import { Routes } from '@angular/router';
import { MarketPricesFormComponent } from './market-prices-form.component';

export const marketPricesManagementRoutes: Routes = [
  { path: 'precios/nuevo', component: MarketPricesFormComponent }
];
