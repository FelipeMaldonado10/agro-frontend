import { Routes } from '@angular/router';
import { ProductoFormComponent } from './producto-form.component';

export const productoManagementRoutes: Routes = [
  { path: 'productos/nuevo', component: ProductoFormComponent }
];
