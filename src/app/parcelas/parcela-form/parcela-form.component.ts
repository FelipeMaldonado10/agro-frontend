import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ParcelaService } from '../parcela.service';
import { CiudadService } from '../../ciudades/ciudad.service';

@Component({
  selector: 'app-parcela-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>{{ editMode ? 'Editar' : 'Crear' }} Parcela</h2>
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
          <label for="ciudadId" class="form-label">Ciudad</label>
          <select
            class="form-select"
            id="ciudadId"
            name="ciudadId"
            [(ngModel)]="parcela.ciudadId"
            required
          >
            <option value="">Seleccione una ciudad</option>
            <option *ngFor="let ciudad of ciudades" [value]="ciudad._id">
              {{ ciudad.nombre }} ({{ ciudad.coordenadas.latitud }}, {{ ciudad.coordenadas.longitud }})
            </option>
          </select>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" [disabled]="!parcelaForm.form.valid">
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
    ciudadId: ''
  };

  ciudades: any[] = [];

  editMode = false;
  parcelaId: string | null = null;

  constructor(
    private parcelaService: ParcelaService,
    private ciudadService: CiudadService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.cargarCiudades();
    this.parcelaId = this.route.snapshot.paramMap.get('id');
    if (this.parcelaId) {
      this.editMode = true;
      this.cargarParcela();
    }
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

  cargarParcela() {
    if (this.parcelaId) {
      this.parcelaService.obtenerParcela(this.parcelaId).subscribe({
        next: (data) => {
          this.parcela = {
            nombre: data.nombre,
            ciudadId: data.ciudad._id
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