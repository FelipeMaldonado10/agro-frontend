import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParcelaService } from '../parcela.service';
import { CultivoService } from '../../cultivos/cultivo.service';

@Component({
  selector: 'app-parcela-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Parcelas</h2>
        <button class="btn btn-primary" routerLink="/parcelas/crear">Nueva Parcela</button>
      </div>

      <div class="row">
        <div class="col-md-4 mb-4" *ngFor="let parcela of parcelas">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">{{ parcela.nombre }}</h4>
              <h6 class="card-subtitle mb-2 text-muted">{{ parcela.ciudad.nombre }}</h6>
              
              <!-- Estado del cultivo -->
              <div class="mt-2 mb-3">
                <div class="alert alert-success" *ngIf="(cultivosPorParcela[parcela._id] || []).length > 0">
                  <strong>Cultivos Activos:</strong>
                  <ul class="mb-0 mt-1">
                    <li *ngFor="let cultivo of cultivosPorParcela[parcela._id]">
                      {{ cultivo.producto.nombre }} - {{ getEstadoTexto(cultivo.estado) }}
                    </li>
                  </ul>
                </div>
                <div class="alert alert-info" *ngIf="(cultivosPorParcela[parcela._id] || []).length === 0">
                  Sin cultivos activos
                </div>
              </div>

              <div class="mt-3">
                <h6>Datos Climáticos Actuales:</h6>
                <ul class="list-unstyled">
                  <li>Temperatura: {{ parcela.datosClimaticos.temperatura | number:'1.0-1' }}°C</li>
                  <li>Humedad: {{ parcela.datosClimaticos.humedad_relativa | number:'1.0-1' }}%</li>
                  <li>Velocidad del viento: {{ parcela.datosClimaticos.velocidad_viento_180m | number:'1.0-1' }} m/s</li>
                </ul>
              </div>

              <div class="mt-3">
                <button class="btn btn-sm btn-info me-2" 
                        (click)="actualizarClima(parcela._id)"
                        [disabled]="actualizacionesEnCurso[parcela._id]">
                  {{ obtenerTextoBotonActualizar(parcela._id) }}
                </button>
                
                <button class="btn btn-sm btn-primary me-2" 
                        [routerLink]="['/parcelas', parcela._id]">
                  Ver Detalles
                </button>
                
                <!-- Botón para ver cultivos si tiene cultivos activos -->
                <button class="btn btn-sm btn-success me-2" 
                        *ngIf="(cultivosPorParcela[parcela._id] || []).length > 0"
                        [routerLink]="['/cultivos']"
                        [queryParams]="{parcela: parcela._id}">
                  Ver Cultivos
                </button>
                
                <!-- Botón para solicitar recomendaciones si no tiene cultivos activos -->
                <button class="btn btn-sm btn-warning me-2" 
                        *ngIf="(cultivosPorParcela[parcela._id] || []).length === 0"
                        [routerLink]="['/recomendaciones']"
                        [queryParams]="{parcela: parcela._id}">
                  Solicitar Recomendación
                </button>
                
                <br><br>
                <button class="btn btn-sm btn-danger" 
                        (click)="eliminarParcela(parcela._id)"
                        [disabled]="(cultivosPorParcela[parcela._id] || []).length > 0">
                  {{ (cultivosPorParcela[parcela._id] || []).length > 0 ? 'No se puede eliminar (tiene cultivos activos)' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class ParcelaListComponent implements OnInit, OnDestroy {
  private parcelasSubscription: Subscription | null = null;
  actualizacionesEnCurso: { [key: string]: boolean } = {};
  tiemposRestantes: { [key: string]: number } = {};
  parcelas: any[] = [];
  cultivosPorParcela: { [key: string]: any[] } = {};

  constructor(
    private parcelaService: ParcelaService,
    private cultivoService: CultivoService
  ) {}

  ngOnInit() {
    this.cargarParcelas();
  }

  ngOnDestroy() {
    if (this.parcelasSubscription) {
      this.parcelasSubscription.unsubscribe();
    }
  }

  cargarParcelas() {
    this.parcelasSubscription = this.parcelaService.parcelas$.subscribe({
      next: (data) => {
        this.parcelas = data;
        this.cargarCultivos();
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
      }
    });
  }

  cargarCultivos() {
    this.parcelas.forEach(parcela => {
      console.log(`Cargando cultivos para parcela: ${parcela._id} - ${parcela.nombre}`);
      
      this.cultivoService.getCultivosParcela(parcela._id).subscribe({
        next: (response: any) => {
          console.log(`Respuesta cultivos para ${parcela.nombre}:`, response);
          
          // Verificar si la respuesta tiene el formato correcto
          let cultivos = [];
          if (response && response.success && response.data) {
            cultivos = response.data;
          } else if (Array.isArray(response)) {
            cultivos = response;
          } else {
            console.warn('Formato de respuesta inesperado:', response);
          }
          
          // Filtrar cultivos activos con los estados correctos del backend
          const cultivosActivos = cultivos.filter((c: any) => 
            ['sembrado', 'en_crecimiento', 'listo_cosecha'].includes(c.estado)
          );
          
          this.cultivosPorParcela[parcela._id] = cultivosActivos;
          
          console.log(`Cultivos activos para ${parcela.nombre}:`, cultivosActivos.length);
          if (cultivosActivos.length > 0) {
            console.log('Estados encontrados:', cultivosActivos.map((c: any) => c.estado));
          }
        },
        error: (error: any) => {
          console.error(`Error al cargar cultivos para ${parcela.nombre}:`, error);
          this.cultivosPorParcela[parcela._id] = [];
        }
      });
    });
  }

  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'sembrado': 'Sembrado',
      'en_crecimiento': 'En Crecimiento',
      'listo_cosecha': 'Listo para Cosecha',
      'cosechado': 'Cosechado',
      'finalizado': 'Finalizado'
    };
    return estados[estado] || estado;
  }

  actualizarClima(id: string) {
    if (this.actualizacionesEnCurso[id]) {
      return;
    }

    this.actualizacionesEnCurso[id] = true;
    this.tiemposRestantes[id] = 30;
    this.parcelaService.actualizarDatosClimaticos(id).subscribe({
      next: (data) => {
        const index = this.parcelas.findIndex(p => p._id === id);
        if (index !== -1) {
          this.parcelas[index] = data;
          this.iniciarTemporizador(id);
        }
      },
      error: (error) => {
        console.error('Error al actualizar clima:', error);
        this.actualizacionesEnCurso[id] = false;
      }
    });
  }

  iniciarTemporizador(id: string) {
    const intervalo = setInterval(() => {
      if (this.tiemposRestantes[id] > 0) {
        this.tiemposRestantes[id]--;
      } else {
        clearInterval(intervalo);
        this.actualizacionesEnCurso[id] = false;
      }
    }, 1000);
  }

  obtenerTextoBotonActualizar(id: string): string {
    return this.actualizacionesEnCurso[id] 
      ? `Espere ${this.tiemposRestantes[id]} segundos` 
      : 'Actualizar Clima';
  }

  eliminarParcela(id: string) {
    const cultivosActivos = this.cultivosPorParcela[id] || [];
    
    if (cultivosActivos.length > 0) {
      alert('No se puede eliminar la parcela porque tiene cultivos activos.');
      return;
    }

    if (confirm('¿Está seguro de eliminar esta parcela?')) {
      this.parcelaService.eliminarParcela(id).subscribe({
        next: () => {
          this.parcelas = this.parcelas.filter(p => p._id !== id);
          delete this.cultivosPorParcela[id];
        },
        error: (error: any) => {
          console.error('Error al eliminar parcela:', error);
        }
      });
    }
  }
}