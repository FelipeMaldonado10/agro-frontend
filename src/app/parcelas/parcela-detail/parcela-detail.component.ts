import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ParcelaService } from '../parcela.service';

@Component({
  selector: 'app-parcela-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="parcela">
      <div class="row">
        <div class="col-md-8">
          <h2>{{ parcela.nombre }}</h2>
          <h5 class="text-muted">{{ parcela.ciudad }}</h5>

          <div class="card mt-4">
            <div class="card-body">
              <h4 class="card-title">Datos Climáticos</h4>
              <p class="text-muted small">Última actualización: {{ parcela.datosClimaticos.ultima_actualizacion | date:'medium' }}</p>
              
              <div class="row">
                <div class="col-md-6">
                  <h5>Datos Atmosféricos</h5>
                  <ul class="list-unstyled">
                    <li><strong>Temperatura:</strong> {{ parcela.datosClimaticos.temperatura | number:'1.0-3' }}°C</li>
                    <li><strong>Humedad Relativa:</strong> {{ parcela.datosClimaticos.humedad_relativa | number:'1.0-3' }}%</li>
                    <li><strong>Temperatura Aparente:</strong> {{ parcela.datosClimaticos.temperatura_aparente | number:'1.0-3' }}°C</li>
                    <li><strong>Lluvia:</strong> {{ parcela.datosClimaticos.lluvia | number:'1.0-3' }} mm</li>
                    <li><strong>Precipitación:</strong> {{ parcela.datosClimaticos.precipitacion | number:'1.0-3' }} mm</li>
                  </ul>
                </div>
                
                <div class="col-md-6">
                  <h5>Datos del Suelo</h5>
                  <ul class="list-unstyled">
                    <li><strong>Humedad Suelo (0-1cm):</strong> {{ parcela.datosClimaticos.humedad_suelo_0_1cm | number:'1.0-3' }}%</li>
                    <li><strong>Humedad Suelo (1-3cm):</strong> {{ parcela.datosClimaticos.humedad_suelo_1_3cm | number:'1.0-3' }}%</li>
                    <li><strong>Temperatura Suelo (0cm):</strong> {{ parcela.datosClimaticos.temperatura_suelo_0cm | number:'1.0-3' }}°C</li>
                    <li><strong>Temperatura Suelo (6cm):</strong> {{ parcela.datosClimaticos.temperatura_suelo_6cm | number:'1.0-3' }}°C</li>
                  </ul>
                </div>
              </div>

              <div class="mt-3">
                <h5>Datos Adicionales</h5>
                <ul class="list-unstyled">
                  <li><strong>Temperatura a 80m:</strong> {{ parcela.datosClimaticos.temperatura_80m | number:'1.0-3' }}°C</li>
                  <li><strong>Velocidad del Viento a 180m:</strong> {{ parcela.datosClimaticos.velocidad_viento_180m | number:'1.0-3' }} m/s</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-body">
              <h4 class="card-title">Ubicación</h4>
              <p><strong>Coordenadas:</strong></p>
              <ul>
                <li>Latitud: {{ parcela.coordenadas.latitud }}</li>
                <li>Longitud: {{ parcela.coordenadas.longitud }}</li>
              </ul>
            </div>
          </div>

          <div class="mt-4">
            <button class="btn btn-primary me-2" (click)="actualizarClima()" [disabled]="actualizacionEnCurso">
              {{ actualizacionEnCurso ? 'Espere ' + tiempoRestante + ' segundos' : 'Actualizar Datos Climáticos' }}
            </button>
            <button class="btn btn-secondary me-2" [routerLink]="['/parcelas/editar', parcela._id]">
              Editar Parcela
            </button>
            <button class="btn btn-danger" (click)="eliminarParcela()">
              Eliminar Parcela
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .list-unstyled li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class ParcelaDetailComponent implements OnInit {
  parcela: any = null;
  actualizacionEnCurso = false;
  tiempoRestante = 0;

  constructor(
    private parcelaService: ParcelaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarParcela(id);
    } else {
      this.router.navigate(['/parcelas']);
    }
  }

  cargarParcela(id: string) {
    this.parcelaService.obtenerParcela(id).subscribe({
      next: (data) => {
        this.parcela = data;
      },
      error: (error) => {
        console.error('Error al cargar la parcela:', error);
        this.router.navigate(['/parcelas']);
      }
    });
  }

  actualizarClima() {
    if (this.parcela?._id && !this.actualizacionEnCurso) {
      this.actualizacionEnCurso = true;
      this.tiempoRestante = 30;

      this.parcelaService.actualizarDatosClimaticos(this.parcela._id).subscribe({
        next: (data) => {
          this.parcela = data;
          this.iniciarTemporizador();
        },
        error: (error) => {
          console.error('Error al actualizar datos climáticos:', error);
          this.actualizacionEnCurso = false;
        }
      });
    }
  }

  iniciarTemporizador() {
    const intervalo = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        clearInterval(intervalo);
        this.actualizacionEnCurso = false;
      }
    }, 1000);
  }

  eliminarParcela() {
    if (this.parcela?._id && confirm('¿Está seguro de eliminar esta parcela?')) {
      this.parcelaService.eliminarParcela(this.parcela._id).subscribe({
        next: () => {
          this.router.navigate(['/parcelas']);
        },
        error: (error) => {
          console.error('Error al eliminar la parcela:', error);
        }
      });
    }
  }
}