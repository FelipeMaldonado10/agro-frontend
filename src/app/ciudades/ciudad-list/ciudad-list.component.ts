import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CiudadService } from '../ciudad.service';

@Component({
  selector: 'app-ciudad-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Ciudades</h2>
        <button class="btn btn-primary" routerLink="/ciudades/crear">
          Agregar Ciudad
        </button>
      </div>

      <div class="row">
        <div class="col-md-12">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Latitud</th>
                  <th>Longitud</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ciudad of ciudades">
                  <td>{{ ciudad.nombre }}</td>
                  <td>{{ ciudad.coordenadas.latitud }}</td>
                  <td>{{ ciudad.coordenadas.longitud }}</td>
                  <td>
                    <button class="btn btn-sm btn-info me-2" 
                            [routerLink]="['/ciudades/editar', ciudad._id]">
                      Editar
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            (click)="eliminarCiudad(ciudad._id)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  `]
})
export class CiudadListComponent implements OnInit {
  ciudades: any[] = [];

  constructor(private ciudadService: CiudadService) {}

  ngOnInit() {
    this.cargarCiudades();
  }

  cargarCiudades() {
    this.ciudadService.obtenerCiudades().subscribe({
      next: (data) => {
        this.ciudades = data;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
      }
    });
  }

  eliminarCiudad(id: string) {
    if (confirm('¿Está seguro de eliminar esta ciudad?')) {
      this.ciudadService.eliminarCiudad(id).subscribe({
        next: () => {
          this.ciudades = this.ciudades.filter(c => c._id !== id);
        },
        error: (error) => {
          console.error('Error al eliminar ciudad:', error);
        }
      });
    }
  }
}