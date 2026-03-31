/**
 * api.ts — Centralised API layer for the TrueFit storefront.
 *
 * All requests go through these helpers so that:
 *  - The base URL is NEVER hardcoded in individual components.
 *  - Error handling is consistent across the app.
 *  - Swapping the backend URL only requires changing the .env file.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string; // DRF returns DecimalField as string
  image: string | null;
  image_url: string | null;
  stock: number;
  category: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  newArrival: boolean;
  created_at: string;
}

export interface ApiCollection {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options?.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message ?? JSON.stringify(errorBody);
    } catch {
      // Response body wasn't JSON — use the status text
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated products.
 * @param params  Optional query parameters (category, search, ordering, page)
 */
export async function fetchProducts(
  params: Record<string, string> = {}
): Promise<PaginatedResponse<ApiProduct>> {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<PaginatedResponse<ApiProduct>>(`/api/products/${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch a single product by its ID.
 */
export async function fetchProduct(id: number | string): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/api/products/${id}/`);
}

/**
 * Create a new product (used by the Admin Add Product form).
 */
export async function createProduct(data: Record<string, unknown>): Promise<ApiProduct> {
  return apiFetch<ApiProduct>('/api/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Collections ──────────────────────────────────────────────────────────────

/**
 * Fetch all collections (not paginated by the backend).
 */
export async function fetchCollections(): Promise<ApiCollection[]> {
  return apiFetch<ApiCollection[]>('/api/collections/');
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * Create a new order after payment.
 */
export async function createOrder(orderData: any): Promise<any> {
    return apiFetch<any>('/api/orders/create/', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
}
