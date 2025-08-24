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

      // Asegurarse que producto y ciudad son IDs válidos
      let productoId = formValues.producto;
      let ciudadId = formValues.ciudad;

      // Si el producto no es un ID válido (24 caracteres hexadecimales), busca el ID por nombre
      if (typeof productoId === 'string' && !productoId.match(/^[0-9a-fA-F]{24}$/)) {
        const producto = this.productos.find(p => p.nombre.toLowerCase() === productoId.toLowerCase());
        if (producto) {
          productoId = producto._id;
        } else {
          this.mensaje = `Error: No se encontró el producto "${productoId}"`;
          return;
        }
      }

      // Si la ciudad no es un ID válido (24 caracteres hexadecimales), busca el ID por nombre
      if (typeof ciudadId === 'string' && !ciudadId.match(/^[0-9a-fA-F]{24}$/)) {
        const ciudad = this.ciudades.find(c => c.nombre.toLowerCase() === ciudadId.toLowerCase());
        if (ciudad) {
          ciudadId = ciudad._id;
        } else {
          this.mensaje = `Error: No se encontró la ciudad "${ciudadId}"`;
          return;
        }
      }

      // Enviar los IDs directamente, no los nombres
      const datosParaEnviar = {
        producto: productoId,  // ID del producto
        ciudad: ciudadId,      // ID de la ciudad
        fecha: formValues.fecha,
        precio: formValues.precio
      };

      console.log('Datos a enviar:', datosParaEnviar);

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(this.apiUrl, datosParaEnviar, { headers }).subscribe({
        next: () => this.mensaje = 'Registro guardado correctamente',
        error: err => {
          console.error('Error guardando precio:', err);
          this.mensaje = err.error?.error || err.error?.details || 'Error al guardar';
        }
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
