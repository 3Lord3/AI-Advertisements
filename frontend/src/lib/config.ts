// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const OLLAMA_BASE = import.meta.env.DEV ? '/ollama' : (import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434');
export const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';

// Ollama configuration
export const OLLAMA_TIMEOUT = parseInt(import.meta.env.VITE_OLLAMA_TIMEOUT || '180000', 10); // 180s

// Default generation parameters
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_TOP_P = 0.9;
export const DEFAULT_TOP_K = 40;