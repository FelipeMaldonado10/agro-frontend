import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MarketPrice {
  id: string;
  producto: string; // This is an ObjectId string
  ciudad: string;   // This is an ObjectId string
  precio: number;
  fecha: string | Date;
  // Populated fields (when API returns populated data)
  productoInfo?: {
    _id: string;
    nombre: string;
  };
  ciudadInfo?: {
    _id: string;
    nombre: string;
  };
}

@Component({
  selector: 'app-market-price-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-price-list.component.html',
  styleUrls: ['./market-price-list.component.css']
})
export class MarketPriceListComponent implements OnInit {
  marketPrices: MarketPrice[] = [];
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadMarketPrices();
  }

  loadMarketPrices(): void {
    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Get regular market prices data
    this.http.get<MarketPrice[]>(`${environment.apiUrl}/market-prices`, { headers }).subscribe({
      next: (data) => {
        console.log('Market prices raw data:', data);
        this.marketPrices = data;
        this.enrichWithNames(); // Always call this to get the names
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los precios de mercado.';
        this.loading = false;
        console.error('Error loading market prices:', err);
      }
    });
  }

  async enrichWithNames(): Promise<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    for (let price of this.marketPrices) {
      try {
        // Get product name using firstValueFrom instead of toPromise()
        if (price.producto && !price.productoInfo) {
          const productResponse = await firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/productos/${price.producto}`, { headers })
          );
          price.productoInfo = productResponse;
        }

        // Get city name using firstValueFrom instead of toPromise()
        if (price.ciudad && !price.ciudadInfo) {
          const cityResponse = await firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/ciudades/${price.ciudad}`, { headers })
          );
          price.ciudadInfo = cityResponse;
        }
      } catch (error) {
        console.error('Error enriching data for price:', price.id, error);
      }
    }
    this.loading = false;
  }

  viewDetail(id: string): void {
    this.router.navigate(['/market-prices', id]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  getProductName(price: MarketPrice): string {
    return price.producto || 'ID no disponible';
  }

  getCityName(price: MarketPrice): string {
    return price.ciudad || 'ID no disponible';
  }
}


