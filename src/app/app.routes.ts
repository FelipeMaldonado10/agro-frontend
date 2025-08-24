import { Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { ProductorGuard } from './auth/productor.guard';
import { RegisterComponent } from './auth/register/register.component';
import { SuperadminGuard } from './auth/superadmin.guard';
import { CiudadFormComponent } from './ciudades/ciudad-form/ciudad-form.component';
import { CiudadListComponent } from './ciudades/ciudad-list/ciudad-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { marketPricesManagementRoutes } from './market-prices-management/market-prices-management.routes';
import { MarketPriceDetailComponent } from './market-prices/market-price-detail/market-price-detail.component';
import { ParcelaDetailComponent } from './parcelas/parcela-detail/parcela-detail.component';
import { ParcelaFormComponent } from './parcelas/parcela-form/parcela-form.component';
import { ParcelaListComponent } from './parcelas/parcela-list/parcela-list.component';
import { productoManagementRoutes } from './producto-management/producto-management.routes';
import { recomendacionesRoutes } from './recomendaciones/recomendaciones.routes';

import { cultivoRoutes } from './cultivos/cultivo.routes';

import { UserFormComponent } from './user-management/user-form/user-form.component';
import { UserListComponent } from './user-management/user-list/user-list.component';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'user-management', component: UserListComponent, canActivate: [SuperadminGuard] },
    { path: 'user-management/create', component: UserFormComponent, canActivate: [SuperadminGuard] },
    { path: 'user-management/edit/:id', component: UserFormComponent, canActivate: [SuperadminGuard] },
    { path: 'parcelas', component: ParcelaListComponent, canActivate: [ProductorGuard] },
    // Rutas de Ciudades (solo para administradores)
    { path: 'ciudades', component: CiudadListComponent, canActivate: [AdminGuard] },
    { path: 'ciudades/crear', component: CiudadFormComponent, canActivate: [AdminGuard] },
    { path: 'ciudades/editar/:id', component: CiudadFormComponent, canActivate: [AdminGuard] },
    // Rutas de Parcelas
    { path: 'parcelas/crear', component: ParcelaFormComponent, canActivate: [ProductorGuard] },
    { path: 'parcelas/:id', component: ParcelaDetailComponent, canActivate: [ProductorGuard] },
    { path: 'parcelas/editar/:id', component: ParcelaFormComponent, canActivate: [ProductorGuard] },
    // Rutas de Precios de Mercado
    ...marketPricesManagementRoutes,
    ...productoManagementRoutes,
    ...recomendacionesRoutes,

    // Rutas de Cultivos
    { 
      path: 'cultivos', 
      children: cultivoRoutes,
      canActivate: [AuthGuard, ProductorGuard]
    },

    { path: 'market-prices/:id', component: MarketPriceDetailComponent },


    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' }
];
