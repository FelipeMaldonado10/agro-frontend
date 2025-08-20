import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserListComponent } from './user-management/user-list/user-list.component';
import { UserFormComponent } from './user-management/user-form/user-form.component';
import { SuperadminGuard } from './auth/superadmin.guard';
import { ProductorGuard } from './auth/productor.guard';
import { ParcelaListComponent } from './parcelas/parcela-list/parcela-list.component';
import { ParcelaFormComponent } from './parcelas/parcela-form/parcela-form.component';
import { ParcelaDetailComponent } from './parcelas/parcela-detail/parcela-detail.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'user-management', component: UserListComponent, canActivate: [SuperadminGuard] },
    { path: 'user-management/create', component: UserFormComponent, canActivate: [SuperadminGuard] },
    { path: 'user-management/edit/:id', component: UserFormComponent, canActivate: [SuperadminGuard] },
    { path: 'parcelas', component: ParcelaListComponent, canActivate: [ProductorGuard] },
    { path: 'parcelas/crear', component: ParcelaFormComponent, canActivate: [ProductorGuard] },
    { path: 'parcelas/:id', component: ParcelaDetailComponent, canActivate: [ProductorGuard] },
    { path: 'parcelas/editar/:id', component: ParcelaFormComponent, canActivate: [ProductorGuard] },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' }
];
