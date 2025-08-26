import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';

const routes: Routes = [
  {
    path: '',
    component: ReportesComponent,
    children: [
      { path: '', component: ReportesComponent },
      { path: 'evolucion-precios', component: ReportesComponent, data: { reporte: 'evolucion-precios' } },
      { path: 'produccion-total', component: ReportesComponent, data: { reporte: 'produccion-total' } },
      { path: 'ingresos-totales', component: ReportesComponent, data: { reporte: 'ingresos-totales' } },
      { path: 'costos-ganancias', component: ReportesComponent, data: { reporte: 'costos-ganancias' } },
      { path: 'comparativa-estimaciones', component: ReportesComponent, data: { reporte: 'comparativa-estimaciones' } },
      { path: 'distribucion-cultivos', component: ReportesComponent, data: { reporte: 'distribucion-cultivos' } },
      { path: 'ranking-productos', component: ReportesComponent, data: { reporte: 'ranking-productos' } },
      { path: 'tendencias-oferta', component: ReportesComponent, data: { reporte: 'tendencias-oferta' } },
      { path: 'filtrado-temporal', component: ReportesComponent, data: { reporte: 'filtrado-temporal' } },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule {}
