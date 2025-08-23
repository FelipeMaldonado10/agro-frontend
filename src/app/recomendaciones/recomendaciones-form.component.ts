
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParcelaService } from '../parcelas/parcela.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-recomendaciones-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recomendaciones-form.component.html',
  styleUrls: ['./recomendaciones-form.component.css']
})
export class RecomendacionesFormComponent implements OnInit {
  form: FormGroup;
  resultado: any = null;
  mensaje: string = '';
  parcelas: any[] = [];
  mostrarTodas: boolean = true;
  cargando: boolean = false;
  Math = Math; // Para usar Math.abs en el template

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private parcelaService: ParcelaService
  ) {
    this.form = this.fb.group({
      parcela: [''],
      fechaSiembra: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit() {
    this.cargarParcelas();
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
}
