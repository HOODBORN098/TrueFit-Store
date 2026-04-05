export interface ProductSize {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  sizes: (string | ProductSize)[];
  colors: string[];
  category: string;
  description: string;
  stock: number;
  newArrival?: boolean;
  featured?: boolean;
  collections?: number[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
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
  'admin-edit-product' |
  'admin-add-collection' |
  'admin-edit-collection' |
  'customer-login' |
  'customer-signup' |
  'profile' |
  'support' |
  'faq' |
  'shipping' |
  'size-guide' |
  'privacy-policy' |
  'terms-conditions';