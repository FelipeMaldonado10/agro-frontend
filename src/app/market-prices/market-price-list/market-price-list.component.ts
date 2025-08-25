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
    if (!token) {
      this.error = 'No hay sesión activa. Por favor inicia sesión para ver los precios de mercado.';
      this.loading = false;
      return;
    }

    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<MarketPrice[]>(`${environment.apiUrl}/market-prices`, { headers }).subscribe({
      next: (data) => {
        console.log('Market prices raw data:', data);
        this.marketPrices = data;
        this.enrichWithNames();
      },
      error: (err) => {
        // Log completo para depuración
        console.error('Error loading market prices (full):', err);
        let errorMsg = 'No se pudieron cargar los precios de mercado.';
        if (err && err.error) {
          if (typeof err.error === 'string') {
            errorMsg += `\n${err.error}`;
          } else if (err.error.details) {
            errorMsg += `\n${err.error.details}`;
          } else if (err.error.message) {
            errorMsg = `Error: ${err.error.message}`;
          } else {
            errorMsg += `\n${JSON.stringify(err.error)}`;
          }
        } else if (err && err.status === 401) {
          errorMsg = 'Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.';
        }
        this.error = errorMsg;
        this.loading = false;
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
    // Muestra el nombre si está disponible, si no, el ID
    return price.productoInfo?.nombre || price.producto || 'ID no disponible';
  }

  getCityName(price: MarketPrice): string {
    // Muestra el nombre si está disponible, si no, el ID
    return price.ciudadInfo?.nombre || price.ciudad || 'ID no disponible';
  }
}


