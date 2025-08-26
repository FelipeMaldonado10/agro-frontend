import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-produccion-total',
  templateUrl: './reporte-produccion-total.component.html',
  styleUrls: ['./reporte-produccion-total.component.css'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent]
})
export class ReporteProduccionTotalComponent implements OnInit {
  datos: any[] = [];
  loading = true;
  error = '';
  isBrowser = false;
  series: any[] = [];
  xaxis: any = { categories: [], title: { text: 'Producto' } };

  constructor(
    private reportesService: ReportesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.reportesService.getProduccionTotal().subscribe({
      next: (res: any[]) => {
        // Filtrar datos inválidos (producto vacío o totalCosechado no numérico)
        this.datos = (res || []).filter(
          (d: any) => d && typeof d.producto === 'string' && d.producto.trim() !== '' && typeof d.totalCosechado === 'number' && !isNaN(d.totalCosechado)
        );
        if (this.datos.length > 0) {
          this.series = [{ name: 'Total Cosechado', data: this.datos.map((d: any) => d.totalCosechado) }];
          this.xaxis = { categories: this.datos.map((d: any) => d.producto), title: { text: 'Producto' } };
        } else {
          this.series = [];
          this.xaxis = { categories: [], title: { text: 'Producto' } };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos de producción total.';
        this.loading = false;
      }
    });
  }
}
