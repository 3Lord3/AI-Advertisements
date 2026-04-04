// Re-export all API functions for backward compatibility
export { getItems, getItem, updateItem } from './items';
export { checkOllamaAvailability, generateDescription, getMarketPrice, OllamaError } from './ollama';

// Re-export PriceAnalysis for backward compatibility
export type { PriceAnalysis as PriceAnalysisResult } from '@/types';
