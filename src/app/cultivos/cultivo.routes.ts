import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { ProductorGuard } from '../auth/productor.guard';
import { CultivoListComponent } from './cultivo-list/cultivo-list.component';
import { CultivoDetailComponent } from './cultivo-detail/cultivo-detail.component';
import { RegistrarCosechaComponent } from './registrar-cosecha/registrar-cosecha.component';
import { SeleccionarProductoComponent } from './seleccionar-producto/seleccionar-producto.component';

export const cultivoRoutes: Routes = [
  {
    path: '',
    component: CultivoListComponent,
    canActivate: [AuthGuard, ProductorGuard]
  },
  {
    path: 'cultivos/seleccionar-producto',
    component: SeleccionarProductoComponent,
    canActivate: [AuthGuard, ProductorGuard]
  },
  {
    path: 'cultivos/:id',
    component: CultivoDetailComponent,
    canActivate: [AuthGuard, ProductorGuard]
  },
  {
    path: 'cultivos/:id/cosecha',
    component: RegistrarCosechaComponent,
    canActivate: [AuthGuard, ProductorGuard]
  }
];
