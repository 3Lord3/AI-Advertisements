import type {
  ItemUpdateInput,
  ItemsQueryParams,
  ItemsGetResponse,
  ItemGetResponse,
  ItemWithRevision,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// Use proxy in development to avoid CORS issues
const OLLAMA_BASE = import.meta.env.DEV ? '/ollama' : (import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434');
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';

// Ollama configuration
const OLLAMA_TIMEOUT = parseInt(import.meta.env.VITE_OLLAMA_TIMEOUT || '180000', 10); // 180s
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TOP_P = 0.9;
const DEFAULT_TOP_K = 40;

// Custom error class for Ollama errors
export class OllamaError extends Error {
  statusCode?: number;
  isNetworkError: boolean;
  
  constructor(message: string, statusCode?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'OllamaError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
  }
}

// Logger utility - only logs errors in production
type Logger = {
  info: (message: string, data?: unknown) => void;
  error: (message: string, error?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
};

const logger: Logger = {
  info: () => { /* disabled in production */ },
  error: (message, error) => {
    console.error(`[API] ${new Date().toISOString()} - ${message}`, error ?? '');
  },
  warn: () => { /* disabled in production */ },
};

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

// Helper function for fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = OLLAMA_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OllamaError(`Превышен таймаут запроса (${Math.round(timeout / 1000)} сек)`);
    }
    throw error;
  }
}

// Check if Ollama is available
export async function checkOllamaAvailability(): Promise<boolean> {
  logger.info('Проверка доступности Ollama...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      logger.info('Ollama доступен');
      return true;
    }
    
    logger.warn(`Ollama вернул статус ${response.status}`);
    return false;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.error('Ollama недоступен: превышен таймаут', error);
      } else {
        logger.error('Ollama недоступен: ошибка сети', error);
      }
    }
    return false;
  }
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
  logger.info('Начало генерации описания', { title, category, params });

  const prompt = `Напиши на русском языке продающее объявление из 2-3 предложений для товара "${title}". В конце добавь "Звоните, пока не продано!". Без переносов строк.`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Отправка запроса к Ollama (generateDescription), попытка ${attempt}/${maxRetries}`);
      
      const response = await fetchWithTimeout(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: DEFAULT_TEMPERATURE,
            top_p: DEFAULT_TOP_P,
            top_k: DEFAULT_TOP_K,
            num_predict: 100,
          },
        }),
        timeout: OLLAMA_TIMEOUT,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Ошибка от Ollama при генерации описания', { status: response.status, error: errorText });
        throw new OllamaError(
          `Ошибка Ollama при генерации описания: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();

      // Очистка ответа
      let cleanResponse = data.response?.trim() || '';

      logger.info('Сырой ответ от Ollama:', { rawLength: cleanResponse.length, raw: cleanResponse.substring(0, 100) });

      // Только заменяем переносы строк на пробелы
      cleanResponse = cleanResponse.replace(/\r\n|\r|\n/g, ' ');

      // Удаление всех английских слов (заменяем на русские аналоги)
      const englishWords: Record<string, string> = {
        // Основные слова
        'new': 'новый', 'old': 'старый', 'used': 'б/у', 'sale': 'продажа',
        'buy': 'купить', 'price': 'цена', 'free': 'бесплатно', 'best': 'лучший',
        'quality': 'качество', 'fast': 'быстрый', 'good': 'хороший', 'great': 'отличный',
        'available': 'в наличии', 'ready': 'готов', 'few': 'несколько',
        'latest': 'последний', 'unique': 'уникальный', 'exclusive': 'эксклюзивный',
        'modern': 'современный', 'original': 'оригинальный', 'authentic': 'подлинный',
        'excellent': 'отличный', 'perfect': 'идеальный', 'amazing': 'потрясающий',
        'beautiful': 'красивый', 'wonderful': 'замечательный', 'awesome': 'классный',
        'special': 'особенный', 'limited': 'ограниченный',
        'premium': 'премиум', 'VIP': 'ВИП', 'luxury': 'люкс', 'elite': 'элитный',
        'brand': 'бренд', 'model': 'модель', 'version': 'версия', 'type': 'тип',
        'class': 'класс', 'series': 'серия', 'generation': 'поколение',
        'engine': 'двигатель', 'transmission': 'трансмиссия', 'drive': 'привод',
        'body': 'кузов', 'interior': 'салон', 'exterior': 'экстерьер',
        'features': 'особенности', 'functions': 'функции', 'options': 'опции',
        'technologies': 'технологии', 'specs': 'характеристики', 'details': 'детали',
        'condition': 'состояние', 'mileage': 'пробег', 'year': 'год',
        'color': 'цвет', 'size': 'размер', 'weight': 'вес',
        'guarantee': 'гарантия', 'warranty': 'гарантия', 'service': 'сервис',
        'delivery': 'доставка', 'shipping': 'доставка', 'payment': 'оплата',
        'discount': 'скидка', 'offer': 'предложение', 'deal': 'сделка',
        'contact': 'контакт', 'call': 'звоните', 'phone': 'телефон',
        'only': 'только', 'just': 'просто', 'very': 'очень',
        'almost': 'почти', 'nearly': 'почти',
      };
      for (const [en, ru] of Object.entries(englishWords)) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        cleanResponse = cleanResponse.replace(regex, ru);
      }
      // Удаление оставшихся английских слов (любые другие)
      cleanResponse = cleanResponse.replace(/\b[a-zA-Z]{2,}\b/g, '');

      // Удаление множественных пробелов
      cleanResponse = cleanResponse.replace(/\s+/g, ' ').trim();

      logger.info('Очищенный ответ:', { cleanLength: cleanResponse.length, clean: cleanResponse });

      // Проверка что ответ осмысленный - минимум 10 символов
      if (cleanResponse.length < 10) {
        logger.warn('Бессмысленный ответ от Ollama при генерации описания');
        throw new OllamaError('Ollama вернул бессмысленный ответ');
      }

      logger.info('Описание успешно сгенерировано', { descriptionLength: cleanResponse.length });
      return cleanResponse;
    } catch (error) {
      lastError = error as Error;
      logger.error(`Попытка ${attempt} не удалась:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2, 4, 8 секунд
        logger.info(`Пауза ${delay}мс перед повтором...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error('Все попытки генерации описания не удались');
  throw lastError;
}

// Price analysis result interface
export interface PriceAnalysis {
  suggestedPrice: number;
  newPrice: number;
  usedGoodPrice: number;
  usedFairPrice: number;
  foundCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

// Analyze ad condition using AI
async function analyzeAdCondition(
  adTitle: string,
  adDescription: string,
  adParams: Record<string, unknown>,
  adPrice: number
): Promise<'new' | 'used-good' | 'used-fair'> {
  const prompt = `Проанализируй объявление и определи состояние товара.

Название: ${adTitle}
Описание: ${adDescription || 'Нет описания'}
Характеристики: ${JSON.stringify(adParams)}
Цена: ${adPrice} руб.

Ответь ОДНИМ словом:
- "new" - если товар новый (или практически новый, без следов использования)
- "used-good" - если товар б/у в хорошем состоянии (нормальный пробег/износ, без дефектов)
- "used-fair" - если товар б/у с дефектами или значительным износом (царапины, сколы, неисправности, высокий пробег)

Ответь ТОЛЬКО одним словом из трёх вариантов: new, used-good, used-fair`;

  try {
    const response = await fetchWithTimeout(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: DEFAULT_TOP_P,
          top_k: DEFAULT_TOP_K,
          num_predict: 10,
        },
      }),
      timeout: OLLAMA_TIMEOUT,
    });

    if (!response.ok) {
      logger.warn('Ошибка AI при анализе состояния', { status: response.status });
      return 'used-good'; // Default fallback
    }

    const data = await response.json();
    const rawResponse = data.response?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || '';

    // Extract condition from response
    if (rawResponse.includes('new')) return 'new';
    if (rawResponse.includes('used-fair') || rawResponse.includes('fair')) return 'used-fair';
    if (rawResponse.includes('used-good') || rawResponse.includes('good')) return 'used-good';

    return 'used-good'; // Default
  } catch (error) {
    logger.warn('Исключение при анализе состояния', error);
    return 'used-good'; // Default fallback
  }
}

