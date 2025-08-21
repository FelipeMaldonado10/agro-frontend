import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Producto, ProductoService } from './producto.service';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Productos</h2>
        <button class="btn btn-primary" (click)="nuevoProducto()">
          Nuevo Producto
        </button>
      </div>

      <div *ngIf="cargando" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-6 col-lg-4" *ngFor="let producto of productos">
          <div class="card h-100 producto-card">
            <div class="card-body">
              <h5 class="card-title">{{ producto.nombre }}</h5>

              <div class="info-section">
                <h6>Condiciones Óptimas</h6>
                <p>
                  <span class="info-item">
                    <i class="bi bi-thermometer-half"></i>
                    {{ producto.temperatura_optima }}°C
                  </span>
                  <span class="info-item">
                    <i class="bi bi-droplet"></i>
                    {{ producto.humedad_optima }}%
                  </span>
                </p>
              </div>

              <div class="info-section">
                <h6>Detalles de Cultivo</h6>
                <p>
                  <span class="info-item">
                    <i class="bi bi-calendar3"></i>
                    {{ producto.temporada }}
                  </span>
                  <span class="info-item">
                    <i class="bi bi-clock"></i>
                    {{ producto.tiempo_cosecha }} días
                  </span>
                </p>
              </div>

              <div class="info-section" *ngIf="producto.caracteristicas">
                <h6>Sensibilidad</h6>
                <p class="mb-0">
                  <span class="badge" [ngClass]="getSensibilidadClass(producto.caracteristicas.sensibilidad_temperatura)">
                    Temperatura: {{ producto.caracteristicas.sensibilidad_temperatura }}
                  </span>
                  <span class="badge" [ngClass]="getSensibilidadClass(producto.caracteristicas.sensibilidad_humedad)">
                    Humedad: {{ producto.caracteristicas.sensibilidad_humedad }}
                  </span>
                  <span class="badge" [ngClass]="getSensibilidadClass(producto.caracteristicas.sensibilidad_lluvia)">
                    Lluvia: {{ producto.caracteristicas.sensibilidad_lluvia }}
                  </span>
                </p>
              </div>

              <div class="mt-3 d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" (click)="editarProducto(producto._id)">
                  <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="eliminarProducto(producto._id)">
                  <i class="bi bi-trash"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!cargando && productos.length === 0" class="text-center mt-4">
        <p>No hay productos registrados.</p>
      </div>
    </div>
  `,
  styles: [`
    .producto-card {
      transition: transform 0.2s;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .producto-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .info-section {
      margin-bottom: 1rem;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 0.25rem;
    }

    .info-section h6 {
      color: #6c757d;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .info-item {
      margin-right: 1rem;
      color: #495057;
    }

    .info-item i {
      margin-right: 0.25rem;
      color: #6c757d;
    }

    .badge {
      margin: 0.2rem;
      padding: 0.5rem;
    }

    .badge-alta {
      background-color: #dc3545;
      color: white;
    }

    .badge-media {
      background-color: #ffc107;
      color: black;
    }

    .badge-baja {
      background-color: #28a745;
      color: white;
    }
  `]
})
export class ProductoListComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  cargando = true;
  private subscription?: Subscription;

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: () => {
        this.subscription = this.productoService.productos$.subscribe(
          productos => {
            this.productos = productos;
            this.cargando = false;
          }
        );
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
      }
    });
  }

  getSensibilidadClass(sensibilidad: string): string {
    switch (sensibilidad?.toLowerCase()) {
      case 'alta':
        return 'badge-alta';
      case 'media':
        return 'badge-media';
      case 'baja':
        return 'badge-baja';
      default:
        return 'badge-secondary';
    }
  }

  nuevoProducto() {
    this.router.navigate(['/productos/nuevo']);
  }

  editarProducto(id: string) {
    this.router.navigate([`/productos/editar/${id}`]);
  }

  eliminarProducto(id: string) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          alert('Error al eliminar el producto');
        }
      });
    }
  }
}
