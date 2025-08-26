import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ReporteComparativaEstimacionesComponent } from './reporte-comparativa-estimaciones/reporte-comparativa-estimaciones.component';
import { ReporteCostosGananciasComponent } from './reporte-costos-ganancias/reporte-costos-ganancias.component';
import { ReporteDistribucionCultivosComponent } from './reporte-distribucion-cultivos/reporte-distribucion-cultivos.component';
import { ReporteEvolucionPreciosComponent } from './reporte-evolucion-precios/reporte-evolucion-precios.component';
import { ReporteIngresosTotalesComponent } from './reporte-ingresos-totales/reporte-ingresos-totales.component';
import { ReporteProduccionTotalComponent } from './reporte-produccion-total/reporte-produccion-total.component';
import { ReporteRankingProductosComponent } from './reporte-ranking-productos/reporte-ranking-productos.component';
import { ReporteTendenciasOfertaComponent } from './reporte-tendencias-oferta/reporte-tendencias-oferta.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReporteEvolucionPreciosComponent,
    ReporteProduccionTotalComponent,
    ReporteIngresosTotalesComponent,
    ReporteCostosGananciasComponent,
    ReporteComparativaEstimacionesComponent,
    ReporteDistribucionCultivosComponent,
    ReporteRankingProductosComponent,
    ReporteTendenciasOfertaComponent,
    // ReporteFiltradoTemporalComponent
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {
  reporteSeleccionado: string = 'evolucion-precios';

  constructor(private route: ActivatedRoute, private router: Router) {
    // Sincronizar con la ruta activa
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const child = this.route.firstChild;
      if (child && child.snapshot.routeConfig && child.snapshot.routeConfig.path) {
        this.reporteSeleccionado = child.snapshot.routeConfig.path as string;
      } else {
        this.reporteSeleccionado = 'evolucion-precios';
      }
    });
  }

  onReporteChange() {
    if (this.reporteSeleccionado === '' || this.reporteSeleccionado === 'panel') {
      this.router.navigate(['/reportes']);
    } else {
      this.router.navigate(['/reportes', this.reporteSeleccionado]);
    }
  }

  getReporteNombre(key: string): string {
    switch (key) {
      case 'evolucion-precios': return 'Evolución de Precios';
      case 'produccion-total': return 'Producción Total';
      case 'ingresos-totales': return 'Ingresos Totales';
      case 'costos-ganancias': return 'Costos y Ganancias';
      case 'comparativa-estimaciones': return 'Comparativa Estimaciones';
      case 'distribucion-cultivos': return 'Distribución de Cultivos';
      case 'ranking-productos': return 'Ranking de Productos';
      case 'tendencias-oferta': return 'Tendencias de Oferta';
      // case 'filtrado-temporal': return 'Filtrado Temporal';
      default: return '';
    }
  }
}