// Get market price using AI to analyze similar ads
// AI analyzes each ad's condition based on title, description, params
// Then calculates average prices for each condition category
export async function getMarketPrice(
  title: string,
  category: string,
  params: Record<string, unknown>
): Promise<PriceAnalysis> {
  logger.info('Начало оценки рыночной цены', { title, category, params });

  // Step 1: Find similar ads in database
  let foundCount = 0;
  const newPrices: number[] = [];
  const usedGoodPrices: number[] = [];
  const usedFairPrices: number[] = [];
  const allPrices: number[] = [];

  try {
    const response = await getItems({
      q: title,
      categories: category,
      limit: 15  // Limit for faster AI analysis
    });

    if (response.items && response.items.length > 0) {
      foundCount = response.items.length;
      logger.info(`Найдено ${foundCount} похожих объявлений, анализируем состояние...`);

      // Analyze each ad's condition using AI
      for (const item of response.items) {
        if (!item.price || item.price <= 0) continue;

        allPrices.push(item.price);

        // Use AI to determine condition
        const condition = await analyzeAdCondition(
          item.title,
          item.description || '',
          item.params || {},
          item.price
        );

        if (condition === 'new') {
          newPrices.push(item.price);
        } else if (condition === 'used-good') {
          usedGoodPrices.push(item.price);
        } else {
          usedFairPrices.push(item.price);
        }
      }

      logger.info('Анализ завершён', {
        newCount: newPrices.length,
        usedGoodCount: usedGoodPrices.length,
        usedFairCount: usedFairPrices.length
      });
    }
  } catch (error) {
    logger.warn('Не удалось найти похожие объявления', error);
  }

  // Step 2: Calculate prices based on analyzed conditions
  let newPrice = 0;
  let usedGoodPrice = 0;
  let usedFairPrice = 0;

  if (newPrices.length > 0) {
    newPrice = Math.round(newPrices.reduce((a, b) => a + b, 0) / newPrices.length);
  }
  if (usedGoodPrices.length > 0) {
    usedGoodPrice = Math.round(usedGoodPrices.reduce((a, b) => a + b, 0) / usedGoodPrices.length);
  }
  if (usedFairPrices.length > 0) {
    usedFairPrice = Math.round(usedFairPrices.reduce((a, b) => a + b, 0) / usedFairPrices.length);
  }

  // Calculate overall stats
  const avgPrice = allPrices.length > 0
    ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
    : 0;
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  // Step 3: If not enough data, use fallback calculation
  if (foundCount === 0 || (newPrices.length === 0 && usedGoodPrices.length === 0 && usedFairPrices.length === 0)) {
    logger.info('Недостаточно данных, используем Ollama для оценки');
    return getPriceFromAI(title, category, params);
  }

  // Step 4: Ensure prices are in correct order (new > used-good > used-fair)
  // If some categories are missing, use coefficients to fill gaps
  if (newPrices.length === 0 && usedGoodPrice > 0) {
    newPrice = Math.round(usedGoodPrice * 1.4);
  } else if (newPrices.length === 0 && usedFairPrice > 0) {
    newPrice = Math.round(usedFairPrice * 2.5);
  }

  if (usedGoodPrices.length === 0 && newPrice > 0) {
    usedGoodPrice = Math.round(newPrice * 0.7);
  } else if (usedGoodPrices.length === 0 && usedFairPrice > 0) {
    usedGoodPrice = Math.round(usedFairPrice * 1.75);
  }

  if (usedFairPrices.length === 0 && usedGoodPrice > 0) {
    usedFairPrice = Math.round(usedGoodPrice * 0.55);
  } else if (usedFairPrices.length === 0 && newPrice > 0) {
    usedFairPrice = Math.round(newPrice * 0.4);
  }

  // Final guarantee: new > used-good > used-fair
  const finalNewPrice = Math.max(newPrice, usedGoodPrice * 2, usedFairPrice * 3);
  const finalUsedGoodPrice = Math.round(finalNewPrice * 0.7);
  const finalUsedFairPrice = Math.round(finalNewPrice * 0.4);

  const suggestedPrice = finalUsedGoodPrice;

  logger.info('Цены рассчитаны на основе AI-анализа', {
    newPrice: finalNewPrice,
    usedGoodPrice: finalUsedGoodPrice,
    usedFairPrice: finalUsedFairPrice,
    suggestedPrice,
    foundCount,
    newCount: newPrices.length,
    usedGoodCount: usedGoodPrices.length,
    usedFairCount: usedFairPrices.length
  });

  return {
    suggestedPrice,
    newPrice: finalNewPrice,
    usedGoodPrice: finalUsedGoodPrice,
    usedFairPrice: finalUsedFairPrice,
    foundCount,
    avgPrice,
    minPrice,
    maxPrice
  };
}

