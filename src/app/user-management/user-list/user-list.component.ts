import { Component, OnInit } from '@angular/core';
import { UserManagementService } from '../user-management.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
  
@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  error = '';

  constructor(private userService: UserManagementService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => this.users = res,
      error: (err) => this.error = err.error?.message || 'Error al cargar usuarios'
    });
  }

  deleteUser(id: string) {
    if (confirm('¿Eliminar usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => this.error = err.error?.message || 'Error al eliminar usuario'
      });
    }
  }
}
