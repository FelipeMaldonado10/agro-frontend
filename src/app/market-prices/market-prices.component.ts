import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  imports: [CommonModule, ReactiveFormsModule]
})
export class MarketPricesComponent implements OnInit {
  prices: any[] = [];
  form: FormGroup;
  uploading = false;
  fileError = '';
  productos: Producto[] = [];
  ciudades: any[] = [];

  isBrowser: boolean;

  private apiUrl = `${environment.apiUrl}/market-prices`;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private ciudadService: CiudadService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.form = this.fb.group({
      producto: ['', Validators.required],
      ciudad: ['', Validators.required],
      fecha: ['', Validators.required],
      precio: ['', Validators.required]
    });
    if (this.isBrowser) {
      this.loadPrices();
      this.cargarProductos();
    }
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.cargarProductos();
      this.cargarCiudades();
    }
  }

  cargarCiudades(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ciudadService.obtenerCiudades().subscribe({
        next: (ciudades) => {
          this.ciudades = ciudades;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar ciudades:', error);
          reject(error);
        }
      });
    });
  }

  cargarProductos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productoService.obtenerProductos().subscribe({
        next: (productos) => {
          this.productos = productos;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          reject(error);
        }
      });
    });
  }


  loadPrices() {
    if (!this.isBrowser) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (prices) => {
        this.prices = prices.map(price => ({
          ...price,
          nombreProducto: price.producto?.nombre || 'Producto no encontrado',
          nombreCiudad: price.ciudad?.nombre || 'Ciudad no encontrada'
        }));
      },
      error: (error) => {
        console.error('Error al cargar precios:', error);
      }
    });
  }

  submitForm() {
    if (this.form.invalid) return;

    // Asegurarse de que los productos y ciudades estén cargados
    if (this.productos.length === 0 || this.ciudades.length === 0) {
      Promise.all([
        this.cargarProductos(),
        this.cargarCiudades()
      ]).then(() => {
        this.enviarFormulario();
      });
    } else {
      this.enviarFormulario();
    }
  }

  private enviarFormulario() {
    if (!this.isBrowser) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Verificar que el producto y la ciudad existan antes de enviar
    const productoSeleccionado = this.productos.find(p => p._id === this.form.value.producto);
    const ciudadSeleccionada = this.ciudades.find(c => c._id === this.form.value.ciudad);

    if (!productoSeleccionado || !ciudadSeleccionada) {
      console.error('Producto o ciudad no válidos');
      return;
    }

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
    if (!this.isBrowser) return;
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
    // Mostrar las listas disponibles en la consola
    console.log('='.repeat(50));
    console.log('PRODUCTOS DISPONIBLES (copiar y pegar el nombre exacto):');
    console.log('='.repeat(50));
    this.productos.forEach(p => console.log(p.nombre));

    console.log('\n' + '='.repeat(50));
    console.log('CIUDADES DISPONIBLES (copiar y pegar el nombre exacto):');
    console.log('='.repeat(50));
    this.ciudades.forEach(c => console.log(c.nombre));
    console.log('='.repeat(50));
    console.log('IMPORTANTE: Usar los nombres EXACTOS como aparecen arriba');
    console.log('='.repeat(50));

    const template = [
      {
        producto: '⚠️ IMPORTANTE: Copiar y pegar el nombre EXACTO del producto de la lista mostrada en la consola',
        fecha: 'Formato: YYYY-MM-DD (ejemplo: 2024-01-15)',
        precio: 'Precio en números sin símbolos ni separadores de miles (ejemplo: 1500)',
        ciudad: '⚠️ IMPORTANTE: Copiar y pegar el nombre EXACTO de la ciudad de la lista mostrada en la consola'
        },
        {
          producto: '-- NO MODIFICAR ESTOS NOMBRES --',
          fecha: '2024-01-15',
          precio: '1500',
          ciudad: '-- NO MODIFICAR ESTOS NOMBRES --'
        }
      ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_precios.xlsx');
  }

  onFileChange(event: any) {
    if (!this.isBrowser) return;
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    this.fileError = '';

    // Asegurarse de que los productos y ciudades estén cargados antes de subir el archivo
    Promise.all([
      this.productos.length === 0 ? this.cargarProductos() : Promise.resolve(),
      this.ciudades.length === 0 ? this.cargarCiudades() : Promise.resolve()
    ]).then(() => {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.apiUrl}/upload`, formData, { headers }).subscribe({
        next: () => {
          this.uploading = false;
          // Esperar un momento antes de cargar los precios para asegurar que los datos estén actualizados
          setTimeout(() => this.loadPrices(), 500);
        },
        error: err => {
          this.uploading = false;
          this.fileError = 'Error al subir el archivo';
          console.error('Error detallado:', err);
        }
      });
    }).catch(error => {
      this.uploading = false;
      this.fileError = 'Error al cargar datos necesarios';
      console.error('Error al cargar productos o ciudades:', error);
    });
  }
}
