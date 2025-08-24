import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { environment } from '../../environments/environment';
import { CiudadService } from '../ciudades/ciudad.service';
import { Producto, ProductoService } from '../producto-management/producto.service';

@Component({
  selector: 'app-market-prices',
  templateUrl: './market-prices.component.html',
  styleUrls: ['./market-prices.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe]
})
export class MarketPricesComponent implements OnInit {
  prices: any[] = [];
  form: FormGroup;
  uploading = false;
  fileError = '';
  productos: Producto[] = [];
  ciudades: any[] = [];

  private apiUrl = `${environment.apiUrl}/market-prices`;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private ciudadService: CiudadService
  ) {
    this.form = this.fb.group({
      producto: ['', Validators.required],
      ciudad: ['', Validators.required],
      fecha: ['', Validators.required],
      precio: ['', Validators.required]
    });
    this.loadPrices();
    this.cargarProductos();
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarCiudades();
  }

  cargarCiudades() {
    this.ciudadService.obtenerCiudades().subscribe({
      next: (ciudades) => {
        this.ciudades = ciudades;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
      }
    });
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }


  loadPrices() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (prices) => {
        this.prices = prices;
        this.prices.forEach(price => {
          const producto = this.productos.find(p => p._id === price.producto);
          price.nombreProducto = producto ? producto.nombre : 'Producto no encontrado';

          const ciudad = this.ciudades.find(c => c._id === price.ciudad);
          price.nombreCiudad = ciudad ? ciudad.nombre : 'Ciudad no encontrada';
        });
      },
      error: (error) => {
        console.error('Error al cargar precios:', error);
      }
    });
  }

  submitForm() {
    if (this.form.invalid) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(this.apiUrl, this.form.value, { headers }).subscribe({
      next: () => {
        this.form.reset();
        this.loadPrices();
      },
      error: (error) => {
        console.error('Error al guardar precio:', error);
      }
    });
  }

  setToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.form.patchValue({ fecha: `${year}-${month}-${day}` });
  }

  deletePrice(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`${this.apiUrl}/${id}`, { headers }).subscribe({
      next: () => {
        this.loadPrices();
      },
      error: (error) => {
        console.error('Error al eliminar precio:', error);
      }
    });
  }

  downloadTemplate() {
    const template = [
      {
        producto: 'Nombre del Producto',
        fecha: 'YYYY-MM-DD',
        precio: 'Precio en números',
        ciudad: 'Nombre de la Ciudad'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_precios.xlsx');
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    this.fileError = '';
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(`${this.apiUrl}/upload`, formData, { headers }).subscribe({
      next: () => {
        this.uploading = false;
        this.loadPrices();
      },
      error: err => {
        this.uploading = false;
        this.fileError = 'Error al subir el archivo';
      }
    });
  }
}
