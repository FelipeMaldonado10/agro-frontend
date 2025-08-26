
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportesService } from '../reportes.service';
import { SsrSafeApexChartComponent } from '../ssr-safe-apexchart.component';

@Component({
  selector: 'app-reporte-ranking-productos',
  templateUrl: './reporte-ranking-productos.component.html',
  styleUrls: ['./reporte-ranking-productos.component.css'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, SsrSafeApexChartComponent, FormsModule]
})
export class ReporteRankingProductosComponent implements OnInit {
  datos: any[] = [];
  loading = true;
  error = '';
  isBrowser = false;
  chartOptionsSembrado: any = {};
  chartOptionsCosechado: any = {};
  datosSembrado: any[] = [];
  datosCosechado: any[] = [];

  tendenciasOferta: Array<{ producto: string; mes: string; totalSembrado: number }> = [];
  chartOptionsTendencia: any = {};

  constructor(public reportesService: ReportesService) {}

  public getTendenciaIndices(): number[] {
    const cats = this.chartOptionsTendencia && this.chartOptionsTendencia.xaxis && Array.isArray(this.chartOptionsTendencia.xaxis.categories)
      ? this.chartOptionsTendencia.xaxis.categories
      : [];
    return cats.map((_: any, idx: number) => idx);
  }

  ngOnInit(): void {
    this.fetchRanking();
    this.fetchTendenciasOferta();
  }
  fetchTendenciasOferta() {
    this.reportesService.getTendenciasOferta().subscribe({
      next: (res: Array<{ producto: string; mes: string; totalSembrado: number }>) => {
        this.tendenciasOferta = Array.isArray(res) ? res : [];
        const productos: string[] = [...new Set(this.tendenciasOferta.map((d: any) => d.producto))];
        const meses: string[] = [...new Set(this.tendenciasOferta.map((d: any) => d.mes))].sort();
        const series = productos.map(producto => ({
          name: producto,
          data: meses.map(mes => {
            const found = this.tendenciasOferta.find((d: any) => d.producto === producto && d.mes === mes);
            return found ? Math.round(found.totalSembrado) : 0;
          })
        }));
        this.chartOptionsTendencia = this.buildTendenciaChartOptions('Tendencia de Oferta por Mes', meses, series);
      },
      error: () => {
        this.chartOptionsTendencia = this.buildTendenciaChartOptions('Tendencia de Oferta por Mes', [], []);
      }
    });
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

  fetchRanking() {
    this.reportesService.getRankingProductos().subscribe({
      next: (res: any[]) => {
        this.datos = (res || []).filter(
          (d: any) => d && typeof d.producto === 'string' && d.producto.trim() !== '' &&
            typeof d.totalCosechado === 'number' && !isNaN(d.totalCosechado) &&
            typeof d.totalSembrado === 'number' && !isNaN(d.totalSembrado)
        );
        // Sembrado
        this.datosSembrado = [...this.datos].sort((a, b) => b.totalSembrado - a.totalSembrado);
        this.chartOptionsSembrado = this.buildChartOptions('Total Sembrado', this.datosSembrado.map(d => d.producto), this.datosSembrado.map(d => Math.round(d.totalSembrado)));
        // Cosechado
        this.datosCosechado = [...this.datos].sort((a, b) => b.totalCosechado - a.totalCosechado);
        this.chartOptionsCosechado = this.buildChartOptions('Total Cosechado', this.datosCosechado.map(d => d.producto), this.datosCosechado.map(d => Math.round(d.totalCosechado)));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos del ranking de productos.';
        this.loading = false;
      }
    });
  }

  buildChartOptions(name: string, categorias: string[], dataSerie: number[]) {
    const palette = [
      '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
      '#3F51B5', '#546E7A', '#D4526E', '#8D5B4C', '#F86624',
      '#2E294E', '#1B998B', '#E71D36', '#2D87BB', '#662E9B'
    ];
    if (dataSerie.length === 0) {
      categorias = ['Sin datos'];
      dataSerie = [0];
    }
    return {
      series: [{ name, data: dataSerie }],
      chart: { type: 'bar', height: 400, toolbar: { show: true } },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 4
        }
      },
      xaxis: { categories: categorias, title: { text: 'Producto' } },
      yaxis: { title: { text: name } },
      title: { text: 'Ranking de Productos', align: 'center' },
      colors: categorias.map((_: any, i: number) => palette[i % palette.length]),
      dataLabels: { enabled: true, formatter: function(val: number) { return Math.round(val); } },
      tooltip: { y: { formatter: function(val: number) { return Math.round(val); } } }
    };
  }
}
