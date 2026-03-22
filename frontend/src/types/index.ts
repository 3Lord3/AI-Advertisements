// Item categories
export type ItemCategory = 'auto' | 'real_estate' | 'electronics';

// Category parameters
export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
};

export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
};

export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};

// Item type
export type Item = {
  id: number;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
} & (
  | { category: 'auto'; params: AutoItemParams }
  | { category: 'real_estate'; params: RealEstateItemParams }
  | { category: 'electronics'; params: ElectronicsItemParams }
);

// Item with needsRevision flag (from API)
export type ItemWithRevision = Item & {
  needsRevision: boolean;
};

// API response types
export interface ItemsGetResponse {
  items: ItemWithRevision[];
  total: number;
}

export interface ItemGetResponse {
  item: ItemWithRevision;
}

// Query params for GET /items
export interface ItemsQueryParams {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: string;
  sortColumn?: 'title' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// Form types
export type ItemUpdateInput = {
  category: ItemCategory;
  title: string;
  description?: string;
  price: number;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

// Filter types
export interface AdsFilters {
  search: string;
  categories: ItemCategory[];
  needsRevision: boolean;
}

// Sort types
export type SortColumn = 'title' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

// Category labels (Russian)
export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  auto: 'Автомобили',
  real_estate: 'Недвижимость',
  electronics: 'Электроника',
};

// Category options for select
export const CATEGORY_OPTIONS = [
  { value: 'auto', label: 'Автомобили' },
  { value: 'real_estate', label: 'Недвижимость' },
  { value: 'electronics', label: 'Электроника' },
];

// Auto params fields
export const AUTO_PARAMS_FIELDS = [
  { key: 'brand', label: 'Марка', type: 'text' },
  { key: 'model', label: 'Модель', type: 'text' },
  { key: 'yearOfManufacture', label: 'Год выпуска', type: 'number' },
  { key: 'transmission', label: 'Коробка передач', type: 'select', options: [
    { value: 'automatic', label: 'Автомат' },
    { value: 'manual', label: 'Механика' },
  ]},
  { key: 'mileage', label: 'Пробег (км)', type: 'number' },
  { key: 'enginePower', label: 'Мощность двигателя (л.с.)', type: 'number' },
] as const;

// Real estate params fields
export const REAL_ESTATE_PARAMS_FIELDS = [
  { key: 'type', label: 'Тип', type: 'select', options: [
    { value: 'flat', label: 'Квартира' },
    { value: 'house', label: 'Дом' },
    { value: 'room', label: 'Комната' },
  ]},
  { key: 'address', label: 'Адрес', type: 'text' },
  { key: 'area', label: 'Площадь (м²)', type: 'number' },
  { key: 'floor', label: 'Этаж', type: 'number' },
] as const;

// Electronics params fields
export const ELECTRONICS_PARAMS_FIELDS = [
  { key: 'type', label: 'Тип', type: 'select', options: [
    { value: 'phone', label: 'Телефон' },
    { value: 'laptop', label: 'Ноутбук' },
    { value: 'misc', label: 'Другое' },
  ]},
  { key: 'brand', label: 'Бренд', type: 'text' },
  { key: 'model', label: 'Модель', type: 'text' },
  { key: 'condition', label: 'Состояние', type: 'select', options: [
    { value: 'new', label: 'Новый' },
    { value: 'used', label: 'Б/У' },
  ]},
  { key: 'color', label: 'Цвет', type: 'text' },
] as const;

// Get params fields by category
export function getParamsFields(category: ItemCategory) {
  switch (category) {
    case 'auto':
      return AUTO_PARAMS_FIELDS;
    case 'real_estate':
      return REAL_ESTATE_PARAMS_FIELDS;
    case 'electronics':
      return ELECTRONICS_PARAMS_FIELDS;
    default:
      return [];
  }
}

// Check if item needs revision
export function checkNeedsRevision(item: Item): boolean {
  if (!item.description || item.description.trim() === '') {
    return true;
  }

  const params = item.params;
  const paramKeys = Object.keys(params);
  
  if (paramKeys.length === 0) {
    return true;
  }

  const hasEmptyParams = paramKeys.some(key => {
    const value = params[key as keyof typeof params];
    return value === undefined || value === '' || value === null;
  });

  return hasEmptyParams;
}

// Get missing fields for revision
export function getMissingFields(item: Item): string[] {
  const missing: string[] = [];

  if (!item.description || item.description.trim() === '') {
    missing.push('Описание');
  }

  const params = item.params;
  const paramKeys = Object.keys(params);
  
  if (paramKeys.length === 0) {
    missing.push('Характеристики');
  } else {
    paramKeys.forEach(key => {
      const value = params[key as keyof typeof params];
      if (value === undefined || value === '' || value === null) {
        missing.push(key);
      }
    });
  }

  return missing;
}
