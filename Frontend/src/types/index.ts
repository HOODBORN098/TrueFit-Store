export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string;
  description: string;
  stock: number;
  newArrival?: boolean;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Collection {
  id: string;
  name: string;
  image: string;
  description: string;
}

export type Page =
  'home' |
  'collections' |
  'shop' |
  'product' |
  'cart' |
  'checkout' |
  'admin-login' |
  'admin-dashboard' |
  'admin-add-product' |
  'customer-login' |
  'customer-signup' |
  'profile' |
  'support' |
  'faq' |
  'shipping' |
  'size-guide';