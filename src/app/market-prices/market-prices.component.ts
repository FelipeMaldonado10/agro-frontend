import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-market-prices',
  templateUrl: './market-prices.component.html',

  styleUrls: ['./market-prices.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
  styleUrls: ['./market-prices.component.css']

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      producto: ['', Validators.required],
      fecha: ['', Validators.required],
      precio: ['', Validators.required],
      mercado: [''],
      departamento: ['']
    });
    this.loadPrices();
  }

  loadPrices() {
    this.http.get<any[]>('/api/market-prices').subscribe(data => {
      this.prices = data;
    });
  }

  submitForm() {
    if (this.form.invalid) return;
    this.http.post('/api/market-prices', this.form.value).subscribe(() => {
      this.form.reset();
      this.loadPrices();
    });
  }

  deletePrice(id: string) {
    this.http.delete(`/api/market-prices/${id}`).subscribe(() => {
      this.loadPrices();
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    this.fileError = '';
    const formData = new FormData();
    formData.append('file', file);
    this.http.post('/api/market-prices/upload', formData).subscribe({
      next: () => {
        this.uploading = false;
        this.loadPrices();
      },
      error: err => {
        this.uploading = false;
        this.fileError = 'Error al subir el archivo';
      }
    });
  }
}
