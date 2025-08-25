
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cultivo {
  _id: string;
  parcela: {
    _id: string;
    nombre: string;
    ciudad: {
      nombre: string;
    };
  };
  producto: {
    _id: string;
    nombre: string;
    caracteristicas?: string;
    tiempo_cosecha?: number;
  };
  usuario: {
    _id: string;
    nombre: string;
    email: string;
  };
}



export interface Cultivo {
  _id: string;
  parcela: {
    _id: string;
    nombre: string;
    ciudad: {
      nombre: string;
    };
  };
  producto: {
    _id: string;
    nombre: string;
    caracteristicas?: string;
    tiempo_cosecha?: number;
  };
  usuario: {
    _id: string;
    nombre: string;
    email: string;
  };
  cantidad_sembrada: number;
  area_sembrada: number;
  unidad_area: 'm2' | 'hectarea';
  fecha_siembra: string;
  estado: 'sembrado' | 'en_crecimiento' | 'listo_cosecha' | 'cosechado' | 'finalizado';
  origen: 'recomendacion' | 'seleccion_manual';
  estimacion_produccion: {
    cantidad_estimada: number;
    unidad: string;
    precio_estimado_por_unidad: number;
    ingresos_estimados: number;
    fecha_cosecha_estimada: string;
    rendimiento_por_area: number;
  };
  condiciones_siembra?: {
    temperatura?: number;
    humedad?: number;
    precipitacion?: number;
    velocidad_viento?: number;
    fecha_registro: string;
  };
  resultado_real?: {
    cantidad_cosechada: number;
    unidad: string;
    precio_venta_real: number;
    ingresos_reales: number;
    fecha_cosecha_real: string;
    costos_produccion: number;
    ganancia_neta: number;
    rendimiento_real: number;
    observaciones: string;
  };
  datos_recomendacion?: {
    score_original: number;
    posicion_en_ranking: number;
    detalles_evaluacion: string[];
    alertas: string[];
  };
  notas: Array<{
    _id?: string;
    fecha: string;
    contenido: string;
    tipo: 'observacion' | 'tratamiento' | 'riego' | 'fertilizacion' | 'alerta' | 'otro';
  }>;
  historial_estados: Array<{
    estado_anterior: string;
    estado_nuevo: string;
    fecha_cambio: string;
    motivo?: string;
  }>;
  dias_desde_siembra?: number;
  dias_hasta_cosecha_estimada?: number;
  progreso_cultivo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrearCultivoRequest {
  parcelaId: string;
  productoId: string;
  cantidad_sembrada: number;
  area_sembrada: number;
  unidad_area?: 'm2' | 'hectarea';
  fecha_siembra?: string;
  datos_recomendacion?: {
    score_original: number;
    posicion_en_ranking: number;
    detalles_evaluacion: string[];
    alertas: string[];
  };
}

export interface RegistrarCosechaRequest {
  cantidad_cosechada: number;
  unidad?: string;
  precio_venta_real: number;
  costos_produccion?: number;
  fecha_cosecha_real?: string;
  observaciones?: string;
}

export interface AgregarNotaRequest {
  contenido: string;
  tipo?: 'observacion' | 'tratamiento' | 'riego' | 'fertilizacion' | 'alerta' | 'otro';
}

export interface AnalisisComparativo {
  cultivo_info: {
    id: string;
    producto: string;
    parcela: string;
    fecha_siembra: string;
    fecha_cosecha_estimada: string;
    fecha_cosecha_real: string;
  };
  comparacion_cantidad: {
    estimada: number;
    real: number;
    diferencia: number;
    porcentaje_variacion: number;
  };
  comparacion_ingresos: {
    estimados: number;
    reales: number;
    diferencia: number;
    porcentaje_variacion: number;
  };
  comparacion_rendimiento: {
    estimado: number;
    real: number;
    diferencia: number;
    porcentaje_variacion: number;
  };
  ganancia_neta: number;
  costos_produccion: number;
  observaciones: string;
}

export interface Producto {
  _id: string;
  nombre: string;
  caracteristicas?: string;
  observaciones?: string;
  temporada?: string;
  tiempo_cosecha?: number;
  temperatura_optima?: number;
  humedad_optima?: number;
  rendimiento_estimado?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CultivoService {
  private apiUrl = `${environment.apiUrl}/cultivos`;

  constructor(private http: HttpClient) {}

  // Calcular estimaciones para predicción en tiempo real
  calcularEstimaciones(datos: any): Observable<any> {
    // Obtener token del localStorage (o de AuthService si tienes uno)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/estimaciones`, datos, { headers });
  }

  // Crear cultivo desde recomendación
  crearCultivoDesdeRecomendacion(datos: CrearCultivoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/desde-recomendacion`, datos);
  }

  // Crear cultivo manual
  crearCultivoManual(datos: CrearCultivoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/manual`, datos);
  }

  // Obtener cultivos del usuario
  getMisCultivos(filtros?: { estado?: string; parcelaId?: string; activos?: boolean }): Observable<any> {
    let params = '';
    if (filtros) {
      const query = new URLSearchParams();
      if (filtros.estado) query.append('estado', filtros.estado);
      if (filtros.parcelaId) query.append('parcelaId', filtros.parcelaId);
      if (filtros.activos !== undefined) query.append('activos', filtros.activos.toString());
      params = query.toString() ? `?${query.toString()}` : '';
    }
    return this.http.get(`${this.apiUrl}/mis-cultivos${params}`);
  }

  // Obtener cultivos de una parcela específica
  getCultivosParcela(parcelaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/parcela/${parcelaId}`);
  }

  // Verificar cultivos activos en parcela
  verificarCultivosActivos(parcelaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/parcela/${parcelaId}/verificar-activos`);
  }

  // Obtener detalle de un cultivo
  getCultivoDetalle(cultivoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle/${cultivoId}`);
  }

  // Obtener productos disponibles
  getProductosDisponibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos-disponibles`);
  }

  // Actualizar estado del cultivo
  actualizarEstado(cultivoId: string, estado: string, motivo?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cultivoId}/estado`, { estado, motivo });
  }

  // Agregar nota al cultivo
  agregarNota(cultivoId: string, nota: AgregarNotaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${cultivoId}/notas`, nota);
  }

  // Registrar cosecha
  registrarCosecha(cultivoId: string, datos: RegistrarCosechaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${cultivoId}/cosecha`, datos);
  }

  // Obtener análisis comparativo
  getAnalisisComparativo(cultivoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${cultivoId}/analisis`);
  }
}
