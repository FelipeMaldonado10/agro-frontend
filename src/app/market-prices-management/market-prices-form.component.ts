import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { environment } from '../../environments/environment';
import { CiudadService } from '../ciudades/ciudad.service';
import { Producto, ProductoService } from '../producto-management/producto.service';

@Component({
  selector: 'app-market-prices-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './market-prices-form.component.html',
  styleUrls: ['./market-prices-form.component.css']
})
export class MarketPricesFormComponent implements OnInit {
  form: FormGroup;
  mensaje: string = '';
  archivo: File | null = null;
  productos: Producto[] = [];
  ciudades: any[] = [];

  private apiUrl = `${environment.apiUrl}/market-prices`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private productoService: ProductoService,
    private ciudadService: CiudadService
  ) {
    this.form = this.fb.group({
      producto: ['', Validators.required],
      ciudad: ['', Validators.required],
      fecha: ['', Validators.required],
      precio: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarCiudades();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mensaje = 'Error al cargar productos';
      }
    });
  }

  cargarCiudades() {
    this.ciudadService.obtenerCiudades().subscribe({
      next: (ciudades) => {
        this.ciudades = ciudades;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
        this.mensaje = 'Error al cargar ciudades';
      }
    });
  }

  guardarManual() {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Debug: ver estructura de los datos
      console.log('Form values:', formValues);
      console.log('Productos array:', this.productos);
      console.log('Ciudades array:', this.ciudades);

      // Buscar por _id para productos y ciudades
      const productoSeleccionado = this.productos.find(p => p._id === formValues.producto);
      const ciudadSeleccionada = this.ciudades.find(c => c._id === formValues.ciudad);

      // Debug: ver qué encontramos
      console.log('Producto encontrado:', productoSeleccionado);
      console.log('Ciudad encontrada:', ciudadSeleccionada);

      // Crear objeto con nombres reales
      const datosParaEnviar = {
        producto: productoSeleccionado?.nombre || formValues.producto,
        ciudad: ciudadSeleccionada?.nombre || formValues.ciudad,
        fecha: formValues.fecha,
        precio: formValues.precio
      };

      console.log('Datos a enviar:', datosParaEnviar);

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(this.apiUrl, datosParaEnviar, { headers }).subscribe({
        next: () => this.mensaje = 'Registro guardado correctamente',
        error: err => this.mensaje = err.error?.error || 'Error al guardar'
      });
    }
  }

  onFileChange(event: any) {
    this.archivo = event.target.files[0];
  }

  setToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.form.patchValue({ fecha: `${year}-${month}-${day}` });
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

  subirArchivo() {
    if (this.archivo) {
      const formData = new FormData();
      formData.append('file', this.archivo);
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.apiUrl}/upload`, formData, { headers }).subscribe({
        next: () => this.mensaje = 'Archivo subido correctamente',
        error: err => this.mensaje = err.error?.error || 'Error al subir archivo'
      });
    }
  }
}
