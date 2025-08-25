
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { CultivoService } from '../cultivos/cultivo.service';
import { ParcelaService } from '../parcelas/parcela.service';

@Component({
  selector: 'app-recomendaciones-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recomendaciones-form.component.html',
  styleUrls: ['./recomendaciones-form.component.css']
})
export class RecomendacionesFormComponent implements OnInit, AfterViewInit {
  estimaciones: any = null;
  estimacionesLoading = false;
  estimacionesError = false;
  ngAfterViewInit() {
    // Suscribirse a cambios del formulario del modal para recalcular estimaciones
    this.formCultivo.valueChanges.subscribe(() => {
      this.calcularEstimaciones();
    });
  }

  calcularEstimaciones() {
    if (!this.productoSeleccionado || !this.formCultivo.valid || !this.parcelaSeleccionada) {
      console.log('[Predicción] Formulario incompleto o sin selección de producto/parcela. No se calculan estimaciones.');
      this.estimaciones = null;
      this.estimacionesError = false;
      return;
    }
    this.estimacionesLoading = true;
    this.estimacionesError = false;
    const datos = {
      productoId: this.productoSeleccionado.producto_id,
      ciudadNombre: this.parcelaSeleccionada.ciudad,
      cantidadSembrada: this.formCultivo.value.cantidad_sembrada,
      areaSembrada: this.formCultivo.value.area_sembrada,
      unidadArea: this.formCultivo.value.unidad_area,
      fechaSiembra: this.formCultivo.value.fecha_siembra
    };
    console.log('[Predicción] Solicitando estimaciones al backend con:', datos);
    this.cultivoService.calcularEstimaciones(datos).subscribe({
      next: (resp) => {
        this.estimaciones = resp?.estimaciones || null;
        this.estimacionesLoading = false;
        this.estimacionesError = false;
        console.log('[Predicción] Estimaciones recibidas:', this.estimaciones);
      },
      error: (err) => {
        this.estimaciones = null;
        this.estimacionesLoading = false;
        this.estimacionesError = true;
        console.error('[Predicción] Error al calcular estimaciones:', err);
      }
    });
    console.log('[Predicción] Esperando respuesta del backend...');
  }
  form: FormGroup;
  resultado: any = null;
  mensaje: string = '';
  parcelas: any[] = [];
  mostrarTodas: boolean = true;
  cargando: boolean = false;
  Math = Math; // Para usar Math.abs en el template

  // Variables para el modal de cultivo
  mostrarModalCultivo: boolean = false;
  productoSeleccionado: any = null;
  parcelaSeleccionada: any = null;
  formCultivo: FormGroup;
  creandoCultivo: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private parcelaService: ParcelaService,
    private cultivoService: CultivoService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      parcela: [''],
      fechaSiembra: [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.formCultivo = this.fb.group({
      cantidad_sembrada: [1, [Validators.required, Validators.min(1)]],
      area_sembrada: [1, [Validators.required, Validators.min(0.1)]],
      unidad_area: ['m2', Validators.required],
      fecha_siembra: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit() {
    this.cargarParcelas();

    // Verificar si hay un parámetro de parcela en la URL
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['parcela']) {
        this.form.patchValue({
          parcela: params['parcela']
        });
      }
    });
  }

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  cargarParcelas() {
    this.parcelaService.obtenerParcelas().subscribe({
      next: (parcelas) => {
        this.parcelas = parcelas;
        if (parcelas.length === 0) {
          this.mensaje = 'No tienes parcelas registradas. Registra una parcela primero para obtener recomendaciones.';
        }
      },
      error: (err) => {
        this.mensaje = 'Error al cargar parcelas';
        console.error('Error cargando parcelas:', err);
      }
    });
  }

  consultar() {
    // Método que puede ser llamado desde el template
    if (this.form.get('parcela')?.value) {
      this.consultarParcela();
    } else {
      this.consultarTodas();
    }
  }

  consultarTodas() {
    this.mostrarTodas = true;
    this.cargando = true;
    this.mensaje = '';
    this.resultado = null;

    const fechaSiembra = this.form.value.fechaSiembra || new Date().toISOString().split('T')[0];

    const payload = {
      fecha_siembra: fechaSiembra
    };

    console.log('Consultando todas las parcelas:', payload);

    this.http.post(`${environment.apiUrl}/recomendaciones`, payload, this.getHeaders()).subscribe({
      next: (res: any) => {
        console.log('Respuesta exitosa:', res);
        this.resultado = res;
        this.mensaje = '';
        this.cargando = false;

        if (res.recomendaciones && res.recomendaciones.length > 0) {
          console.log(`Se encontraron recomendaciones para ${res.recomendaciones.length} parcelas`);
        }
      },
      error: (err) => {
        console.error('Error en la consulta:', err);
        this.mensaje = err.error?.error || err.error?.mensaje || 'Error al consultar recomendaciones';
        this.resultado = null;
        this.cargando = false;
      }
    });
  }

