import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-ingresos-totales',
  templateUrl: './reporte-ingresos-totales.component.html',
  styleUrls: ['./reporte-ingresos-totales.component.css'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent]
})
export class ReporteIngresosTotalesComponent implements OnInit {
  datos: any[] = [];
  loading = true;
  error = '';
  isBrowser = false;
  series: any[] = [];
  xaxis: any = { categories: [], title: { text: 'Producto' } };
  chartOptions: any = {
    yaxis: {
      title: { text: 'Ingresos Totales' },
      labels: {
        formatter: (val: number) => typeof val === 'number' ? val.toFixed(2) : val
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => typeof val === 'number' ? val.toFixed(2) : val
    },
    tooltip: {
      y: {
        formatter: (val: number) => typeof val === 'number' ? val.toFixed(2) : val
      }
    }
  };

  constructor(
    private reportesService: ReportesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
  this.reportesService.getIngresosTotales().subscribe({
      next: (res: any[]) => {
        // Filtrar datos inválidos (producto vacío o ingresosTotales no numérico)
        this.datos = (res || []).filter(
          (d: any) => d && typeof d.producto === 'string' && d.producto.trim() !== '' && typeof d.ingresosTotales === 'number' && !isNaN(d.ingresosTotales)
        );
        if (this.datos.length > 0) {
          this.series = [{ name: 'Ingresos Totales', data: this.datos.map((d: any) => d.ingresosTotales) }];
          this.xaxis = { categories: this.datos.map((d: any) => d.producto), title: { text: 'Producto' } };
        } else {
          this.series = [];
          this.xaxis = { categories: [], title: { text: 'Producto' } };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos de ingresos totales.';
        this.loading = false;
      }
    });
  }
}
