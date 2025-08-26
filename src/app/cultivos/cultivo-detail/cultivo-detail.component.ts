import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgregarNotaRequest, Cultivo, CultivoService } from '../cultivo.service';

@Component({
  selector: 'app-cultivo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 max-w-6xl">
      <div *ngIf="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando detalle del cultivo...</p>
      </div>

      <div *ngIf="!loading && cultivo">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-green-800 mb-2">{{ cultivo.producto.nombre }}</h1>
              <p class="text-lg text-gray-600">{{ cultivo.parcela.nombre }} - {{ cultivo.parcela.ciudad.nombre }}</p>
              <p class="text-sm text-gray-500 mt-1">
                Cultivo {{ cultivo.origen === 'recomendacion' ? 'recomendado' : 'manual' }} • 
                Sembrado el {{ formatDate(cultivo.fecha_siembra) }}
              </p>
            </div>
            <div class="text-right">
              <span 
                class="px-4 py-2 text-sm font-medium rounded-full"
                [ngClass]="getEstadoClass(cultivo.estado)">
                {{ getEstadoText(cultivo.estado) }}
              </span>
              <div class="mt-2">
                <button 
                  class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-2"
                  routerLink="/cultivos">
                  ← Volver
                </button>
                <button 
                  *ngIf="cultivo.estado === 'listo_cosecha'"
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  (click)="irARegistrarCosecha()">
                  Registrar Cosecha
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Información principal -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Datos del cultivo -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Información del Cultivo</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-500">Cantidad sembrada</label>
                  <p class="font-medium">{{ cultivo.cantidad_sembrada }} unidades</p>
                </div>
                <div>
                  <label class="text-sm text-gray-500">Área sembrada</label>
                  <p class="font-medium">{{ cultivo.area_sembrada }} {{ cultivo.unidad_area }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-500">Fecha de siembra</label>
                  <p class="font-medium">{{ formatDate(cultivo.fecha_siembra) }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-500">Fecha estimada de cosecha</label>
                  <p class="font-medium">{{ formatDate(cultivo.estimacion_produccion.fecha_cosecha_estimada) }}</p>
                </div>
              </div>

              <!-- Progreso del cultivo -->
              <div *ngIf="cultivo.progreso_cultivo !== undefined" class="mt-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso del cultivo: </span>
                  <span>{{ cultivo.progreso_cultivo }} %</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="bg-green-600 h-3 rounded-full transition-all duration-500"
                    [style.width.%]="cultivo.progreso_cultivo">
                  </div>
                </div>
                <p *ngIf="cultivo.dias_hasta_cosecha_estimada && cultivo.dias_hasta_cosecha_estimada > 0" 
                   class="text-sm text-gray-600 mt-2">
                  {{ cultivo.dias_hasta_cosecha_estimada }} días restantes para cosecha estimada
                </p>
              </div>
            </div>

            <!-- Estimaciones vs Realidad -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Estimaciones de Producción</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Estimaciones -->
                <div class="bg-blue-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-blue-800 mb-3">Estimación Inicial</h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span>Cantidad estimada:</span>
                      <span class="font-medium">{{ cultivo.estimacion_produccion.cantidad_estimada }} {{ cultivo.estimacion_produccion.unidad }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Precio estimado:</span>
                      <span class="font-medium">\${{ cultivo.estimacion_produccion.precio_estimado_por_unidad }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Ingresos estimados:</span>
                      <span class="font-medium">\${{ cultivo.estimacion_produccion.ingresos_estimados | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Rendimiento:</span>
                      <span class="font-medium">{{ cultivo.estimacion_produccion.rendimiento_por_area }} kg/{{ cultivo.unidad_area }}</span>
                    </div>
                  </div>
                </div>

                <!-- Resultados reales -->
                <div *ngIf="cultivo.resultado_real" class="bg-green-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-green-800 mb-3">Resultado Real</h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span>Cantidad cosechada:</span>
                      <span class="font-medium">{{ cultivo.resultado_real.cantidad_cosechada }} {{ cultivo.resultado_real.unidad }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Precio de venta:</span>
                      <span class="font-medium">\${{ cultivo.resultado_real.precio_venta_real }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Ingresos reales:</span>
                      <span class="font-medium">\${{ cultivo.resultado_real.ingresos_reales | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Costos producción:</span>
                      <span class="font-medium">\${{ cultivo.resultado_real.costos_produccion | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 mt-2">
                      <span class="font-semibold">Ganancia neta:</span>
                      <span class="font-bold" [ngClass]="cultivo.resultado_real.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'">
                        \${{ cultivo.resultado_real.ganancia_neta | number:'1.0-0' }}
                      </span>
                    </div>
                  </div>
                  <!-- <button 
                    class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    [routerLink]="['/cultivos', cultivo._id, 'analisis']">
                    Ver Análisis Comparativo
                  </button> -->
                </div>

                <!-- Placeholder para resultado real -->
                <div *ngIf="!cultivo.resultado_real" class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-gray-600 mb-3">Resultado Real</h3>
                  <p class="text-sm text-gray-500 mb-4">Los datos reales aparecerán cuando registres la cosecha.</p>
                  <button 
                    *ngIf="cultivo.estado === 'listo_cosecha'"
                    class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    (click)="irARegistrarCosecha()">
                    Registrar Cosecha
                  </button>
                </div>
              </div>
            </div>

            <!-- Condiciones de siembra -->
            <div *ngIf="cultivo.condiciones_siembra" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Condiciones de Siembra</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div *ngIf="cultivo.condiciones_siembra.temperatura">
                  <span class="text-gray-500">Temperatura</span>
                  <p class="font-medium">{{ cultivo.condiciones_siembra.temperatura }}°C</p>
                </div>
                <div *ngIf="cultivo.condiciones_siembra.humedad">
                  <span class="text-gray-500">Humedad</span>
                  <p class="font-medium">{{ cultivo.condiciones_siembra.humedad }}%</p>
                </div>
                <div *ngIf="cultivo.condiciones_siembra.precipitacion">
                  <span class="text-gray-500">Precipitación</span>
                  <p class="font-medium">{{ cultivo.condiciones_siembra.precipitacion }} mm</p>
                </div>
                <div *ngIf="cultivo.condiciones_siembra.velocidad_viento">
                  <span class="text-gray-500">Viento</span>
                  <p class="font-medium">{{ cultivo.condiciones_siembra.velocidad_viento }} m/s</p>
                </div>
              </div>
            </div>

            <!-- Datos de recomendación -->
            <div *ngIf="cultivo.datos_recomendacion" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Datos de la Recomendación</h2>
              <div class="mb-4">
                <span class="text-sm text-gray-500">Score de recomendación:</span>
                <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {{ cultivo.datos_recomendacion.score_original }}/10 - Posición #{{ cultivo.datos_recomendacion.posicion_en_ranking }}
                </span>
              </div>
              
              <div *ngIf="cultivo.datos_recomendacion?.detalles_evaluacion?.length && cultivo.datos_recomendacion.detalles_evaluacion.length > 0" class="mb-4">
                <h4 class="font-medium text-gray-700 mb-2">Detalles de evaluación:</h4>
                <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li *ngFor="let detalle of cultivo.datos_recomendacion.detalles_evaluacion">{{ detalle }}</li>
                </ul>
              </div>

              <div *ngIf="cultivo.datos_recomendacion?.alertas?.length && cultivo.datos_recomendacion.alertas.length > 0">
                <h4 class="font-medium text-gray-700 mb-2">Alertas:</h4>
                <ul class="list-disc list-inside text-sm text-orange-600 space-y-1">
                  <li *ngFor="let alerta of cultivo.datos_recomendacion.alertas">{{ alerta }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Panel lateral -->
          <div class="space-y-6">
            
            <!-- Cambiar estado -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Gestión del Cultivo</h3>
              
              <div class="mb-4">
                <label class="block text-sm text-gray-500 mb-2">Estado actual:</label>
                <select 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  [value]="cultivo.estado"
                  (change)="cambiarEstado($event)">
                  <option value="sembrado">Sembrado</option>
                  <option value="en_crecimiento">En crecimiento</option>
                  <option value="listo_cosecha">Listo para cosecha</option>
                  <option value="cosechado">Cosechado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div class="mb-4" *ngIf="mostrarMotivoEstado">
                <label class="block text-sm text-gray-500 mb-2">Motivo del cambio:</label>
                <input 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  [(ngModel)]="motivoEstado"
                  placeholder="Opcional">
              </div>

              <button 
                *ngIf="mostrarMotivoEstado"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                (click)="confirmarCambioEstado()">
                Confirmar Cambio
              </button>
            </div>

            <!-- Agregar nota -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Agregar Nota</h3>
              
              <div class="mb-3">
                <select 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  [(ngModel)]="nuevaNota.tipo">
                  <option value="observacion">Observación</option>
                  <option value="tratamiento">Tratamiento</option>
                  <option value="riego">Riego</option>
                  <option value="fertilizacion">Fertilización</option>
                  <option value="alerta">Alerta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div class="mb-3">
                <textarea 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  rows="3"
                  [(ngModel)]="nuevaNota.contenido"
                  placeholder="Escribe tu nota aquí..."></textarea>
              </div>

              <button 
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                (click)="agregarNota()"
                [disabled]="!nuevaNota.contenido.trim()">
                Agregar Nota
              </button>
            </div>

            <!-- Notas existentes -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Notas y Observaciones</h3>
              
              <div *ngIf="cultivo.notas.length === 0" class="text-center py-4 text-gray-500">
                No hay notas registradas
              </div>

              <div *ngFor="let nota of cultivo.notas" class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {{ getTipoNotaText(nota.tipo) }}
                  </span>
                  <span class="text-xs text-gray-500">{{ formatDate(nota.fecha) }}</span>
                </div>
                <p class="text-sm text-gray-700">{{ nota.contenido }}</p>
              </div>
            </div>

            <!-- Historial de estados -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Historial de Estados</h3>
              
              <div *ngFor="let cambio of cultivo.historial_estados" class="mb-3 p-3 bg-gray-50 rounded-lg">
                <div class="text-sm">
                  <span class="font-medium">{{ getEstadoText(cambio.estado_anterior) }}</span>
                  <span class="mx-2">→</span>
                  <span class="font-medium">{{ getEstadoText(cambio.estado_nuevo) }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(cambio.fecha_cambio) }}</div>
                <div *ngIf="cambio.motivo" class="text-xs text-gray-600 mt-1 italic">{{ cambio.motivo }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CultivoDetailComponent implements OnInit {
  cultivo: Cultivo | null = null;
  loading = true;
  mostrarMotivoEstado = false;
  motivoEstado = '';
  nuevoEstado = '';
  
  nuevaNota: AgregarNotaRequest = {
    contenido: '',
    tipo: 'observacion'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cultivoService: CultivoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cargarCultivo(params['id']);
      }
    });
  }

  cargarCultivo(id: string) {
    this.loading = true;
    this.cultivoService.getCultivoDetalle(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.cultivo = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivo:', error);
        this.loading = false;
      }
    });
  }

  cambiarEstado(event: any) {
    const nuevoEstado = event.target.value;
    if (nuevoEstado !== this.cultivo?.estado) {
      this.nuevoEstado = nuevoEstado;
      this.mostrarMotivoEstado = true;
    }
  }

  confirmarCambioEstado() {
    if (!this.cultivo) return;

    this.cultivoService.actualizarEstado(this.cultivo._id, this.nuevoEstado, this.motivoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          this.cultivo = response.data;
          this.mostrarMotivoEstado = false;
          this.motivoEstado = '';
        }
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
      }
    });
  }

  agregarNota() {
    if (!this.cultivo || !this.nuevaNota.contenido.trim()) return;

    this.cultivoService.agregarNota(this.cultivo._id, this.nuevaNota).subscribe({
      next: (response) => {
        if (response.success) {
          this.cultivo = response.data;
          this.nuevaNota = { contenido: '', tipo: 'observacion' };
        }
      },
      error: (error) => {
        console.error('Error al agregar nota:', error);
      }
    });
  }

  irARegistrarCosecha() {
    if (this.cultivo) {
      this.router.navigate(['/cultivos', this.cultivo._id, 'cosecha']);
    }
  }

  getEstadoClass(estado: string): string {
    const classes = {
      'sembrado': 'bg-blue-100 text-blue-800',
      'en_crecimiento': 'bg-yellow-100 text-yellow-800',
      'listo_cosecha': 'bg-orange-100 text-orange-800',
      'cosechado': 'bg-green-100 text-green-800',
      'finalizado': 'bg-gray-100 text-gray-800'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getEstadoText(estado: string): string {
    const texts = {
      'sembrado': 'Sembrado',
      'en_crecimiento': 'En crecimiento',
      'listo_cosecha': 'Listo para cosecha',
      'cosechado': 'Cosechado',
      'finalizado': 'Finalizado'
    };
    return texts[estado as keyof typeof texts] || estado;
  }

  getTipoNotaText(tipo: string): string {
    const texts = {
      'observacion': 'Observación',
      'tratamiento': 'Tratamiento',
      'riego': 'Riego',
      'fertilizacion': 'Fertilización',
      'alerta': 'Alerta',
      'otro': 'Otro'
    };
    return texts[tipo as keyof typeof texts] || tipo;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
