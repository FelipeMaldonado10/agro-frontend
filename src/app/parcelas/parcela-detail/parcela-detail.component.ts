import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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


          <h5 class="text-muted">{{parcela.ciudad.nombre}}</h5>


          <div class="card mt-4">
            <div class="card-body">
              <h4 class="card-title">Datos Climáticos</h4>
              <p class="text-muted small">Última actualización: {{ parcela.datosClimaticos.ultima_actualizacion | date:'medium' }}</p>
              
              <div class="row">
                <div class="col-md-6">
                  <h5>Datos Atmosféricos</h5>
                  <ul class="list-unstyled">
                    <li><strong>Temperatura:</strong> {{ parcela.datosClimaticos.temperatura | number:'1.0-1' }}°C</li>
                    <li><strong>Humedad Relativa:</strong> {{ parcela.datosClimaticos.humedad_relativa | number:'1.0-1' }}%</li>
                    <li><strong>Velocidad del Viento:</strong> {{ parcela.datosClimaticos.velocidad_viento_180m | number:'1.0-1' }} m/s</li>
                    <li><strong>Temperatura Aparente:</strong> {{ parcela.datosClimaticos.temperatura_aparente | number:'1.0-1' }}°C</li>
                  </ul>
                </div>
                
                <div class="col-md-6">
                  <h5>Datos del Suelo</h5>
                  <ul class="list-unstyled">
                    <li><strong>Humedad Suelo (0-1cm):</strong> {{ parcela.datosClimaticos.humedad_suelo_0_1cm | number:'1.0-1' }}%</li>
                    <li><strong>Humedad Suelo (1-3cm):</strong> {{ parcela.datosClimaticos.humedad_suelo_1_3cm | number:'1.0-1' }}%</li>
                    <li><strong>Temperatura Suelo (0cm):</strong> {{ parcela.datosClimaticos.temperatura_suelo_0cm | number:'1.0-1' }}°C</li>
                    <li><strong>Temperatura Suelo (6cm):</strong> {{ parcela.datosClimaticos.temperatura_suelo_6cm | number:'1.0-1' }}°C</li>
                  </ul>
                </div>
              </div>


            </div>
          </div>

          <div class="card mt-4">
            <div class="card-body">
              <h4 class="card-title">Ubicación</h4>
              <p><strong>Coordenadas:</strong></p>
              <ul>
                <li>Latitud: {{ parcela.ciudad.coordenadas.latitud }}</li>
                <li>Longitud: {{ parcela.ciudad.coordenadas.longitud }}</li>
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
export class ParcelaDetailComponent implements OnInit, OnDestroy {
  private parcelaSubscription: Subscription | null = null;
  private actualizacionAutomatica: any;
  private readonly INTERVALO_ACTUALIZACION = 300000; // 5 minutos en milisegundos
  parcela: any = null;
  actualizacionEnCurso = false;
  tiempoRestante = 0;

  constructor(
    private parcelaService: ParcelaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.iniciarActualizacionAutomatica();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarParcela(id);
    } else {
      this.router.navigate(['/parcelas']);
    }
  }

  ngOnDestroy() {
    if (this.actualizacionAutomatica) {
      clearInterval(this.actualizacionAutomatica);
    }
    if (this.parcelaSubscription) {
      this.parcelaSubscription.unsubscribe();
    }
  }

  iniciarActualizacionAutomatica() {
    this.actualizacionAutomatica = setInterval(() => {
      if (this.parcela?._id && !this.actualizacionEnCurso) {
        this.actualizarClima();
      }
    }, this.INTERVALO_ACTUALIZACION);
  }

  cargarParcela(id: string) {
    this.parcelaSubscription = this.parcelaService.obtenerParcela(id).subscribe({
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