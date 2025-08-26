import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-distribucion-cultivos',
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent],
  templateUrl: './reporte-distribucion-cultivos.component.html',
  styleUrls: ['./reporte-distribucion-cultivos.component.css']
})
export class ReporteDistribucionCultivosComponent implements OnInit {
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

  ngOnInit() {
    this.reportesService.getDistribucionCultivos().subscribe({
      next: (res) => {
        // El backend devuelve [{ ciudad, totalCultivos }]
        this.datos = (res || []).filter(
          (d: any) => d && typeof d.ciudad === 'string' && d.ciudad.trim() !== '' &&
            typeof d.totalCultivos === 'number' && !isNaN(d.totalCultivos)
        );
            if (this.datos.length > 0) {
              const palette = [
                '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
                '#3F51B5', '#546E7A', '#D4526E', '#8D5B4C', '#F86624',
                '#2E294E', '#1B998B', '#E71D36', '#2D87BB', '#662E9B'
              ];
              const total = this.datos.reduce((sum, d) => sum + d.totalCultivos, 0);
              this.chartOptions = {
                series: this.datos.map((d: any) => d.totalCultivos),
                chart: { type: 'pie', height: 350 },
                labels: this.datos.map((d: any) => d.ciudad),
                title: { text: 'Distribución de Cultivos por Ciudad', align: 'center' },
                colors: this.datos.map((_: any, i: number) => palette[i % palette.length]),
                dataLabels: {
                  enabled: true,
                  formatter: function(val: number) {
                      // const percent = (val / total) * 100 / 5;
                      // return Math.round(val) + ' (' + percent.toFixed(1) + '%)';
                  }
                },
                tooltip: {
                  y: {
                    formatter: function(val: number) {
                      const percent = (val / total) * 100;
                      return Math.round(val) + ' (' + percent.toFixed(1) + '%)';
                    }
                  }
                }
              };
        } else {
          this.chartOptions = { series: [], labels: [] };
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos de distribución de cultivos.';
        this.loading = false;
      }
    });
  }
}
