import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from './producto.service';

@Component({
  selector: 'app-producto-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-edit.component.html',
  styleUrls: ['./producto-edit.component.css']
})
export class ProductoEditComponent implements OnInit {
  form: FormGroup;
  guardando = false;
  cargando = true;
  mensaje = '';
  error = false;
  productoId: string = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      humedad_optima: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      temperatura_optima: ['', [Validators.required, Validators.min(-50), Validators.max(50)]],
      temporada: ['', Validators.required],
      tiempo_cosecha: ['', [Validators.required, Validators.min(1)]],
      caracteristicas: this.fb.group({
        sensibilidad_lluvia: [''],
        sensibilidad_temperatura: [''],
        sensibilidad_humedad: [''],
        otros: [''],
      }),
      observaciones: [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
     if (id) {
       this.productoId = id;
       this.cargarProducto();
     } else {
       this.router.navigate(['/productos']);
     }
  }

  cargarProducto() {
    console.log('Intentando cargar producto con ID:', this.productoId);
    this.productoService.obtenerProducto(this.productoId).subscribe({
      next: (producto) => {
        console.log('Producto cargado exitosamente:', producto);
        this.form.patchValue(producto);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.mensaje = `Error al cargar el producto: ${error.status === 404 ? 'Producto no encontrado' : error.message || 'Error desconocido'}`;
        this.error = true;
        this.cargando = false;
      }
    });
  }

  guardar() {
    if (this.form.valid) {
      this.guardando = true;
      this.mensaje = '';
      this.error = false;

      this.productoService.actualizarProducto(this.productoId, this.form.value).subscribe({
        next: () => {
          this.mensaje = 'Producto actualizado correctamente';
          this.guardando = false;
          setTimeout(() => this.router.navigate(['/productos']), 1500);
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          this.mensaje = error.error?.error || 'Error al actualizar el producto';
          this.error = true;
          this.guardando = false;
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }
}