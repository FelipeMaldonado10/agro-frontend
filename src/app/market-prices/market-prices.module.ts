import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MarketPricesComponent } from './market-prices.component';

@NgModule({
  declarations: [MarketPricesComponent],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  exports: [MarketPricesComponent]
})
export class MarketPricesModule {}
