import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParcelaService implements OnDestroy {
  private actualizacionAutomatica: Subscription | null = null;
  private readonly INTERVALO_ACTUALIZACION = 300000; // 5 minutos en milisegundos
  private parcelasSubject = new BehaviorSubject<any[]>([]);
  parcelas$ = this.parcelasSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/parcelas`;

  constructor(private http: HttpClient) {
    this.iniciarActualizacionAutomatica();
  }

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Crear una nueva parcela
  crearParcela(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  ngOnDestroy() {
    if (this.actualizacionAutomatica) {
      this.actualizacionAutomatica.unsubscribe();
    }
  }

  private iniciarActualizacionAutomatica() {
    // Obtener parcelas inicialmente
    this.obtenerParcelasDelServidor().subscribe();

    // Configurar actualización automática
    this.actualizacionAutomatica = interval(this.INTERVALO_ACTUALIZACION).pipe(
      switchMap(() => this.obtenerParcelasDelServidor())
    ).subscribe();
  }

  // Obtener todas las parcelas del servidor
  private obtenerParcelasDelServidor(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders()).pipe(
      switchMap((parcelas: any) => {
        // Crear un array de observables para actualizar cada parcela
        const actualizaciones = parcelas.map((parcela: any) => 
          this.actualizarDatosClimaticos(parcela._id).pipe(
            catchError(error => {
              console.error(`Error actualizando datos climáticos para parcela ${parcela._id}:`, error);
              return [parcela]; // Devolver la parcela sin actualizar en caso de error
            })
          )
        );

        // Combinar todos los observables y actualizar el subject
        return new Observable(observer => {
          Promise.all(actualizaciones.map((obs: Observable<any>) => 
            new Promise(resolve => obs.subscribe((data: any) => resolve(data)))
          )).then(parcelasActualizadas => {
            this.parcelasSubject.next(parcelasActualizadas);
            observer.next(parcelasActualizadas);
            observer.complete();
          }).catch(error => {
            console.error('Error actualizando parcelas:', error);
            observer.error(error);
          });
        });
      }),
      catchError(error => {
        console.error('Error obteniendo parcelas:', error);
        throw error;
      })
    );
  }

  // Obtener todas las parcelas (método público que devuelve el observable)
  obtenerParcelas(): Observable<any> {
    return this.parcelas$;
  }

  // Obtener una parcela específica
  obtenerParcela(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Actualizar datos climáticos de una parcela
  actualizarDatosClimaticos(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/clima`, {}, this.getHeaders());
  }

  // Actualizar información de una parcela
  actualizarParcela(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  // Eliminar una parcela
  eliminarParcela(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}