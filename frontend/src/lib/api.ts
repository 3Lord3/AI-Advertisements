import type {
  ItemUpdateInput,
  ItemsQueryParams,
  ItemsGetResponse,
  ItemGetResponse,
  ItemWithRevision,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';

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

// Generate description using AI (Ollama)
export async function generateDescription(
  title: string,
  category: string,
  params: Record<string, unknown>
): Promise<string> {
  const prompt = `Ты — эксперт по написанию продающих описаний для объявлений на Авито.
Напиши привлекательное описание для объявления:
- Название: ${title}
- Категория: ${category}
- Характеристики: ${JSON.stringify(params, null, 2)}

Требования к описанию:
1. Опиши преимущества товара
2. Укажи ключевые характеристики
3. Добавь призыв к действию
4. Объём: 2-4 предложения
5. Профессиональный, но дружелюбный тон`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}

// Get market price using AI (Ollama)
export async function getMarketPrice(
  title: string,
  category: string,
  params: Record<string, unknown>
): Promise<number> {
  const prompt = `Ты — эксперт по оценке рыночной стоимости товаров.
На основе данных объявления определи оптимальную цену:
- Название: ${title}
- Категория: ${category}
- Характеристики: ${JSON.stringify(params, null, 2)}

Ответь ТОЛЬКО числом в рублях (без пробелов, например: 150000).`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  // Extract number from response
  const match = data.response?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
