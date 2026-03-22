import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABELS, CATEGORY_OPTIONS, ItemCategory } from '@/types';

interface MainInfoFormProps {
  category: ItemCategory;
  title: string;
  price: number;
  description: string;
  onCategoryChange: (category: ItemCategory) => void;
  onTitleChange: (title: string) => void;
  onPriceChange: (price: number) => void;
  onDescriptionChange: (description: string) => void;
}

export function MainInfoForm({
  category,
  title,
  price,
  description,
  onCategoryChange,
  onTitleChange,
  onPriceChange,
  onDescriptionChange,
}: MainInfoFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="category">
          <span className="text-red-500">*</span> Категория
        </Label>
        <Select
          value={category}
          onValueChange={(value) => onCategoryChange(value as ItemCategory)}
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
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Название объявления"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          <span className="text-red-500">*</span> Цена (₽)
        </Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          placeholder="0"
          required
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Описание
          <span className="text-muted-foreground text-xs">
            ({description.length} символов)
          </span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Опишите ваш товар..."
          className="min-h-[120px]"
        />
      </div>
    </>
  );
}
