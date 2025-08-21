import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CiudadService } from '../ciudad.service';

@Component({
  selector: 'app-ciudad-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>{{ editMode ? 'Editar' : 'Agregar' }} Ciudad</h2>
      <form (ngSubmit)="guardarCiudad()" #ciudadForm="ngForm" class="mt-4">
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre de la Ciudad</label>
          <input
            type="text"
            class="form-control"
            id="nombre"
            name="nombre"
            [(ngModel)]="ciudad.nombre"
            required
          >
        </div>

        <div class="mb-3">
          <label for="latitud" class="form-label">Latitud</label>
          <input
            type="number"
            class="form-control"
            id="latitud"
            name="latitud"
            [(ngModel)]="ciudad.coordenadas.latitud"
            required
            step="any"
          >
        </div>

        <div class="mb-3">
          <label for="longitud" class="form-label">Longitud</label>
          <input
            type="number"
            class="form-control"
            id="longitud"
            name="longitud"
            [(ngModel)]="ciudad.coordenadas.longitud"
            required
            step="any"
          >
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" [disabled]="!ciudadForm.form.valid">
            {{ editMode ? 'Actualizar' : 'Crear' }} Ciudad
          </button>
          <button type="button" class="btn btn-secondary" (click)="cancelar()">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-control {
      max-width: 400px;
    }
  `]
})
export class CiudadFormComponent implements OnInit {
  ciudad: any = {
    nombre: '',
    coordenadas: {
      latitud: null,
      longitud: null
    }
  };

  editMode = false;
  ciudadId: string | null = null;

  constructor(
    private ciudadService: CiudadService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.ciudadId = this.route.snapshot.paramMap.get('id');
    if (this.ciudadId) {
      this.editMode = true;
      this.cargarCiudad();
    }
  }

  cargarCiudad() {
    if (this.ciudadId) {
      this.ciudadService.obtenerCiudad(this.ciudadId).subscribe({
        next: (data) => {
          this.ciudad = {
            ...data,
            coordenadas: {
              latitud: data.coordenadas.latitud,
              longitud: data.coordenadas.longitud
            }
          };
        },
        error: (error) => {
          console.error('Error al cargar la ciudad:', error);
          this.router.navigate(['/ciudades']);
        }
      });
    }
  }

  guardarCiudad() {
    if (this.editMode) {
      this.ciudadService.actualizarCiudad(this.ciudadId!, this.ciudad).subscribe({
        next: () => {
          this.router.navigate(['/ciudades']);
        },
        error: (error) => {
          console.error('Error al actualizar la ciudad:', error);
        }
      });
    } else {
      this.ciudadService.crearCiudad(this.ciudad).subscribe({
        next: () => {
          this.router.navigate(['/ciudades']);
        },
        error: (error) => {
          console.error('Error al crear la ciudad:', error);
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/ciudades']);
  }
}