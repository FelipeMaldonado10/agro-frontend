import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router }from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.register(this.nombre, this.email, this.password).subscribe({
      next: () => {
        this.success = 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.error = '';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error.message || 'Error al registrarse';
        this.success = '';
      }
    });
  }
}
