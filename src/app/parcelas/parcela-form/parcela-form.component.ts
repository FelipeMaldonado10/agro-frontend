import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ParcelaService } from '../parcela.service';

@Component({
  selector: 'app-parcela-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>{{ editMode ? 'Editar' : 'Nueva' }} Parcela</h2>
      
      <form (ngSubmit)="onSubmit()" #parcelaForm="ngForm" class="mt-4">
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre de la Parcela</label>
          <input
            type="text"
            class="form-control"
            id="nombre"
            name="nombre"
            [(ngModel)]="parcela.nombre"
            required
          >
        </div>

        <div class="mb-3">
          <label for="ciudad" class="form-label">Ciudad</label>
          <input
            type="text"
            class="form-control"
            id="ciudad"
            name="ciudad"
            [(ngModel)]="parcela.ciudad"
            required
          >
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="latitud" class="form-label">Latitud</label>
            <input
              type="number"
              class="form-control"
              id="latitud"
              name="latitud"
              [(ngModel)]="parcela.coordenadas.latitud"
              required
              step="any"
            >
          </div>

          <div class="col-md-6 mb-3">
            <label for="longitud" class="form-label">Longitud</label>
            <input
              type="number"
              class="form-control"
              id="longitud"
              name="longitud"
              [(ngModel)]="parcela.coordenadas.longitud"
              required
              step="any"
            >
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" class="btn btn-primary me-2" [disabled]="!parcelaForm.form.valid">
            {{ editMode ? 'Actualizar' : 'Crear' }} Parcela
          </button>
          <button type="button" class="btn btn-secondary" (click)="cancelar()">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class ParcelaFormComponent implements OnInit {
  parcela: any = {
    nombre: '',
    ciudad: '',
    coordenadas: {
      latitud: null,
      longitud: null
    }
  };

  editMode = false;
  parcelaId: string | null = null;

  constructor(
    private parcelaService: ParcelaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.parcelaId = this.route.snapshot.paramMap.get('id');
    if (this.parcelaId) {
      this.editMode = true;
      this.cargarParcela();
    }
  }

  cargarParcela() {
    if (this.parcelaId) {
      this.parcelaService.obtenerParcela(this.parcelaId).subscribe({
        next: (data) => {
          this.parcela = {
            ...data,
            coordenadas: {
              latitud: data.coordenadas.latitud,
              longitud: data.coordenadas.longitud
            }
          };
        },
        error: (error) => {
          console.error('Error al cargar la parcela:', error);
          this.router.navigate(['/parcelas']);
        }
      });
    }
  }

  onSubmit() {
    if (this.editMode && this.parcelaId) {
      this.parcelaService.actualizarParcela(this.parcelaId, this.parcela).subscribe({
        next: () => {
          this.router.navigate(['/parcelas']);
        },
        error: (error) => {
          console.error('Error al actualizar la parcela:', error);
        }
      });
    } else {
      this.parcelaService.crearParcela(this.parcela).subscribe({
        next: () => {
          this.router.navigate(['/parcelas']);
        },
        error: (error) => {
          console.error('Error al crear la parcela:', error);
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/parcelas']);
  }
}