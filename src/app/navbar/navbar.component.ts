<<<<<<< Updated upstream
import { Component } from '@angular/core';
import { Router, RouterModule, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
})
export class NavbarComponent {
  user: any;
  isLoggedIn = false;
  isSuperadmin = false;
  menuOpen = false;

  constructor(private auth: AuthService, private router: Router) {
    this.updateUser();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateUser();
        this.menuOpen = false; // Cierra el menú al navegar
      }
    });
  }

  updateUser() {
    this.user = this.auth.getUserInfo();
    this.isLoggedIn = !!this.user;
    this.isSuperadmin = this.user?.rol === 'superadmin';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeNavbar() {
    this.menuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.updateUser();
    this.router.navigate(['/login']);
    this.menuOpen = false;
  }
}
=======
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
})
export class NavbarComponent {
  user: any;
  isLoggedIn = false;
  isSuperadmin = false;
  isAdmin = false;
  isProductor = false;
  menuOpen = false;
  isMobileView = false;

  private resizeTimeout: any;

  constructor(private auth: AuthService, private router: Router) {
    this.updateUser();
    this.checkMobileView();
    window.addEventListener('resize', this.debounce(this.checkMobileView.bind(this), 100));
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateUser();
        this.menuOpen = false; // Cierra menú al cambiar de ruta
      }
    });
  }

  private debounce(func: Function, wait: number) {
    return (...args: any[]) => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  checkMobileView() {
    const width = window.innerWidth;
    this.isMobileView = width < 992;
    if (!this.isMobileView) {
      this.menuOpen = false; // Solo cerrar en escritorio
    }
  }

  updateUser() {
    this.user = this.auth.getUserInfo();
    this.isLoggedIn = !!this.user;
    this.isSuperadmin = this.user?.rol === 'superadmin';
    this.isAdmin = this.user && ['admin', 'superadmin'].includes(this.user.rol);
    this.isProductor = this.user && ['productor', 'admin', 'superadmin'].includes(this.user.rol);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeNavbar() {
    this.menuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.updateUser();
    this.router.navigate(['/login']);
    this.menuOpen = false;
  }
}
>>>>>>> Stashed changes
