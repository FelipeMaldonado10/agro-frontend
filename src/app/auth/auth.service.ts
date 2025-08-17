import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(nombre: string, email: string, password: string, rol: string = 'productor'): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { nombre, email, password, rol });
  }

  getUserInfo() {
    if (typeof window === 'undefined') return null; // Solo en navegador
    const token = window?.localStorage?.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
    }
  }
}
