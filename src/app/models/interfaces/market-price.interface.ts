export interface IProducto {
  _id: string;
  nombre: string;
}

export interface ICiudad {
  _id: string;
  nombre: string;
}

export interface IMarketPrice {
  _id: string;  // Changed from id to _id to match MongoDB
  producto: string | IProducto;  // Can be string ID or populated object
  ciudad: string | ICiudad;      // Can be string ID or populated object
  precio: number;
  fecha: string;
}
