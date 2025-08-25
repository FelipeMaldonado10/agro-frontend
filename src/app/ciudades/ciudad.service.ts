import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CiudadService {
  private apiUrl = `${environment.apiUrl}/ciudades`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Crear una nueva ciudad
  crearCiudad(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  // Obtener todas las ciudades
  obtenerCiudades(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  // Obtener una ciudad específica
  obtenerCiudad(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Actualizar una ciudad
  actualizarCiudad(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  // Eliminar una ciudad
  eliminarCiudad(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}