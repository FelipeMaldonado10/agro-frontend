import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-costos-ganancias',
  templateUrl: './reporte-costos-ganancias.component.html',
  styleUrls: ['./reporte-costos-ganancias.component.css'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent]
})

export class ReporteCostosGananciasComponent implements OnInit {
  datos: any[] = [];
  loading = true;
  error = '';
  isBrowser = false;
  chartOptionsCostos: any = {};
  chartOptionsGanancias: any = {};


  constructor(
    private reportesService: ReportesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.reportesService.getCostosGanancias().subscribe({
      next: (res: any[]) => {
        // Filtrar datos inválidos (producto vacío o valores no numéricos)
        this.datos = (res || []).filter(
          (d: any) => d && typeof d.producto === 'string' && d.producto.trim() !== '' &&
            typeof d.costosTotales === 'number' && !isNaN(d.costosTotales) &&
            typeof d.gananciasNetas === 'number' && !isNaN(d.gananciasNetas)
        );
        if (this.datos.length > 0) {
          const palette = [
            '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
            '#3F51B5', '#546E7A', '#D4526E', '#8D5B4C', '#F86624',
            '#2E294E', '#1B998B', '#E71D36', '#2D87BB', '#662E9B'
          ];
          // Gráfica de Costos
          this.chartOptionsCostos = {
            series: [{ name: 'Costos Totales', data: this.datos.map((d: any) => Math.round(d.costosTotales)) }],
            chart: { type: 'bar', height: 350, toolbar: { show: true } },
            xaxis: { categories: this.datos.map((d: any) => d.producto), title: { text: 'Producto' } },
            yaxis: { title: { text: 'Costos Totales' } },
            title: { text: 'Costos Totales por Producto', align: 'center' },
            colors: this.datos.map((_: any, i: number) => palette[i % palette.length]),
            dataLabels: { enabled: true, formatter: function(val: number) { return Math.round(val); } },
            tooltip: { y: { formatter: function(val: number) { return Math.round(val); } } }
          };
          // Gráfica de Ganancias
          this.chartOptionsGanancias = {
            series: [{ name: 'Ganancias Netas', data: this.datos.map((d: any) => Math.round(d.gananciasNetas)) }],
            chart: { type: 'bar', height: 350, toolbar: { show: true } },
            xaxis: { categories: this.datos.map((d: any) => d.producto), title: { text: 'Producto' } },
            yaxis: { title: { text: 'Ganancias Netas' } },
            title: { text: 'Ganancias Netas por Producto', align: 'center' },
            colors: this.datos.map((_: any, i: number) => palette[i % palette.length]),
            dataLabels: { enabled: true, formatter: function(val: number) { return Math.round(val); } },
            tooltip: { y: { formatter: function(val: number) { return Math.round(val); } } }
          };
        } else {
          this.chartOptionsCostos = { series: [], xaxis: { categories: [] } };
          this.chartOptionsGanancias = { series: [], xaxis: { categories: [] } };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos de costos y ganancias.';
        this.loading = false;
      }
    });
  }
}
