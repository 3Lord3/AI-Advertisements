import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { PageHeader } from '@/components/ui/PageHeader';
import { MainInfoForm } from '@/components/ads/MainInfoForm';
import { ParamsForm } from '@/components/ads/ParamsForm';
import { useAdForm } from '@/hooks/useAdForm';
import { generateDescription, getMarketPrice, checkOllamaAvailability, OllamaError, PriceAnalysis } from '@/lib/api';
import { ItemCategory } from '@/types';

export function AdEditPage() {
  const navigate = useNavigate();
  const { 
    formData, 
    setFormData, 
    isLoading, 
    error, 
    itemId,
    item,
    updateMutation, 
    handleSubmit, 
    handleCategoryChange,
    handleParamChange 
  } = useAdForm();

  // AI state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGettingPrice, setIsGettingPrice] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
  // Для сравнения описаний
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [previousDescription, setPreviousDescription] = useState<string>('');

  // Create a unified onChange handler that handles all fields
  const handleMainInfoChange = (field: string, value: string | number | ItemCategory) => {
    if (field === 'category' && typeof value === 'string') {
      handleCategoryChange(value as ItemCategory);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Track if form has been modified from initial state
  const hasUnsavedChanges = useMemo(() => {
    if (!item) return false;
    // Normalize params for comparison (convert all values to strings)
    const normalizeParams = (params: Record<string, unknown>) => 
      JSON.stringify(Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b)));
    return formData.title !== item.title ||
           formData.description !== (item.description || '')||
           formData.price !== item.price ||
           formData.category !== item.category ||
           normalizeParams(formData.params) !== normalizeParams(item.params);
  }, [formData, item]);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
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
    if (!formData.title || !formData.category) {
      alert('Пожалуйста, заполните название и категорию');
      return;
    }

    // Сохраняем текущее описание перед генерацией нового
    setPreviousDescription(formData.description);
    
    setIsGeneratingDescription(true);
    try {
      const description = await generateDescription(
        formData.title,
        formData.category,
        formData.params
      );
      // Вместо того чтобы сразу применить, показываем диалог сравнения
      setGeneratedDescription(description);
    } catch (error) {
      if (error instanceof OllamaError) {
        alert(error.message);
      } else {
        alert('Не удалось сгенерировать описание. Попробуйте позже.');
      }
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleApplyGeneratedDescription = () => {
    if (generatedDescription) {
      setFormData(prev => ({ ...prev, description: generatedDescription }));
    }
    setGeneratedDescription(null);
    setPreviousDescription('');
  };

  const handleCancelGeneratedDescription = () => {
    setGeneratedDescription(null);
    setPreviousDescription('');
  };

  const handleGetPrice = async () => {
    if (!formData.title || !formData.category) {
      alert('Пожалуйста, заполните название и категорию');
      return;
    }

    setIsGettingPrice(true);
    setPriceAnalysis(null);
    try {
      const result = await getMarketPrice(
        formData.title,
        formData.category,
        formData.params
      );
      if (result.suggestedPrice > 0) {
        setPriceAnalysis(result);
      } else {
        alert('Не удалось определить рыночную цену. Попробуйте изменить описание товара.');
      }
    } catch (error) {
      if (error instanceof OllamaError) {
        alert(error.message);
      } else {
        alert('Не удалось определить цену. Попробуйте позже.');
      }
    } finally {
      setIsGettingPrice(false);
    }
  };

  const handleApplyPrice = (price: number) => {
    setFormData(prev => ({ ...prev, price }));
    setPriceAnalysis(null);
  };

  const handleClosePriceDialog = () => {
    setPriceAnalysis(null);
  };

  const handleBack = () => navigate(`/ads/${itemId}`);
  const handleCancel = () => navigate(`/ads/${itemId}`);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Объявление не найдено" />;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Редактирование объявления" onBackClick={handleBack} />

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MainInfoForm
                category={formData.category}
                title={formData.title}
                price={formData.price}
                description={formData.description}
                onChange={handleMainInfoChange}
                isGeneratingDescription={isGeneratingDescription}
                isGettingPrice={isGettingPrice}
                onGenerateDescription={ollamaAvailable !== false ? handleGenerateDescription : undefined}
                onGetPrice={ollamaAvailable !== false ? handleGetPrice : undefined}
                priceAnalysis={priceAnalysis}
                onApplyPrice={handleApplyPrice}
                onClosePriceDialog={handleClosePriceDialog}
                generatedDescription={generatedDescription}
                previousDescription={previousDescription}
                onApplyGeneratedDescription={handleApplyGeneratedDescription}
                onCancelGeneratedDescription={handleCancelGeneratedDescription}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ParamsForm
                category={formData.category}
                params={formData.params}
                onChange={handleParamChange}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
              <X className="h-4 w-4 mr-2" />
              Отменить
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Сохранить
            </Button>
          </div>

          {updateMutation.isError && (
            <p className="text-destructive text-center">Ошибка сохранения. Попробуйте позже.</p>
          )}
        </form>
      </main>
    </div>
  );
}
