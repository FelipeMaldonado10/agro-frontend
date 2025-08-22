import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Producto {
  _id: string;
  nombre: string;
  humedad_optima: number;
  temperatura_optima: number;
  temporada: string;
  tiempo_cosecha: number;
  caracteristicas: {
    sensibilidad_lluvia: string;
    sensibilidad_temperatura: string;
    sensibilidad_humedad: string;
    otros: string;
  };
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl, this.getHeaders()).pipe(
      tap(productos => this.productosSubject.next(productos)),
      catchError(error => {
        console.error('Error al obtener productos:', error);
        throw error;
      })
    );
  }

  obtenerProducto(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      catchError(error => {
        console.error(`Error al obtener producto ${id}:`, error);
        throw error;
      })
    );
  }

  crearProducto(producto: Omit<Producto, '_id'>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, this.getHeaders()).pipe(
      tap(nuevoProducto => {
        const productos = this.productosSubject.value;
        this.productosSubject.next([...productos, nuevoProducto]);
      }),
      catchError(error => {
        console.error('Error al crear producto:', error);
        throw error;
      })
    );
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto, this.getHeaders()).pipe(
      tap(productoActualizado => {
        const productos = this.productosSubject.value;
        const index = productos.findIndex(p => p._id === id);
        if (index !== -1) {
          productos[index] = productoActualizado;
          this.productosSubject.next([...productos]);
        }
      }),
      catchError(error => {
        console.error(`Error al actualizar producto ${id}:`, error);
        throw error;
      })
    );
  }

  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      tap(() => {
        const productos = this.productosSubject.value;
        this.productosSubject.next(productos.filter(p => p._id !== id));
      }),
      catchError(error => {
        console.error(`Error al eliminar producto ${id}:`, error);
        throw error;
      })
    );
  }
}