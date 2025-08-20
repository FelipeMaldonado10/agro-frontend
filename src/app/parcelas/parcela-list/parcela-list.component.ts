import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParcelaService } from '../parcela.service';

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
              <h5 class="card-title">{{ parcela.nombre }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">{{ parcela.ciudad }}</h6>
              
              <div class="mt-3">
                <h6>Datos Climáticos Actuales:</h6>
                <ul class="list-unstyled">
                  <li>Temperatura: {{ parcela.datosClimaticos.temperatura }}°C</li>
                  <li>Humedad: {{ parcela.datosClimaticos.humedad_relativa }}%</li>
                  <li>Lluvia: {{ parcela.datosClimaticos.lluvia }} mm</li>
                </ul>
              </div>

              <div class="mt-3">
                <button class="btn btn-sm btn-info me-2" 
                        (click)="actualizarClima(parcela._id)">
                  Actualizar Clima
                </button>
                <button class="btn btn-sm btn-primary me-2" 
                        [routerLink]="['/parcelas', parcela._id]">
                  Ver Detalles
                </button>
                <button class="btn btn-sm btn-danger" 
                        (click)="eliminarParcela(parcela._id)">
                  Eliminar
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
export class ParcelaListComponent implements OnInit {
  parcelas: any[] = [];

  constructor(private parcelaService: ParcelaService) {}

  ngOnInit() {
    this.cargarParcelas();
  }

  cargarParcelas() {
    this.parcelaService.obtenerParcelas().subscribe({
      next: (data) => {
        this.parcelas = data;
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
      }
    });
  }

  actualizarClima(id: string) {
    this.parcelaService.actualizarDatosClimaticos(id).subscribe({
      next: (data) => {
        const index = this.parcelas.findIndex(p => p._id === id);
        if (index !== -1) {
          this.parcelas[index] = data;
        }
      },
      error: (error) => {
        console.error('Error al actualizar clima:', error);
      }
    });
  }

  eliminarParcela(id: string) {
    if (confirm('¿Está seguro de eliminar esta parcela?')) {
      this.parcelaService.eliminarParcela(id).subscribe({
        next: () => {
          this.parcelas = this.parcelas.filter(p => p._id !== id);
        },
        error: (error) => {
          console.error('Error al eliminar parcela:', error);
        }
      });
    }
  }
}