import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IMarketPrice } from '../models/interfaces/market-price.interface';

@Injectable({
  providedIn: 'root'
})
export class MarketPriceService {
  private apiUrl = `${environment.apiUrl}/market-prices`;

  constructor(private http: HttpClient) {}

  getMarketPrices(): Observable<IMarketPrice[]> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    return this.http.get<IMarketPrice[]>(this.apiUrl, { headers });
  }

  getMarketPriceById(id: string): Observable<IMarketPrice> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IMarketPrice>(`${this.apiUrl}/${id}`, { headers });
  }

  createMarketPrice(data: any): Observable<IMarketPrice> {
    return this.http.post<IMarketPrice>(this.apiUrl, data);
  }

  deleteMarketPrice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadMarketPrices(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Helper formatting methods
  formatPrice(price: number): string {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime())
      ? d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
      : String(date);
  }
}
