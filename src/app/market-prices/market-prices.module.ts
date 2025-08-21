import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MarketPricesComponent } from './market-prices.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MarketPricesComponent]
})
export class MarketPricesModule {}