  consultarParcela() {
    if (!this.form.get('parcela')?.value) {
      this.mensaje = 'Selecciona una parcela para consultar';
      return;
    }

    this.mostrarTodas = false;
    this.cargando = true;
    this.mensaje = '';
    this.resultado = null;

    const parcelaId = this.form.value.parcela;
    const fechaSiembra = this.form.value.fechaSiembra || new Date().toISOString().split('T')[0];

    const payload = {
      parcela_id: parcelaId,
      fecha_siembra: fechaSiembra
    };

    console.log('Consultando parcela específica:', payload);

    this.http.post(`${environment.apiUrl}/recomendaciones`, payload, this.getHeaders()).subscribe({
      next: (res: any) => {
        console.log('Respuesta exitosa:', res);
        this.resultado = res;
        this.mensaje = '';
        this.cargando = false;

        if (res.recomendaciones && res.recomendaciones.length > 0) {
          console.log(`Recomendaciones para parcela específica obtenidas`);
        }
      },
      error: (err) => {
        console.error('Error en la consulta:', err);
        this.mensaje = err.error?.error || err.error?.mensaje || 'Error al consultar recomendaciones para la parcela';
        this.resultado = null;
        this.cargando = false;
      }
    });
  }

  // Método auxiliar para obtener el nombre de la parcela
  getNombreParcela(parcelaId: string): string {
    const parcela = this.parcelas.find(p => p._id === parcelaId);
    return parcela ? parcela.nombre : 'Parcela desconocida';
  }

  // Método auxiliar para formatear fechas
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // Abrir modal para sembrar producto recomendado
  sembrarProducto(producto: any, parcela: any) {
    console.log('Producto seleccionado:', producto);
    console.log('Parcela seleccionada:', parcela);
    this.productoSeleccionado = producto;
    this.parcelaSeleccionada = parcela;
    this.mostrarModalCultivo = true;
    this.estimaciones = null;
    this.estimacionesError = false;
    this.estimacionesLoading = false;
    // Pre-llenar el formulario
    this.formCultivo.patchValue({
      fecha_siembra: this.form.value.fechaSiembra || new Date().toISOString().split('T')[0]
    });
    setTimeout(() => this.calcularEstimaciones(), 0);
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModalCultivo = false;
    this.productoSeleccionado = null;
    this.parcelaSeleccionada = null;
    this.formCultivo.reset();
    this.formCultivo.patchValue({
      cantidad_sembrada: 1,
      area_sembrada: 1,
      unidad_area: 'm2',
      fecha_siembra: new Date().toISOString().split('T')[0]
    });
  }

  // Crear cultivo desde recomendación
  crearCultivo() {
    if (!this.formCultivo.valid || !this.productoSeleccionado || !this.parcelaSeleccionada) {
      return;
    }

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para crear un cultivo');
      this.router.navigate(['/login']);
      return;
    }

    this.creandoCultivo = true;

    // Determinar el ID del producto - basado en la estructura del backend
    const productoId = this.productoSeleccionado.producto_id;

    // Determinar el ID de la parcela - basado en la estructura del backend
    const parcelaId = this.parcelaSeleccionada.id;

    const datosCultivo = {
      parcelaId: parcelaId,
      productoId: productoId,
      cantidad_sembrada: this.formCultivo.value.cantidad_sembrada,
      area_sembrada: this.formCultivo.value.area_sembrada,
      unidad_area: this.formCultivo.value.unidad_area,
      fecha_siembra: this.formCultivo.value.fecha_siembra,
      datos_recomendacion: {
        score_original: this.productoSeleccionado.score,
        posicion_en_ranking: this.productoSeleccionado.posicion_ranking,
        detalles_evaluacion: this.productoSeleccionado.detalles_evaluacion,
        alertas: this.productoSeleccionado.alertas
      }
    };

    console.log('Datos del cultivo a crear:', datosCultivo);
    console.log('ProductoId extraído:', productoId);
    console.log('ParcelaId extraído:', parcelaId);
    console.log('Token disponible:', this.authService.getToken());

    // Validar que tenemos los datos necesarios
    if (!parcelaId || !productoId || !datosCultivo.cantidad_sembrada || !datosCultivo.area_sembrada) {
      console.error('Faltan datos requeridos:', {
        parcelaId,
        productoId,
        cantidad_sembrada: datosCultivo.cantidad_sembrada,
        area_sembrada: datosCultivo.area_sembrada
      });
      alert('Faltan datos requeridos para crear el cultivo. Por favor revisa el formulario.');
      this.creandoCultivo = false;
      return;
    }

    this.cultivoService.crearCultivoDesdeRecomendacion(datosCultivo).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.success) {
          this.cerrarModal();
          alert('Cultivo creado exitosamente');
          // Redirigir al detalle del cultivo creado
          this.router.navigate(['/cultivos', response.data._id]);
        }
        this.creandoCultivo = false;
      },
      error: (error) => {
        console.error('Error al crear cultivo:', error);
        this.creandoCultivo = false;
        if (error.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
        } else {
          alert('Error al crear el cultivo: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  // Ir a ver todos los productos disponibles
  verTodosLosProductos(parcela: any) {
    this.router.navigate(['/cultivos/seleccionar-producto'], {
      queryParams: { parcelaId: parcela.id }
    });
  }
}
