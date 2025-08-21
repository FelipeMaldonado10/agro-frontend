import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-recomendaciones-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recomendaciones-form.component.html',
  styleUrls: ['./recomendaciones-form.component.css']
})
export class RecomendacionesFormComponent {
  form: FormGroup;
  resultado: any = null;
  mensaje: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      ciudad: ['', Validators.required],
      fecha: ['', Validators.required]
    });
  }

  consultar() {
    if (this.form.valid) {
      const { ciudad, fecha } = this.form.value;
      this.http.get(`/api/recomendaciones?ciudad=${ciudad}&fecha=${fecha}`).subscribe({
        next: res => this.resultado = res,
        error: err => this.mensaje = err.error?.error || 'Error al consultar recomendaciones'
      });
    }
  }
}
