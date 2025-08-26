import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-filtrado-temporal',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, SsrSafeApexChartComponent],
  templateUrl: './reporte-filtrado-temporal.component.html',
  styleUrls: ['./reporte-filtrado-temporal.component.css']
})
export class ReporteFiltradoTemporalComponent implements OnInit {
  datos: any[] = [];
  loading = false;
  error = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  isBrowser = false;

  series: any[] = [];
  xaxis: any = { categories: [], title: { text: 'Fecha' } };

  constructor(
    private reportesService: ReportesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  buscar() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Selecciona un rango de fechas.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.reportesService.getFiltradoTemporal({ fechaInicio: this.fechaInicio, fechaFin: this.fechaFin }).subscribe({
      next: (res) => {
        this.datos = res;
  this.series = [{ name: 'Cantidad', data: this.datos.map((d: any) => d.cantidad) }];
  this.xaxis = { categories: this.datos.map((d: any) => d.fecha), title: { text: 'Fecha' } };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos del filtrado temporal.';
        this.loading = false;
      }
    });
  }

  ngOnInit() {}
}
