
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';



@Component({
  selector: 'app-reporte-tendencias-oferta',
  templateUrl: './reporte-tendencias-oferta.component.html',
  styleUrls: ['./reporte-tendencias-oferta.component.css'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent, FormsModule]
})
export class ReporteTendenciasOfertaComponent implements OnInit {
  filtroAnio: string = '';
  filtroProducto: string = '';
  aniosDisponibles: string[] = [];
  productosDisponibles: string[] = [];
  datos: any[] = [];
  loading = true;
  error = '';
  chartOptionsTendencia: any = {};
  productos: string[] = [];
  periodos: string[] = [];
  series: any[] = [];

  constructor(private reportesService: ReportesService) {}

  ngOnInit() {
    this.fetchTendenciasOferta();
  }

  fetchTendenciasOferta() {
    this.reportesService.getTendenciasOferta().subscribe({
      next: (res: any[]) => {
        this.datos = Array.isArray(res) ? res : [];
        this.aniosDisponibles = [...new Set(this.datos.map((d: any) => d.anio))].sort();
        this.productosDisponibles = [...new Set(this.datos.map((d: any) => d.producto))].sort();
        this.filtrarYConstruir();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos de tendencias de oferta.';
        this.chartOptionsTendencia = this.buildTendenciaChartOptions('Tendencia de Oferta por Mes', [], []);
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    this.filtrarYConstruir();
  }

  private filtrarYConstruir() {
    let filtrados = this.datos;
    if (this.filtroAnio) {
      filtrados = filtrados.filter((d: any) => d.anio == this.filtroAnio);
    }
    if (this.filtroProducto) {
      filtrados = filtrados.filter((d: any) => d.producto == this.filtroProducto);
    }
    this.periodos = [...new Set(filtrados.map((d: any) => `${d.anio}-${d.mes.toString().padStart(2, '0')}`))].sort();
    this.productos = this.filtroProducto ? [this.filtroProducto] : [...new Set(filtrados.map((d: any) => d.producto))];
    this.series = this.productos.map(producto => ({
      name: producto,
      data: this.periodos.map(periodo => {
        const [anio, mes] = periodo.split('-');
        const found = filtrados.find((d: any) => d.producto === producto && d.anio == +anio && d.mes == +mes);
        return found ? Math.round(found.cantidad) : 0;
      })
    }));
    this.chartOptionsTendencia = this.buildTendenciaChartOptions('Tendencia de Oferta por Mes', this.periodos, this.series);
  }

  buildTendenciaChartOptions(title: string, categorias: string[], series: any[]) {
    const palette = [
      '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
      '#3F51B5', '#546E7A', '#D4526E', '#8D5B4C', '#F86624',
      '#2E294E', '#1B998B', '#E71D36', '#2D87BB', '#662E9B'
    ];
    if (!categorias.length) {
      categorias = ['Sin datos'];
      series = [{ name: 'Sin datos', data: [0] }];
    }
    return {
      series,
      chart: { type: 'line', height: 400, toolbar: { show: true } },
      xaxis: { categories: categorias, title: { text: 'Mes' } },
      yaxis: { title: { text: 'Total Sembrado' } },
      title: { text: title, align: 'center' },
      colors: series.map((_: any, i: number) => palette[i % palette.length]),
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: function(val: number) { return Math.round(val); } } }
    };
  }

  public getTendenciaIndices(): number[] {
    return this.periodos.map((_, idx) => idx);
  }
  public getPeriodoLabel(periodo: string): string {
    const [anio, mes] = periodo.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[+mes-1]} ${anio}`;
  }
}