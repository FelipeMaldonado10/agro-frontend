import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CultivoService, Cultivo, RegistrarCosechaRequest } from '../cultivo.service';

@Component({
  selector: 'app-registrar-cosecha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto p-6 max-w-4xl">
      <div *ngIf="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando información del cultivo...</p>
      </div>

      <div *ngIf="!loading && cultivo">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-green-800 mb-2">Registrar Cosecha</h1>
              <p class="text-lg text-gray-600">{{ cultivo.producto.nombre }} - {{ cultivo.parcela.nombre }}</p>
              <p class="text-sm text-gray-500">{{ cultivo.parcela.ciudad.nombre }}</p>
            </div>
            <button 
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              [routerLink]="['/cultivos', cultivo._id]">
              ← Cancelar
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Formulario de cosecha -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">Datos de la Cosecha</h2>
            
            <form (ngSubmit)="registrarCosecha()" #cosechaForm="ngForm">
              <div class="space-y-4">
                
                <!-- Cantidad cosechada -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad cosechada *
                  </label>
                  <div class="flex gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      [(ngModel)]="datosCosecha.cantidad_cosechada"
                      name="cantidad_cosechada"
                      required
                      placeholder="0.00">
                    <select 
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      [(ngModel)]="datosCosecha.unidad"
                      name="unidad">
                      <option value="kg">kg</option>
                      <option value="toneladas">toneladas</option>
                      <option value="bultos">bultos</option>
                      <option value="cajas">cajas</option>
                      <option value="unidades">unidades</option>
                    </select>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Estimación inicial: {{ cultivo.estimacion_produccion.cantidad_estimada }} {{ cultivo.estimacion_produccion.unidad }}
                  </p>
                </div>

                <!-- Precio de venta -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Precio de venta por unidad *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      [(ngModel)]="datosCosecha.precio_venta_real"
                      name="precio_venta_real"
                      required
                      placeholder="0.00">
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Precio estimado: \${{ cultivo.estimacion_produccion.precio_estimado_por_unidad }}
                  </p>
                </div>

                <!-- Costos de producción -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Costos de producción
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      [(ngModel)]="datosCosecha.costos_produccion"
                      name="costos_produccion"
                      placeholder="0.00">
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Incluye semillas, fertilizantes, mano de obra, etc.
                  </p>
                </div>

                <!-- Fecha de cosecha -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de cosecha
                  </label>
                  <input 
                    type="date" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    [(ngModel)]="datosCosecha.fecha_cosecha_real"
                    name="fecha_cosecha_real">
                  <p class="text-xs text-gray-500 mt-1">
                    Fecha estimada: {{ formatDate(cultivo.estimacion_produccion.fecha_cosecha_estimada) }}
                  </p>
                </div>

                <!-- Observaciones -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="4"
                    [(ngModel)]="datosCosecha.observaciones"
                    name="observaciones"
                    placeholder="Observaciones sobre la cosecha, calidad del producto, problemas encontrados, etc."></textarea>
                </div>

                <!-- Botones -->
                <div class="flex gap-3 pt-4">
                  <button 
                    type="submit"
                    class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    [disabled]="!cosechaForm.valid || registrandoCosecha">
                    <span *ngIf="!registrandoCosecha">Registrar Cosecha</span>
                    <span *ngIf="registrandoCosecha" class="flex items-center justify-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  </button>
                  <button 
                    type="button"
                    class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    [routerLink]="['/cultivos', cultivo._id]">
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Resumen y estimaciones -->
          <div class="space-y-6">
            
            <!-- Información del cultivo -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Información del Cultivo</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Fecha de siembra:</span>
                  <span class="font-medium">{{ formatDate(cultivo.fecha_siembra) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Días desde siembra:</span>
                  <span class="font-medium">{{ cultivo.dias_desde_siembra }} días</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Cantidad sembrada:</span>
                  <span class="font-medium">{{ cultivo.cantidad_sembrada }} unidades</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Área sembrada:</span>
                  <span class="font-medium">{{ cultivo.area_sembrada }} {{ cultivo.unidad_area }}</span>
                </div>
              </div>
            </div>

            <!-- Estimaciones vs actual -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Comparación con Estimaciones</h3>
              
              <!-- Cantidad -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-700 mb-2">Cantidad</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Estimada:</span>
                    <span>{{ cultivo.estimacion_produccion.cantidad_estimada }} {{ cultivo.estimacion_produccion.unidad }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Real:</span>
                    <span class="font-medium">{{ datosCosecha.cantidad_cosechada || 0 }} {{ datosCosecha.unidad }}</span>
                  </div>
                  <div *ngIf="datosCosecha.cantidad_cosechada" class="flex justify-between pt-1 border-t">
                    <span class="text-gray-500">Diferencia:</span>
                    <span [ngClass]="getDiferenciaClass(datosCosecha.cantidad_cosechada - cultivo.estimacion_produccion.cantidad_estimada)">
                      {{ getDiferenciaTexto(datosCosecha.cantidad_cosechada - cultivo.estimacion_produccion.cantidad_estimada) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Ingresos -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-700 mb-2">Ingresos</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Estimados:</span>
                    <span>\${{ cultivo.estimacion_produccion.ingresos_estimados | number:'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Reales:</span>
                    <span class="font-medium">\${{ calcularIngresosReales() | number:'1.0-0' }}</span>
                  </div>
                  <div *ngIf="datosCosecha.cantidad_cosechada && datosCosecha.precio_venta_real" class="flex justify-between pt-1 border-t">
                    <span class="text-gray-500">Diferencia:</span>
                    <span [ngClass]="getDiferenciaClass(calcularIngresosReales() - cultivo.estimacion_produccion.ingresos_estimados)">
                      {{ getDiferenciaTexto(calcularIngresosReales() - cultivo.estimacion_produccion.ingresos_estimados, true) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Ganancia neta -->
              <div *ngIf="datosCosecha.cantidad_cosechada && datosCosecha.precio_venta_real" 
                   class="p-3 bg-green-50 rounded-lg">
                <h4 class="font-medium text-gray-700 mb-2">Ganancia Neta Proyectada</h4>
                <div class="text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Ingresos:</span>
                    <span>\${{ calcularIngresosReales() | number:'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Costos:</span>
                    <span>\${{ datosCosecha.costos_produccion || 0 | number:'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t font-semibold">
                    <span>Ganancia:</span>
                    <span [ngClass]="calcularGananciaNeta() >= 0 ? 'text-green-600' : 'text-red-600'">
                      \${{ calcularGananciaNeta() | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegistrarCosechaComponent implements OnInit {
  cultivo: Cultivo | null = null;
  loading = true;
  registrandoCosecha = false;

  datosCosecha: RegistrarCosechaRequest = {
    cantidad_cosechada: 0,
    unidad: 'kg',
    precio_venta_real: 0,
    costos_produccion: 0,
    fecha_cosecha_real: '',
    observaciones: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cultivoService: CultivoService
  ) {
    // Establecer fecha actual por defecto
    const today = new Date();
    this.datosCosecha.fecha_cosecha_real = today.toISOString().split('T')[0];
  }

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
          // Pre-llenar con estimaciones
          if (this.cultivo?.estimacion_produccion) {
            this.datosCosecha.cantidad_cosechada = this.cultivo.estimacion_produccion.cantidad_estimada;
            this.datosCosecha.unidad = this.cultivo.estimacion_produccion.unidad;
            this.datosCosecha.precio_venta_real = this.cultivo.estimacion_produccion.precio_estimado_por_unidad;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivo:', error);
        this.loading = false;
      }
    });
  }

  registrarCosecha() {
    if (!this.cultivo) return;

    this.registrandoCosecha = true;
    
    const datosLimpios = {
      ...this.datosCosecha,
      costos_produccion: this.datosCosecha.costos_produccion || 0
    };

    this.cultivoService.registrarCosecha(this.cultivo._id, datosLimpios).subscribe({
      next: (response) => {
        if (response.success) {
          // Redirigir al detalle del cultivo
          this.router.navigate(['/cultivos', this.cultivo!._id]);
        }
        this.registrandoCosecha = false;
      },
      error: (error) => {
        console.error('Error al registrar cosecha:', error);
        this.registrandoCosecha = false;
      }
    });
  }

  calcularIngresosReales(): number {
    return (this.datosCosecha.cantidad_cosechada || 0) * (this.datosCosecha.precio_venta_real || 0);
  }

  calcularGananciaNeta(): number {
    return this.calcularIngresosReales() - (this.datosCosecha.costos_produccion || 0);
  }

  getDiferenciaClass(diferencia: number): string {
    if (diferencia > 0) return 'text-green-600 font-medium';
    if (diferencia < 0) return 'text-red-600 font-medium';
    return 'text-gray-600';
  }

  getDiferenciaTexto(diferencia: number, esDinero: boolean = false): string {
    const signo = diferencia > 0 ? '+' : '';
    const valor = esDinero ? `$${Math.abs(diferencia).toLocaleString()}` : Math.abs(diferencia).toString();
    return diferencia === 0 ? 'Sin diferencia' : `${signo}${diferencia > 0 ? valor : '-' + valor}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
