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

export interface ApiCollection {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  created_at: string;
}

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
  collections: number[];
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit & { noAuth?: boolean }): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options?.headers as Record<string, string> ?? {}),
  };

  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !options?.noAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const errorBody = await response.json().catch(() => ({}));
      // Check if it's a "token expired" or similar JWT error
      const isTokenError = 
        JSON.stringify(errorBody).toLowerCase().includes('token_not_valid') || 
        JSON.stringify(errorBody).toLowerCase().includes('expired');
      
      if (isTokenError) {
        // Dispatch global event so AuthContext can clean up
        window.dispatchEvent(new Event('session-expired'));
        throw new Error('Your session has expired. Please log in again.');
      }
    }

    let errorMessage = `API error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message ?? errorBody.detail ?? errorBody.error ?? JSON.stringify(errorBody);
    } catch {
      // Response body wasn't JSON — use the status text
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content or empty bodies
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    // If it's not JSON but we expected something, return empty or throw? 
    // Usually, if we're here, we expect JSON.
    console.error('Failed to parse JSON response:', text);
    return {} as T;
  }
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
  return apiFetch<PaginatedResponse<ApiProduct>>(`/api/products/${qs ? `?${qs}` : ''}`, { noAuth: true });
}

/**
 * Fetch a single product by its ID.
 */
export async function fetchProduct(id: number | string): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/api/products/${id}/`, { noAuth: true });
}

/**
 * Create a new product (used by the Admin Add Product form).
 */
export async function createProduct(data: Record<string, unknown> | FormData): Promise<ApiProduct> {
  const isFormData = data instanceof FormData;
  return apiFetch<ApiProduct>('/api/products/', {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  });
}

/**
 * Update an existing product.
 */
export async function updateProduct(id: number | string, data: Record<string, unknown> | FormData): Promise<ApiProduct> {
  const isFormData = data instanceof FormData;
  return apiFetch<ApiProduct>(`/api/products/${id}/`, {
    method: 'PATCH',
    body: isFormData ? data : JSON.stringify(data),
  });
}

/**
 * Delete a product.
 */
export async function deleteProduct(id: number | string): Promise<void> {
  return apiFetch<void>(`/api/products/${id}/`, {
    method: 'DELETE',
  });
}

// ─── Collections ──────────────────────────────────────────────────────────────

/**
 * Fetch all collections (not paginated by the backend).
 */
export async function fetchCollections(): Promise<ApiCollection[]> {
  return apiFetch<ApiCollection[]>('/api/collections/', { noAuth: true });
}

/**
 * Create a new collection.
 */
export async function createCollection(data: FormData): Promise<ApiCollection> {
  return apiFetch<ApiCollection>('/api/collections/', {
    method: 'POST',
    body: data,
  });
}

/**
 * Update a collection.
 */
export async function updateCollection(id: number | string, data: FormData): Promise<ApiCollection> {
  return apiFetch<ApiCollection>(`/api/collections/${id}/`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Delete a collection.
 */
export async function deleteCollection(id: number | string): Promise<void> {
  return apiFetch<void>(`/api/collections/${id}/`, {
    method: 'DELETE',
  });
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

/**
 * Fetch the current user's personal order history.
 */
export async function fetchMyOrders(): Promise<any[]> {
    return apiFetch<any[]>('/api/orders/my-orders/', {
        method: 'GET',
    });
}

// ─── Payment & M-Pesa ────────────────────────────────────────────────────────

/**
 * Trigger an M-Pesa STK Push pop-up on the customer's phone.
 */
export async function triggerMpesaPush(orderId: number, phone: string): Promise<any> {
    return apiFetch<any>('/api/payment/mpesa/', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, phone }),
    });
}

/**
 * Fetch a single order (used to poll status).
 */
export async function fetchOrder(orderId: number | string): Promise<any> {
    // Note: If you add a specific detail endpoint like /api/orders/<id>/, update this path.
    // For now, we can check the status via the my-orders list or add a detail view.
    const orders = await fetchMyOrders();
    return orders.find(o => o.id === orderId);
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

/**
 * Subscribe an email address to the TrueFIT newsletter.
 */
export async function subscribeToNewsletter(email: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/newsletter/subscribe/', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}
