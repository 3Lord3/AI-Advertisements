import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { PageHeader } from '@/components/PageHeader';
import { MainInfoForm } from '@/components/ads/MainInfoForm';
import { ParamsForm } from '@/components/ads/ParamsForm';
import { ActionButtons } from '@/components/ads/ActionButtons';
import { useAdForm } from '@/hooks/useAdForm';
import { useAiFeatures } from '@/hooks/useAiFeatures';
import type { AdFormData } from '@/lib/schemas';

export function AdEditPage() {
  const navigate = useNavigate();
  const { 
    form,
    itemId,
    item,
    updateMutation,
    handleCategoryChange,
    handleParamChange,
  } = useAdForm();

  const { watch, setValue, handleSubmit } = form;

  // Throw error if item not found
  if (!item) {
    throw new Error('Ad not found');
  }

  const formValues = watch();

  const aiFeatures = useAiFeatures<AdFormData>({
    formValues,
    setValue,
    item,
  });

  const handleBack = () => navigate(`/ads/${itemId}`);

  const onSubmit = () => {
    updateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Редактирование объявления" onBackClick={handleBack} />

      <main className="container mx-auto px-4 py-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MainInfoForm
                  formData={{
                    category: formValues.category,
                    title: formValues.title,
                    price: formValues.price,
                    description: formValues.description,
                  }}
                  onChange={(field, value) => {
                    if (field === 'category' && typeof value === 'string') {
                      handleCategoryChange(value as 'auto' | 'real_estate' | 'electronics');
                    } else if (field === 'price') {
                      setValue('price', Number(value));
                    } else {
                      setValue(field as 'title' | 'description', value as string);
                    }
                  }}
                  aiState={{
                    isGeneratingDescription: aiFeatures.isGeneratingDescription,
                    isGettingPrice: aiFeatures.isGettingPrice,
                    onGenerateDescription: aiFeatures.ollamaAvailable !== false ? aiFeatures.handleGenerateDescription : undefined,
                    onGetPrice: aiFeatures.ollamaAvailable !== false ? aiFeatures.handleGetPrice : undefined,
                  }}
                  priceDialog={{
                    priceAnalysis: aiFeatures.priceAnalysis,
                    onApplyPrice: aiFeatures.handleApplyPrice,
                    onClosePriceDialog: aiFeatures.handleClosePriceDialog,
                  }}
                  descriptionDialog={{
                    generatedDescription: aiFeatures.generatedDescription,
                    previousDescription: aiFeatures.previousDescription,
                    onApplyGeneratedDescription: aiFeatures.handleApplyGeneratedDescription,
                    onCancelGeneratedDescription: aiFeatures.handleCancelGeneratedDescription,
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Параметры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ParamsForm
                  category={formValues.category}
                  params={formValues.params}
                  onChange={handleParamChange}
                />
              </CardContent>
            </Card>

            <ActionButtons />

            {updateMutation.isError && (
              <p className="text-destructive text-center">Не удалось сохранить. Попробуйте позже.</p>
            )}
          </form>
        </Form>
      </main>
    </div>
  );
}
