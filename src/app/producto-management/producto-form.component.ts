import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from './producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Registrar Nuevo Producto</h2>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" formControlName="nombre">
        </div>

        <div class="mb-3">
          <label class="form-label">Humedad Óptima (%)</label>
          <input type="number" class="form-control" formControlName="humedad_optima">
        </div>

        <div class="mb-3">
          <label class="form-label">Temperatura Óptima (°C)</label>
          <input type="number" class="form-control" formControlName="temperatura_optima">
        </div>

        <div class="mb-3">
          <label class="form-label">Temporada</label>
          <input type="text" class="form-control" formControlName="temporada">
        </div>

        <div class="mb-3">
          <label class="form-label">Tiempo de Cosecha (días)</label>
          <input type="number" class="form-control" formControlName="tiempo_cosecha">
        </div>
        <div class="mb-3">
          <label class="form-label">Rendimiento estimado (kg/m²)</label>
          <input type="number" class="form-control" formControlName="rendimiento_estimado" step="any" min="0">
        </div>

        <div formGroupName="caracteristicas">
          <h4 class="mt-4 mb-3">Características</h4>

          <div class="mb-3">
            <label for="sens_lluvia" class="form-label">Sensibilidad a la Lluvia</label>
            <select class="form-select" id="sens_lluvia" formControlName="sensibilidad_lluvia">
              <option value="">Seleccionar...</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="mb-3">
            <label for="sens_temp" class="form-label">Sensibilidad a la Temperatura</label>
            <select class="form-select" id="sens_temp" formControlName="sensibilidad_temperatura">
              <option value="">Seleccionar...</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="mb-3">
            <label for="sens_humedad" class="form-label">Sensibilidad a la Humedad</label>
            <select class="form-select" id="sens_humedad" formControlName="sensibilidad_humedad">
              <option value="">Seleccionar...</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Otros Detalles</label>
            <textarea class="form-control" formControlName="otros" rows="3"></textarea>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Observaciones</label>
          <textarea class="form-control" formControlName="observaciones" rows="3"></textarea>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" [disabled]="!form.valid || guardando">
            {{ guardando ? 'Guardando...' : 'Guardar Producto' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="cancelar()">
            Cancelar
          </button>
        </div>

        <div class="alert alert-success mt-3" *ngIf="mensaje">
          {{ mensaje }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
    }
    textarea {
      resize: vertical;
    }
  `]
})
export class ProductoFormComponent {
  form: FormGroup;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      humedad_optima: ['', Validators.required],
      temperatura_optima: ['', Validators.required],
      temporada: ['', Validators.required],
      tiempo_cosecha: ['', Validators.required],
      rendimiento_estimado: ['', Validators.required],
      caracteristicas: this.fb.group({
        sensibilidad_lluvia: [''],
        sensibilidad_temperatura: [''],
        sensibilidad_humedad: [''],
        otros: [''],
      }),
      observaciones: [''],
    });
  }

  guardar() {
    if (this.form.valid) {
      this.guardando = true;
      this.productoService.crearProducto(this.form.value).subscribe({
        next: () => {
          this.mensaje = 'Producto guardado correctamente';
          this.guardando = false;
          setTimeout(() => this.router.navigate(['/productos']), 1500);
        },
        error: (error) => {
          console.error('Error al guardar producto:', error);
          this.mensaje = error.error?.error || 'Error al guardar';
          this.guardando = false;
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }
}
