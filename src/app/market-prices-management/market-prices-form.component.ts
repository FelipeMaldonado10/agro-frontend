import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-market-prices-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './market-prices-form.component.html',
  styleUrls: ['./market-prices-form.component.css']
})
export class MarketPricesFormComponent {
  form: FormGroup;
  mensaje: string = '';
  archivo: File | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      producto: ['', Validators.required],
      ciudad: ['', Validators.required],
      fecha: ['', Validators.required],
      precio: ['', Validators.required]
    });
  }

  guardarManual() {
    if (this.form.valid) {
      this.http.post('/api/market-prices', this.form.value).subscribe({
        next: () => this.mensaje = 'Registro guardado correctamente',
        error: err => this.mensaje = err.error?.error || 'Error al guardar'
      });
    }
  }

  onFileChange(event: any) {
    this.archivo = event.target.files[0];
  }

  subirArchivo() {
    if (this.archivo) {
      const formData = new FormData();
      formData.append('file', this.archivo);
      this.http.post('/api/market-prices/upload', formData).subscribe({
        next: () => this.mensaje = 'Archivo subido correctamente',
        error: err => this.mensaje = err.error?.error || 'Error al subir archivo'
      });
    }
  }
}
