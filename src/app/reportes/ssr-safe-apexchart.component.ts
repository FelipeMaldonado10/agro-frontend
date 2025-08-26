import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    Component,
    EnvironmentInjector,
    Inject,
    Input,
    OnDestroy,
    PLATFORM_ID,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'app-ssr-safe-apexchart',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-template #vc></ng-template>`
})
export class SsrSafeApexChartComponent implements AfterViewInit, OnDestroy {
  @Input() series: any;
  @Input() chart: any;
  @Input() xaxis: any;
  @Input() yaxis: any;
  @Input() labels: any;
  @Input() title: any;
  @Input() style: any;
  @Input() stroke: any;
  @Input() dataLabels: any;
  @Input() tooltip: any;
  @Input() colors: any;
  @Input() plotOptions: any;

  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;

  private isBrowser: boolean;
  private chartRef: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private injector: EnvironmentInjector
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      const { NgApexchartsModule } = await import('ng-apexcharts');
      const { ChartComponent } = await import('ng-apexcharts');
      const compRef = this.vc.createComponent(ChartComponent, {
        environmentInjector: this.injector
      });
  compRef.setInput('series', this.series);
  compRef.setInput('chart', this.chart);
  compRef.setInput('xaxis', this.xaxis);
  compRef.setInput('yaxis', this.yaxis);
  compRef.setInput('labels', this.labels);
  compRef.setInput('title', this.title);
  compRef.setInput('stroke', this.stroke);
  compRef.setInput('dataLabels', this.dataLabels);
  compRef.setInput('tooltip', this.tooltip);
  compRef.setInput('colors', this.colors);
  compRef.setInput('plotOptions', this.plotOptions);
  compRef.location.nativeElement.style = this.style || '';
      this.chartRef = compRef;
    }
  }

  ngOnDestroy() {
    if (this.chartRef) {
      this.chartRef.destroy();
    }
  }
}
