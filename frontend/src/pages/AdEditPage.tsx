import { useEffect, useMemo } from 'react';
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
import { ItemCategory } from '@/types';

export function AdEditPage() {
  const navigate = useNavigate();
  const { 
    formData, 
    setFormData, 
    isLoading, 
    error, 
    itemId, 
    updateMutation, 
    handleSubmit, 
    handleCategoryChange,
    handleParamChange 
  } = useAdForm();

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
    // Compare current form data with original item data
    return formData.title !== item.title ||
           formData.description !== (item.description || '')||
           formData.price !== item.price ||
           formData.category !== item.category ||
           JSON.stringify(formData.params) !== JSON.stringify(item.params);
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
