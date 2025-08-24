import { Routes } from '@angular/router';
import { MarketPriceListComponent } from './market-price-list/market-price-list.component';

export const MARKET_PRICES_ROUTES: Routes = [
  {
    path: 'precios',
    component: MarketPriceListComponent,
    title: 'Precios de Mercado'
  }
];
