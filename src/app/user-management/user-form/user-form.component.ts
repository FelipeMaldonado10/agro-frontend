import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserManagementService } from '../user-management.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  user: any = { nombre: '', email: '', password: '', rol: 'productor', estado: 'activo' };
  isEdit = false;
  error = '';
  success = '';

  constructor(
    private userService: UserManagementService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userService.getUsers().subscribe({
        next: (users) => {
          const found = users.find((u: any) => u._id === id);
          if (found) this.user = { ...found, password: '' };
        }
      });
    }
  }
    cancel() {
      this.location.back();
    }


  onSubmit() {
    if (this.isEdit) {
      this.userService.updateUser(this.user._id, this.user).subscribe({
        next: () => {
          this.success = 'Usuario actualizado';
          this.error = '';
          this.router.navigate(['/user-management']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar';
          this.success = '';
        }
      });
    } else {
      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.success = 'Usuario creado';
          this.error = '';
          this.router.navigate(['/user-management']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear';
          this.success = '';
        }
      });
    }
  }
}
