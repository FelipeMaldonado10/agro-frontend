export interface Producto {
  _id: string;
  nombre: string;
}

export interface Ciudad {
  _id: string;
  nombre: string;
}

export interface MarketPrice {
  id: string;
  producto: Producto | string;
  ciudad: Ciudad | string;
  precio: number;
  fecha: string | Date;
}
