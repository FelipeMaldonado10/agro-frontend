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

  register(data: any, rol: string = 'productor'): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { ...data, rol });
  }

  getUserInfo() {
  if (typeof window === 'undefined') return null; // Solo en navegador
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
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

  isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    return !!token && this.getUserInfo() !== null;
  }

  getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  }

  isAdmin(): boolean {
    const user = this.getUserInfo();
    return user && ['admin', 'superadmin'].includes(user.rol);
  }
}