// Fallback: Get price from AI when no similar ads found
async function getPriceFromAI(
  title: string,
  category: string,
  params: Record<string, unknown>
): Promise<PriceAnalysis> {
  const prompt = `Ты эксперт по оценке рыночной стоимости товаров.

Товар: ${title}
Категория: ${category}
Характеристики: ${JSON.stringify(params)}

Определи приблизительную рыночную стоимость нового товара в рублях.

Ответь ТОЛЬКО одним числом - средняя рыночная цена в рублях. Пример: 25000`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Запрос к Ollama (fallback), попытка ${attempt}/${maxRetries}`);

      const response = await fetchWithTimeout(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: DEFAULT_TOP_P,
            top_k: DEFAULT_TOP_K,
            num_predict: 20,
          },
        }),
        timeout: OLLAMA_TIMEOUT,
      });

      if (!response.ok) {
        throw new OllamaError(`Ошибка Ollama: ${response.status}`, response.status);
      }

      const data = await response.json();
      const rawResponse = data.response?.trim() || '';

      const match = rawResponse.match(/(\d+)/);
      if (!match) {
        throw new OllamaError('Не удалось извлечь цену');
      }

      const basePrice = parseInt(match[1], 10);
      if (isNaN(basePrice) || basePrice < 100) {
        throw new OllamaError('Некорректная цена');
      }

      const finalNewPrice = Math.max(basePrice, 1000);
      const finalUsedGoodPrice = Math.round(finalNewPrice * 0.7);
      const finalUsedFairPrice = Math.round(finalNewPrice * 0.4);

      return {
        suggestedPrice: finalUsedGoodPrice,
        newPrice: finalNewPrice,
        usedGoodPrice: finalUsedGoodPrice,
        usedFairPrice: finalUsedFairPrice,
        foundCount: 0,
        avgPrice: basePrice,
        minPrice: basePrice,
        maxPrice: basePrice
      };
    } catch (error) {
      lastError = error as Error;
      logger.error(`Попытка ${attempt} не удалась:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError;
}
