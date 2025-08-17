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

  constructor(private auth: AuthService, private router: Router) {
    this.updateUser();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateUser();
      }
    });
  }

  updateUser() {
    this.user = this.auth.getUserInfo();
  }

  logout() {
    this.auth.logout();
    this.updateUser();
    this.router.navigate(['/login']);
  }
}
