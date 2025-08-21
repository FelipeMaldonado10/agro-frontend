import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParcelaService {
  private apiUrl = `${environment.apiUrl}/parcelas`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Crear una nueva parcela
  crearParcela(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  // Obtener todas las parcelas
  obtenerParcelas(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  // Obtener una parcela específica
  obtenerParcela(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Actualizar datos climáticos de una parcela
  actualizarDatosClimaticos(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/clima`, {}, this.getHeaders());
  }

  // Actualizar información de una parcela
  actualizarParcela(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  // Eliminar una parcela
  eliminarParcela(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}