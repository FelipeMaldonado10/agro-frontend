import { CommonModule, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';

import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

// Tipado explícito para los datos de evolución de precios
export interface EvolucionPrecio {
  producto: string;
  fecha: string;
  precioPromedio: number;
  precioMin: number;
  precioMax: number;
}

@Component({
  selector: 'app-reporte-evolucion-precios',
  templateUrl: './reporte-evolucion-precios.component.html',
  styleUrls: ['./reporte-evolucion-precios.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, SsrSafeApexChartComponent]
})

export class ReporteEvolucionPreciosComponent implements OnInit {
  chartOptions: Partial<ChartOptions> = {};
  datos: EvolucionPrecio[] = [];
  loading = true;
  error = '';
  isBrowser = false;

  productos: string[] = [];
  fechas: string[] = [];
  productoChecks: { [producto: string]: boolean } = {};

  constructor(
    private reportesService: ReportesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.reportesService.getEvolucionPrecios().subscribe({
      next: (res: EvolucionPrecio[]) => {
        // Filtrar datos con fecha válida
        this.datos = res.filter((d: EvolucionPrecio) => d.fecha && typeof d.fecha === 'string' && d.fecha.trim() !== '');
        this.productos = Array.from(new Set(this.datos.map((d: EvolucionPrecio) => d.producto)));
        this.fechas = Array.from(new Set(this.datos.map((d: EvolucionPrecio) => d.fecha))).sort();
        // Inicializar todos los productos como visibles
        this.productos.forEach((p: string) => this.productoChecks[p] = true);
        this.updateChart();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos de evolución de precios.';
        this.loading = false;
      }
    });
  }


  updateChart() {
    // Para cada producto, solo fechas donde hay datos (línea de tiempo real)
    const series = this.productos
      .filter((producto: string) => this.productoChecks[producto])
      .map((producto: string) => {
        // Filtrar datos solo de este producto (ya están filtrados por fecha válida en this.datos)
        const datosProducto = this.datos.filter((d: EvolucionPrecio) => d.producto === producto);
        // Ordenar por fecha ascendente
        datosProducto.sort((a: EvolucionPrecio, b: EvolucionPrecio) => a.fecha.localeCompare(b.fecha));
         return {
           name: producto,
           data: datosProducto.map((d: EvolucionPrecio) => ({ x: d.fecha && d.fecha.trim() !== '' ? d.fecha : 'Proyeccion', y: d.precioPromedio }))
         };
      });
     this.chartOptions = {
       series,
       chart: {
         type: 'line',
         height: 400,
         toolbar: { show: true }
       },
       xaxis: {
         type: 'category',
         title: { text: 'Fecha' },
         labels: {
           rotate: -45,
           formatter: (val: string | number) => String(val) === 'undefined' ? 'Proyeccion' : String(val)
         }
       },
       yaxis: {
         title: { text: 'Precio promedio' },
         labels: {
           formatter: (val: number) => typeof val === 'number' ? val.toFixed(2) : val
         }
       },
       title: {
         text: 'Evolución de Precios por Producto',
         align: 'center'
       },
       stroke: {
         curve: 'smooth',
         width: 3
       },
       dataLabels: {
         enabled: false,
         formatter: (val: number) => typeof val === 'number' ? val.toFixed(2) : val
       },
       tooltip: {
         shared: true,
         intersect: false,
         x: {
           formatter: (val: string | number) => String(val) === 'undefined' ? 'Proyeccion' : String(val)
         },
         y: {
           formatter: (val: number) => typeof val === 'number' ? val.toFixed(2) : val
         }
       }
     };
  }

  toggleProducto(producto: string) {
    this.productoChecks[producto] = !this.productoChecks[producto];
    this.updateChart();
  }
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};
