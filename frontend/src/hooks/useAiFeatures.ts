import { useState, useEffect, useMemo } from 'react';
import { generateDescription, getMarketPrice, checkOllamaAvailability, OllamaError } from '@/lib/api';
import { PriceAnalysis, Item } from '@/types';
import { UseFormSetValue, FieldValues, Path } from 'react-hook-form';

interface UseAiFeaturesOptions<T extends FieldValues> {
  formValues: {
    title: string;
    category: string;
    price: number;
    params: Record<string, string | number>;
    description: string;
  };
  setValue: UseFormSetValue<T>;
  item: Item | undefined;
}

interface UseAiFeaturesReturn {
  isGeneratingDescription: boolean;
  isGettingPrice: boolean;
  ollamaAvailable: boolean | null;
  priceAnalysis: PriceAnalysis | null;
  generatedDescription: string | null;
  previousDescription: string;
  hasUnsavedChanges: boolean;
  handleGenerateDescription: () => Promise<void>;
  handleApplyGeneratedDescription: () => void;
  handleCancelGeneratedDescription: () => void;
  handleGetPrice: () => Promise<void>;
  handleApplyPrice: (price: number) => void;
  handleClosePriceDialog: () => void;
}

export function useAiFeatures<T extends FieldValues>({ formValues, setValue, item }: UseAiFeaturesOptions<T>): UseAiFeaturesReturn {
  // AI state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGettingPrice, setIsGettingPrice] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [previousDescription, setPreviousDescription] = useState<string>('');

  // Track if form has been modified from initial state
  const hasUnsavedChanges = useMemo(() => {
    if (!item) return false;
    const normalizeParams = (params: Record<string, unknown>) => 
      JSON.stringify(Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b)));
    return formValues.title !== item.title ||
           formValues.description !== (item.description || '')||
           formValues.price !== item.price ||
           formValues.category !== item.category ||
           normalizeParams(formValues.params) !== normalizeParams(item.params);
  }, [formValues, item]);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Check Ollama availability on mount
  useEffect(() => {
    const checkOllama = async () => {
      const available = await checkOllamaAvailability();
      setOllamaAvailable(available);
    };
    checkOllama();
  }, []);

  // AI handlers
  const handleGenerateDescription = async () => {
    if (!formValues.title || !formValues.category) {
      alert('Please fill in the title and category');
      return;
    }

    setPreviousDescription(formValues.description);
    setIsGeneratingDescription(true);
    try {
      const description = await generateDescription(
        formValues.title,
        formValues.category,
        formValues.params
      );
      setGeneratedDescription(description);
    } catch (error) {
      if (error instanceof OllamaError) {
        alert(error.message);
      } else {
        alert('Failed to generate description. Try again later.');
      }
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleApplyGeneratedDescription = () => {
    if (generatedDescription) {
      setValue('description' as Path<T>, generatedDescription as T['description']);
    }
    setGeneratedDescription(null);
    setPreviousDescription('');
  };

  const handleCancelGeneratedDescription = () => {
    setGeneratedDescription(null);
    setPreviousDescription('');
  };

  const handleGetPrice = async () => {
    if (!formValues.title || !formValues.category) {
      alert('Please fill in the title and category');
      return;
    }

    setIsGettingPrice(true);
    setPriceAnalysis(null);
    try {
      const result = await getMarketPrice(
        formValues.title,
        formValues.category,
        formValues.params
      );
      if (result.suggestedPrice > 0) {
        setPriceAnalysis(result);
      } else {
        alert('Failed to determine market price. Try changing the product description.');
      }
    } catch (error) {
      if (error instanceof OllamaError) {
        alert(error.message);
      } else {
        alert('Failed to determine price. Try again later.');
      }
    } finally {
      setIsGettingPrice(false);
    }
  };

  const handleApplyPrice = (price: number) => {
    setValue('price' as Path<T>, price as T['price']);
    setPriceAnalysis(null);
  };

  const handleClosePriceDialog = () => {
    setPriceAnalysis(null);
  };

  return {
    isGeneratingDescription,
    isGettingPrice,
    ollamaAvailable,
    priceAnalysis,
    generatedDescription,
    previousDescription,
    hasUnsavedChanges,
    handleGenerateDescription,
    handleApplyGeneratedDescription,
    handleCancelGeneratedDescription,
    handleGetPrice,
    handleApplyPrice,
    handleClosePriceDialog,
  };
}