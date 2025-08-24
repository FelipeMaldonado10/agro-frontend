import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CultivoService, Cultivo } from '../cultivo.service';

@Component({
  selector: 'app-cultivo-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-green-800">Mis Cultivos</h1>
        <div class="flex gap-2">
          <select 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            (change)="filtrarPorEstado($event)"
            [value]="filtroEstado">
            <option value="">Todos los estados</option>
            <option value="sembrado">Sembrado</option>
            <option value="en_crecimiento">En crecimiento</option>
            <option value="listo_cosecha">Listo para cosecha</option>
            <option value="cosechado">Cosechado</option>
            <option value="finalizado">Finalizado</option>
          </select>
          <button 
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            [class.bg-green-800]="soloActivos"
            (click)="toggleSoloActivos()">
            {{ soloActivos ? 'Mostrar todos' : 'Solo activos' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando cultivos...</p>
      </div>

      <div *ngIf="!loading && cultivos.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🌱</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No tienes cultivos registrados</h3>
        <p class="text-gray-500 mb-6">Comienza creando un cultivo desde las recomendaciones o seleccionando un producto manualmente.</p>
        <button 
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          routerLink="/recomendaciones">
          Ver Recomendaciones
        </button>
      </div>

      <div *ngIf="!loading && cultivos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let cultivo of cultivos" 
             class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          
          <!-- Header con estado -->
          <div class="p-4 border-b border-gray-100">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ cultivo.producto.nombre }}</h3>
                <p class="text-sm text-gray-600">{{ cultivo.parcela.nombre }} - {{ cultivo.parcela.ciudad.nombre }}</p>
              </div>
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                [ngClass]="getEstadoClass(cultivo.estado)">
                {{ getEstadoText(cultivo.estado) }}
              </span>
            </div>
          </div>

          <!-- Información del cultivo -->
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Fecha siembra:</span>
                <p class="font-medium">{{ formatDate(cultivo.fecha_siembra) }}</p>
              </div>
              <div>
                <span class="text-gray-500">Área sembrada:</span>
                <p class="font-medium">{{ cultivo.area_sembrada }} {{ cultivo.unidad_area }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Cantidad:</span>
                <p class="font-medium">{{ cultivo.cantidad_sembrada }} unidades</p>
              </div>
              <div>
                <span class="text-gray-500">Origen:</span>
                <p class="font-medium">{{ cultivo.origen === 'recomendacion' ? 'Recomendación' : 'Manual' }}</p>
              </div>
            </div>

            <!-- Progreso del cultivo -->
            <div *ngIf="cultivo.progreso_cultivo !== undefined" class="mt-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso del cultivo</span>
                <span>{{ cultivo.progreso_cultivo }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-500"
                  [style.width.%]="cultivo.progreso_cultivo">
                </div>
              </div>
            </div>

            <!-- Estimación vs realidad (si está cosechado) -->
            <div *ngIf="cultivo.resultado_real" class="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Resultado de cosecha:</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-gray-500">Cosechado:</span>
                  <p class="font-medium">{{ cultivo.resultado_real.cantidad_cosechada }} {{ cultivo.resultado_real.unidad }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Ingresos:</span>
                  <p class="font-medium">\${{ cultivo.resultado_real.ingresos_reales | number:'1.0-0' }}</p>
                </div>
              </div>
            </div>

            <!-- Días restantes para cosecha -->
            <div *ngIf="cultivo.dias_hasta_cosecha_estimada && cultivo.dias_hasta_cosecha_estimada > 0" 
                 class="mt-4 p-3 bg-green-50 rounded-lg">
              <p class="text-sm text-green-700">
                <span class="font-medium">{{ cultivo.dias_hasta_cosecha_estimada }}</span> 
                días restantes para cosecha estimada
              </p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="p-4 border-t border-gray-100 flex gap-2">
            <button 
              class="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              [routerLink]="['/cultivos', cultivo._id]">
              Ver Detalles
            </button>
            
            <button 
              *ngIf="cultivo.estado === 'listo_cosecha'"
              class="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              (click)="irARegistrarCosecha(cultivo._id)">
              Registrar Cosecha
            </button>

            <button 
              *ngIf="cultivo.resultado_real"
              class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              [routerLink]="['/cultivos', cultivo._id, 'analisis']">
              Ver Análisis
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CultivoListComponent implements OnInit {
  cultivos: Cultivo[] = [];
  loading = true;
  filtroEstado = '';
  filtroParcela = '';
  soloActivos = false;

  constructor(
    private cultivoService: CultivoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar si hay un parámetro de parcela en la URL
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['parcela']) {
        this.filtroParcela = params['parcela'];
      }
      this.cargarCultivos();
    });
  }

  cargarCultivos() {
    this.loading = true;
    const filtros: any = {};
    
    if (this.filtroEstado) {
      filtros.estado = this.filtroEstado;
    }
    
    if (this.soloActivos) {
      filtros.activos = true;
    }

    if (this.filtroParcela) {
      filtros.parcela = this.filtroParcela;
    }

    this.cultivoService.getMisCultivos(filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.cultivos = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.loading = false;
      }
    });
  }

  filtrarPorEstado(event: any) {
    this.filtroEstado = event.target.value;
    this.cargarCultivos();
  }

  toggleSoloActivos() {
    this.soloActivos = !this.soloActivos;
    this.cargarCultivos();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  irARegistrarCosecha(cultivoId: string) {
    this.router.navigate(['/cultivos', cultivoId, 'cosecha']);
  }
}
