import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ParcelaService } from '../../parcelas/parcela.service';
import { CultivoService, Producto } from '../cultivo.service';

@Component({
  selector: 'app-seleccionar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mx-auto p-6 max-w-6xl">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-green-800 mb-2">Seleccionar Producto para Cultivo</h1>
            <p class="text-lg text-gray-600" *ngIf="parcelaInfo">
              {{ parcelaInfo.nombre }} - {{ parcelaInfo.ciudad?.nombre }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              [routerLink]="['/recomendaciones']">
              ← Volver a Recomendaciones
            </button>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              [routerLink]="['/cultivos']">
              Ver Mis Cultivos
            </button>
          </div>
        </div>
      </div>

      <!-- Selector de Parcela -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6" *ngIf="!parcelaId || !parcelaInfo">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Selecciona una Parcela</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let parcela of parcelas"
               class="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               [class.border-green-500]="parcelaId === parcela._id"
               [class.bg-green-50]="parcelaId === parcela._id"
               (click)="seleccionarParcela(parcela)">
            <h3 class="font-semibold text-gray-800">{{ parcela.nombre }}</h3>
            <p class="text-sm text-gray-600">{{ parcela.ciudad?.nombre }}</p>
            <p class="text-xs text-gray-500">{{ parcela.area_total }} {{ parcela.unidad_area }}</p>
          </div>
        </div>
        <div *ngIf="parcelas.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-4">No tienes parcelas registradas</p>
          <button
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            [routerLink]="['/parcelas/crear']">
            Crear Nueva Parcela
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando productos disponibles...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Filtrar Productos</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar por nombre</label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                [(ngModel)]="filtroNombre"
                placeholder="Nombre del producto..."
                (input)="filtrarProductos()">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Temporada</label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                [(ngModel)]="filtroTemporada"
                (change)="filtrarProductos()">
                <option value="">Todas las temporadas</option>
                <option *ngFor="let temporada of temporadasDisponibles" [value]="temporada">{{ temporada }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo de cosecha</label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                [(ngModel)]="filtroTiempoCosecha"
                (change)="filtrarProductos()">
                <option value="">Cualquier tiempo</option>
                <option value="rapido">Rápido (≤ 60 días)</option>
                <option value="medio">Medio (61-120 días)</option>
                <option value="largo">Largo (> 120 días)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Lista de productos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let producto of productosFiltrados"
               class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">

            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-semibold text-gray-900">{{ producto.nombre }}</h3>
                <span *ngIf="producto.temporada"
                      class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {{ producto.temporada }}
                </span>
              </div>

              <div class="space-y-3 text-sm">
                <div *ngIf="producto.tiempo_cosecha">
                  <span class="text-gray-500">Tiempo de cosecha:</span>
                  <p class="font-medium">{{ producto.tiempo_cosecha }} días</p>
                </div>

                <div class="grid grid-cols-2 gap-4" *ngIf="producto.temperatura_optima || producto.humedad_optima">
                  <div *ngIf="producto.temperatura_optima">
                    <span class="text-gray-500">Temp. óptima:</span>
                    <p class="font-medium">{{ producto.temperatura_optima }}°C</p>
                  </div>
                  <div *ngIf="producto.humedad_optima">
                    <span class="text-gray-500">Humedad óptima:</span>
                    <p class="font-medium">{{ producto.humedad_optima }}%</p>
                  </div>
                </div>

                <div *ngIf="producto.caracteristicas">
                  <span class="text-gray-500">Características:</span>
                  <p class="text-gray-700 text-sm mt-1">{{ producto.caracteristicas }}</p>
                </div>

                <div *ngIf="producto.observaciones">
                  <span class="text-gray-500">Observaciones:</span>
                  <p class="text-gray-700 text-sm mt-1">{{ producto.observaciones }}</p>
                </div>
              </div>

              <button
                class="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                (click)="seleccionarProducto(producto)"
                type="button">
                🌱 Cultivar: {{producto.nombre}}
              </button>

              <!-- Botón de prueba adicional -->
              <!-- <button
                class="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                (click)="testClick(producto.nombre)"
                type="button">
                🧪 Test Click
              </button> -->
            </div>
          </div>
        </div>

        <div *ngIf="productosFiltrados.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
          <p class="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
          <button
            class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            (click)="limpiarFiltros()">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Modal para crear cultivo manual -->
      <div *ngIf="mostrarModal && productoSeleccionado" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-800">Crear Cultivo Manual</h2>
            <p class="text-gray-600 mt-1">{{ productoSeleccionado.nombre }}</p>
          </div>

          <div class="p-6">
            <form [formGroup]="formCultivo">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad a sembrar *
                  </label>
                  <input
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    formControlName="cantidad_sembrada"
                    min="1"
                    step="1">
                  <p class="text-xs text-gray-500 mt-1">Número de plantas, semillas o unidades</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Área de siembra *
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="number"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      formControlName="area_sembrada"
                      min="0.1"
                      step="0.1">
                    <select
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      formControlName="unidad_area">
                      <option value="m2">m²</option>
                      <option value="hectarea">hectárea</option>
                    </select>
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de siembra
                  </label>
                  <input
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    formControlName="fecha_siembra">
                </div>
              </div>

              <!-- Información del producto seleccionado -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold text-gray-800 mb-3">Información del Producto</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div *ngIf="productoSeleccionado.tiempo_cosecha">
                    <span class="text-gray-500">Tiempo de cosecha:</span>
                    <p class="font-medium">{{ productoSeleccionado.tiempo_cosecha }} días</p>
                  </div>
                  <div *ngIf="productoSeleccionado.temporada">
                    <span class="text-gray-500">Temporada:</span>
                    <p class="font-medium">{{ productoSeleccionado.temporada }}</p>
                  </div>
                  <div *ngIf="productoSeleccionado.temperatura_optima">
                    <span class="text-gray-500">Temperatura óptima:</span>
                    <p class="font-medium">{{ productoSeleccionado.temperatura_optima }}°C</p>
                  </div>
                  <div *ngIf="productoSeleccionado.humedad_optima">
                    <span class="text-gray-500">Humedad óptima:</span>
                    <p class="font-medium">{{ productoSeleccionado.humedad_optima }}%</p>
                  </div>
                </div>
              </div>

              <!-- Estimaciones automáticas -->
              <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">📊 Estimaciones Automáticas</h4>
                <p class="text-sm text-blue-700">
                  Una vez creado el cultivo, el sistema calculará automáticamente:
                </p>
                <ul class="text-sm text-blue-700 mt-2 list-disc list-inside">
                  <li>Cantidad estimada de producción</li>
                  <li>Ingresos proyectados basados en precios históricos</li>
                  <li>Fecha estimada de cosecha</li>
                  <li>Rendimiento esperado por área</li>
                </ul>
              </div>
            </form>
          </div>

          <div class="p-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              class="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              (click)="cerrarModal()"
              [disabled]="creandoCultivo">
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              (click)="crearCultivoManual()"
              [disabled]="!formCultivo.valid || creandoCultivo">
              <span *ngIf="!creandoCultivo">🌱 Crear Cultivo</span>
              <span *ngIf="creandoCultivo" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </span>
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
    .max-h-90vh {
      max-height: 90vh;
    }
  `]
})
export class SeleccionarProductoComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = true;

  // Filtros
  filtroNombre = '';
  filtroTemporada = '';
  filtroTiempoCosecha = '';
  temporadasDisponibles: string[] = [];

  // Modal
  mostrarModal = false;
  productoSeleccionado: Producto | null = null;
  creandoCultivo = false;

  // Formulario
  formCultivo: FormGroup;

  // Parcela
  parcelaId: string | null = null;
  parcelaInfo: any = null;
  parcelas: any[] = []; // Lista de parcelas del usuario

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cultivoService: CultivoService,
    private parcelaService: ParcelaService,
    private fb: FormBuilder
  ) {
    this.formCultivo = this.fb.group({
      cantidad_sembrada: [1, [Validators.required, Validators.min(1)]],
      area_sembrada: [1, [Validators.required, Validators.min(0.1)]],
      unidad_area: ['m2', Validators.required],
      fecha_siembra: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit() {
    console.log('SeleccionarProductoComponent iniciado');

    // Cargar parcelas del usuario
    this.cargarParcelas();

    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      console.log('Parámetros de la URL:', params);
      this.parcelaId = params['parcelaId'] || null;
      console.log('Parcela ID extraído:', this.parcelaId);
      if (this.parcelaId) {
        this.cargarInfoParcela();
      } else {
        console.warn('No se encontró parcelaId en los parámetros de la URL');
      }
    });

    this.cargarProductos();
  }

  cargarParcelas() {
    this.parcelaService.obtenerParcelas().subscribe({
      next: (parcelas) => {
        this.parcelas = parcelas;
        console.log('Parcelas del usuario cargadas:', this.parcelas.length);
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
      }
    });
  }

  seleccionarParcela(parcela: any) {
    console.log('Parcela seleccionada:', parcela);
    this.parcelaId = parcela._id;
    this.parcelaInfo = parcela;
    // Actualizar la URL con el parámetro de parcela
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { parcelaId: this.parcelaId },
      queryParamsHandling: 'merge'
    });
  }

  cargarInfoParcela() {
    if (!this.parcelaId) return;

    console.log('=== CARGANDO INFO PARCELA ===');
    console.log('Parcela ID a cargar:', this.parcelaId);
    console.log('URL que se va a llamar:', `api/parcelas/${this.parcelaId}`);

    this.parcelaService.obtenerParcela(this.parcelaId).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa del servidor:', response);
        if (response.success) {
          this.parcelaInfo = response.parcela;
        } else {
          // Si la respuesta no tiene el formato esperado, usar la respuesta directamente
          this.parcelaInfo = response;
        }
        console.log('Información de parcela cargada:', this.parcelaInfo);
      },
      error: (error) => {
        console.error('Error al cargar información de la parcela:', error);
        console.error('Status del error:', error.status);
        console.error('Mensaje del error:', error.message);
        console.error('Respuesta completa del error:', error.error);

        // Si es error 400 o 404, la parcela no existe o no pertenece al usuario
        if (error.status === 400 || error.status === 404) {
          alert(`Error: La parcela no existe o no tienes acceso a ella.\nID: ${this.parcelaId}\nPor favor, selecciona una parcela válida.`);
        }
      }
    });
  }

  cargarProductos() {
    this.loading = true;
    console.log('Iniciando carga de productos...');

    this.cultivoService.getProductosDisponibles().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor para productos:', response);

        if (response.success) {
          this.productos = response.data;
          this.productosFiltrados = [...this.productos];
          console.log('Productos cargados:', this.productos.length);
          console.log('Primeros productos:', this.productos.slice(0, 3));
          this.extraerTemporadas();
        } else {
          console.error('Respuesta no exitosa:', response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        console.error('Status del error:', error.status);
        console.error('Mensaje del error:', error.message);
        this.loading = false;
      }
    });
  }

  extraerTemporadas() {
    console.log('Extrayendo temporadas de productos:', this.productos.length);
    const temporadas = new Set<string>();
    this.productos.forEach(producto => {
      if (producto.temporada) {
        temporadas.add(producto.temporada);
      }
    });
    this.temporadasDisponibles = Array.from(temporadas).sort();
    console.log('Temporadas disponibles:', this.temporadasDisponibles);
  }

  filtrarProductos() {
    this.productosFiltrados = this.productos.filter(producto => {
      // Filtro por nombre
      const coincideNombre = this.filtroNombre === '' ||
        producto.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      // Filtro por temporada
      const coincideTemporada = this.filtroTemporada === '' ||
        producto.temporada === this.filtroTemporada;

      // Filtro por tiempo de cosecha
      let coincideTiempo = true;
      if (this.filtroTiempoCosecha && producto.tiempo_cosecha) {
        switch (this.filtroTiempoCosecha) {
          case 'rapido':
            coincideTiempo = producto.tiempo_cosecha <= 60;
            break;
          case 'medio':
            coincideTiempo = producto.tiempo_cosecha > 60 && producto.tiempo_cosecha <= 120;
            break;
          case 'largo':
            coincideTiempo = producto.tiempo_cosecha > 120;
            break;
        }
      }

      return coincideNombre && coincideTemporada && coincideTiempo;
    });
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroTemporada = '';
    this.filtroTiempoCosecha = '';
    this.productosFiltrados = [...this.productos];
  }

  seleccionarProducto(producto: Producto) {
    // Test básico para ver si el método se ejecuta
    console.log('=== MÉTODO SELECCIONAR PRODUCTO EJECUTADO ===');
    console.log('Producto:', producto);
    console.log('Producto ID:', producto._id);
    console.log('Parcela ID:', this.parcelaId);

    // Alert para confirmar que se ejecuta
    alert(`Seleccionando ${producto.nombre}\nDeslize hasta el fondo de la pagina para continuar.`);

    this.productoSeleccionado = producto;
    this.mostrarModal = true;

    console.log('Modal estado:', this.mostrarModal);
    console.log('Producto seleccionado:', this.productoSeleccionado);
  }

  testClick(nombreProducto: string) {
    alert(`Test button clicked for ${nombreProducto}`);
    console.log('Test click ejecutado para:', nombreProducto);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
    this.formCultivo.reset();
    this.formCultivo.patchValue({
      cantidad_sembrada: 1,
      area_sembrada: 1,
      unidad_area: 'm2',
      fecha_siembra: new Date().toISOString().split('T')[0]
    });
  }

  crearCultivoManual() {
    console.log('crearCultivoManual() llamado');
    console.log('Formulario válido:', this.formCultivo.valid);
    console.log('Producto seleccionado:', this.productoSeleccionado);
    console.log('Parcela ID:', this.parcelaId);

    if (!this.formCultivo.valid || !this.productoSeleccionado) {
      console.log('Validación fallida - formulario inválido o producto no seleccionado');
      return;
    }

    // Si no hay parcela seleccionada, redirigir a seleccionar parcela
    if (!this.parcelaId) {
      console.log('No hay parcela seleccionada');
      // Aquí podrías implementar un selector de parcela o redirigir
      alert('Debe seleccionar una parcela primero');
      return;
    }

    this.creandoCultivo = true;

    const datosCultivo = {
      parcelaId: this.parcelaId,
      productoId: this.productoSeleccionado._id,
      cantidad_sembrada: this.formCultivo.value.cantidad_sembrada,
      area_sembrada: this.formCultivo.value.area_sembrada,
      unidad_area: this.formCultivo.value.unidad_area,
      fecha_siembra: this.formCultivo.value.fecha_siembra
    };

    console.log('Datos del cultivo a enviar:', datosCultivo);

    this.cultivoService.crearCultivoManual(datosCultivo).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.success) {
          console.log('Cultivo creado exitosamente');
          this.cerrarModal();
          // Redirigir al detalle del cultivo creado
          this.router.navigate(['/cultivos', response.data._id]);
        }
        this.creandoCultivo = false;
      },
      error: (error) => {
        console.error('Error al crear cultivo:', error);
        alert(`Error al crear cultivo: ${error.error?.message || error.message}`);
        this.creandoCultivo = false;
      }
    });
  }
}
