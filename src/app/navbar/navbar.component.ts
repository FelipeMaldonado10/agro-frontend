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
