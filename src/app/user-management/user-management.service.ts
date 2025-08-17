import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private apiUrl = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  createUser(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
