import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Ajusta la ruta del import según la ubicación real del archivo environment.ts
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-market-price-detail',
  templateUrl: './market-price-detail.component.html',
  styleUrls: ['./market-price-detail.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe]
})
export class MarketPriceDetailComponent implements OnInit {
  price: any;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<any>(`${environment.apiUrl}/market-prices/${id}`, { headers }).subscribe({
        next: (data) => {
          this.price = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el detalle.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'ID no especificado.';
      this.loading = false;
    }
  }
}
