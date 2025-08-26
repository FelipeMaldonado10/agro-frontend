import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-comparativa-estimaciones',
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent],
  templateUrl: './reporte-comparativa-estimaciones.component.html',
  styleUrls: ['./reporte-comparativa-estimaciones.component.css']
})
export class ReporteComparativaEstimacionesComponent implements OnInit {
  datos: any[] = [];
  loading = true;
  error = '';
  isBrowser = false;
  chartOptions: any = {};

  constructor(
    private reportesService: ReportesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.reportesService.getComparativaEstimaciones().subscribe({
      next: (res: any[]) => {
        // Filtrar datos inválidos
        this.datos = (res || []).filter(
          (d: any) => d && typeof d.producto === 'string' && d.producto.trim() !== '' &&
            typeof d.estimado === 'number' && !isNaN(d.estimado) &&
            typeof d.real === 'number' && !isNaN(d.real)
        ).map((d: any) => ({
          ...d,
          diferencia: Math.round((d.real || 0) - (d.estimado || 0))
        }));
        if (this.datos.length > 0) {
          const palette = [
            '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
            '#3F51B5', '#546E7A', '#D4526E', '#8D5B4C', '#F86624',
            '#2E294E', '#1B998B', '#E71D36', '#2D87BB', '#662E9B'
          ];
          this.chartOptions = {
            series: [
              { name: 'Estimación', data: this.datos.map((d: any) => Math.round(d.estimado)) },
              { name: 'Real', data: this.datos.map((d: any) => Math.round(d.real)) }
            ],
            chart: { type: 'bar', height: 350, stacked: false },
            xaxis: { categories: this.datos.map((d: any) => d.producto), title: { text: 'Producto' } },
            yaxis: { title: { text: 'Cantidad' } },
            title: { text: 'Comparativa de Estimaciones vs Real', align: 'center' },
            colors: this.datos.map((_: any, i: number) => palette[i % palette.length]),
            dataLabels: { enabled: true, formatter: function(val: number) { return Math.round(val); } },
            tooltip: { y: { formatter: function(val: number) { return Math.round(val); } } }
          };
        } else {
          this.chartOptions = { series: [], xaxis: { categories: [] } };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos de comparativa de estimaciones.';
        this.loading = false;
      }
    });
  }
}
