import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router }from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
  });
}

  submit() {
    this.success = '';
    this.error = '';
    if (this.registerForm.invalid) {
      this.error = 'Por favor completa todos los campos correctamente.';
      return;
    }
    let data = { ...this.registerForm.value };
    this.loading = true;
    this.auth.register(data).subscribe({
      next: (res) => {
        this.success = res.message || 'Registro exitoso. Revisa tu correo.';
        this.registerForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error en el registro.';
        this.loading = false;
      }
    });
  }
}

