import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-parcelas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parcelas-list.component.html',
  styleUrls: ['./parcelas-list.component.css']
})
export class ParcelasListComponent implements OnInit {
  parcelas: any[] = [];
  mensaje: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('/api/parcelas').subscribe({
      next: (res: any) => this.parcelas = res,
      error: err => this.mensaje = err.error?.mensaje || 'Error al cargar parcelas'
    });
  }
}
