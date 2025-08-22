import { Routes } from '@angular/router';
import { ProductoFormComponent } from './producto-form.component';
import { ProductoListComponent } from './producto-list.component';
import { ProductoEditComponent } from './producto-edit.component';
import { SuperadminGuard } from '../auth/superadmin.guard';

export const productoManagementRoutes: Routes = [
  { path: 'productos', component: ProductoListComponent },
  { 
    path: 'productos/nuevo', 
    component: ProductoFormComponent, 
    canActivate: [SuperadminGuard] 
  },
  { 
    path: 'productos/editar/:id', 
    component: ProductoEditComponent, 
    canActivate: [SuperadminGuard] 
  }
];
