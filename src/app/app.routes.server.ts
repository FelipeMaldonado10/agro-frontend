import { RenderMode, ServerRoute } from '@angular/ssr';


export const serverRoutes: ServerRoute[] = [
  {
    path: 'user-management/edit/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'parcelas/editar/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'parcelas/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'ciudades/crear',
    renderMode: RenderMode.Client
  },
  {
    path: 'ciudades/editar/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'market-prices/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
