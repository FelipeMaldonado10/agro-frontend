import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { productoManagementRoutes } from './producto-management.routes';
import { ProductoFormComponent } from './producto-form.component';
import { ProductoListComponent } from './producto-list.component';
import { ProductoEditComponent } from './producto-edit.component';
import { ProductoService } from './producto.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(productoManagementRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    ProductoFormComponent,
    ProductoListComponent,
    ProductoEditComponent
  ],
  providers: [ProductoService]
})
export class ProductoModule { }