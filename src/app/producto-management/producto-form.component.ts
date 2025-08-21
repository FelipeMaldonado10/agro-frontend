import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent {
  form: FormGroup;
  mensaje: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      humedad_optima: ['', Validators.required],
      temperatura_optima: ['', Validators.required],
      temporada: ['', Validators.required],
      tiempo_cosecha: ['', Validators.required],
      caracteristicas: this.fb.group({
        sensibilidad_lluvia: [''],
        sensibilidad_temperatura: [''],
        sensibilidad_humedad: [''],
        otros: ['']
      }),
      observaciones: ['']
    });
  }

  guardar() {
    if (this.form.valid) {
      this.http.post('/api/productos', this.form.value).subscribe({
        next: () => this.mensaje = 'Producto guardado correctamente',
        error: err => this.mensaje = err.error?.error || 'Error al guardar'
      });
    }
  }
}
