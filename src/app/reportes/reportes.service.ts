import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvolucionPrecios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/evolucion-precios`);
  }

  getProduccionTotal(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/produccion-total`);
  }

  getIngresosTotales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/ingresos-totales`);
  }

  getCostosGanancias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/costos-ganancias`);
  }

  getComparativaEstimaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/comparativa-estimaciones`);
  }

  getDistribucionCultivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/distribucion-cultivos`);
  }

  getRankingProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/ranking-productos`);
  }

  getTendenciasOferta(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/tendencias-oferta`);
  }

  getFiltradoTemporal(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/filtrado-temporal`, { params });
  }
}
