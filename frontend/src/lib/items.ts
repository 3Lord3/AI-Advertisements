import type {
  ItemUpdateInput,
  ItemsQueryParams,
  ItemsGetResponse,
  ItemGetResponse,
  ItemWithRevision,
} from '@/types';
import { API_BASE_URL } from './config';

// Helper function for fetch calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Get all items with filters
export async function getItems(params: ItemsQueryParams): Promise<ItemsGetResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.skip) searchParams.set('skip', String(params.skip));
  if (params.needsRevision) searchParams.set('needsRevision', String(params.needsRevision));
  if (params.categories) searchParams.set('categories', params.categories);
  if (params.sortColumn) searchParams.set('sortColumn', params.sortColumn);
  if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

  const queryString = searchParams.toString();
  return fetchApi<ItemsGetResponse>(`/items${queryString ? `?${queryString}` : ''}`);
}

// Get single item by ID
export async function getItem(id: number): Promise<ItemGetResponse> {
  const data = await fetchApi<ItemWithRevision>(`/items/${id}`);
  return { item: data };
}

// Update item - returns { success: true } on success
export async function updateItem(id: number, data: ItemUpdateInput): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}