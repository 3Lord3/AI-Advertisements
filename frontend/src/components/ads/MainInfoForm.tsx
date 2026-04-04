import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABELS, CATEGORY_OPTIONS, ItemCategory } from '@/types';
import type { MainInfoFormProps } from '@/types';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export type { MainInfoFormProps };

export function MainInfoForm({
  formData,
  onChange,
  aiState = {},
  priceDialog = {},
  descriptionDialog = {},
}: MainInfoFormProps) {
  const { category, title, price, description } = formData;
  const { isGeneratingDescription = false, isGettingPrice = false, onGenerateDescription, onGetPrice } = aiState;
  const { priceAnalysis, onApplyPrice, onClosePriceDialog } = priceDialog;
  const { generatedDescription, previousDescription, onApplyGeneratedDescription, onCancelGeneratedDescription } = descriptionDialog;
  
  // Кнопки активны только когда заполнены title и category
  const isAiEnabled = !!(title && category && title.trim().length > 0);
  
  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="category">
          <span className="text-red-500">*</span> Категория
        </Label>
        <Select
          value={category}
          onValueChange={(value) => onChange('category', value as ItemCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию">
              {CATEGORY_LABELS[category]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          <span className="text-red-500">*</span> Название
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Название объявления"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          <span className="text-red-500">*</span> Цена (₽)
        </Label>
        <div className="flex gap-2">
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => onChange('price', Number(e.target.value))}
            placeholder="0"
            required
            min={1}
            className="flex-1"
          />
          {onGetPrice && (
            <Button
              type="button"
              variant="outline"
              onClick={onGetPrice}
              disabled={!isAiEnabled || isGettingPrice}
              className="shrink-0 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 whitespace-nowrap text-xs"
            >
              {isGettingPrice ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Анализ...
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Узнать рыночную стоимость
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">
            Описание
            <span className="text-muted-foreground text-xs">
              ({description.length} символов)
            </span>
          </Label>
          {onGenerateDescription && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerateDescription}
              disabled={!isAiEnabled || isGeneratingDescription}
              className="h-7 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 whitespace-nowrap text-xs"
            >
              {isGeneratingDescription ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Сгенерировать описание при помощи ИИ
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Опишите ваш товар..."
          className="min-h-[120px]"
        />
      </div>

      {/* Dialog с вариантами цен */}
      <Dialog open={!!priceAnalysis} onOpenChange={(open) => !open && onClosePriceDialog?.()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рыночная стоимость</DialogTitle>
          </DialogHeader>
          {priceAnalysis && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Найдено похожих объявлений: {priceAnalysis.foundCount}
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => onApplyPrice?.(priceAnalysis.newPrice)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors"
                >
                  <div className="font-medium">Новый товар</div>
                  <div className="text-lg font-bold text-purple-600">{formatPrice(priceAnalysis.newPrice)}</div>
                </button>
                
                <button
                  onClick={() => onApplyPrice?.(priceAnalysis.usedGoodPrice)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors"
                >
                  <div className="font-medium">Б/у в хорошем состоянии</div>
                  <div className="text-lg font-bold text-purple-600">{formatPrice(priceAnalysis.usedGoodPrice)}</div>
                </button>
                
                <button
                  onClick={() => onApplyPrice?.(priceAnalysis.usedFairPrice)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors"
                >
                  <div className="font-medium">Б/у с дефектами</div>
                  <div className="text-lg font-bold text-purple-600">{formatPrice(priceAnalysis.usedFairPrice)}</div>
                </button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onClosePriceDialog}>Отмена</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog с сгенерированным описанием */}
      <Dialog 
        open={!!generatedDescription} 
        onOpenChange={(open) => !open && onCancelGeneratedDescription?.()}
      >
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Описание сгенерировано</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {previousDescription && previousDescription.trim().length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Текущее описание:</p>
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                  {previousDescription}
                </div>
              </div>
            )}
            {generatedDescription && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {previousDescription && previousDescription.trim().length > 0 ? 'Новое описание:' : 'Сгенерированное описание:'}
                </p>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                  {generatedDescription}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="bg-white">
            <Button variant="outline" className="bg-white" onClick={onCancelGeneratedDescription}>
              Отмена
            </Button>
            <Button onClick={onApplyGeneratedDescription}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
