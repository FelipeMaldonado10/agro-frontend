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
  loading = false;
  error: string = '';
  success: string = '';
  editUserId: string | null = null;
  editForm: any = {};

  constructor(private userService: UserManagementService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  startEdit(user: any) {
    this.editUserId = user._id;
    this.editForm = { ...user };
    this.success = '';
    this.error = '';
  }

  cancelEdit() {
    this.editUserId = null;
    this.editForm = {};
  }

  saveEdit(id: string) {
    this.userService.updateUser(id, this.editForm).subscribe({
      next: () => {
        this.success = 'Usuario actualizado correctamente';
        this.error = '';
        this.editUserId = null;
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar usuario';
        this.success = '';
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('¿Eliminar usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.success = 'Usuario eliminado correctamente';
          this.error = '';
          this.loadUsers();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al eliminar usuario';
          this.success = '';
        }
      });
    }
  }
}