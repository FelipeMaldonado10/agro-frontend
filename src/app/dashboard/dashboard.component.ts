import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  user: any;

  constructor(private auth: AuthService) {
    this.user = this.auth.getUserInfo();
  }
}
