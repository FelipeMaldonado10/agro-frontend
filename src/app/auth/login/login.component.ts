import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        // Redirige según el rol si lo deseas
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error.message || 'Error al iniciar sesión';
      }
    });
  }
}
