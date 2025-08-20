import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductorGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.getUserInfo();
    if (!user || !['productor', 'admin', 'superadmin'].includes(user.rol)) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
