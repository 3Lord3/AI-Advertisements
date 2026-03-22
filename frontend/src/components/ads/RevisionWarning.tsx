import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItemWithRevision, getParamsFields, ParamsField } from '@/types';

interface RevisionWarningProps {
  item: ItemWithRevision;
}

export function RevisionWarning({ item }: RevisionWarningProps) {
  if (!item.needsRevision) return null;

  const missing: string[] = [];

  // Check description
  if (!item.description || item.description.trim() === '') {
    missing.push('Описание');
  }

  // Get params fields for the category to check ALL expected fields
  const paramsFields = getParamsFields(item.category);
  const fieldLabels = new Map<string, string>(paramsFields.map((f: ParamsField) => [f.key, f.label] as [string, string]));

  // Fallback labels for additional fields
  const fallbackLabels: Record<string, string> = {
    type: 'Тип',
    brand: 'Марка',
    model: 'Модель',
    yearOfManufacture: 'Год выпуска',
    transmission: 'Коробка передач',
    mileage: 'Пробег',
    enginePower: 'Мощность двигателя',
    address: 'Адрес',
    area: 'Площадь',
    floor: 'Этаж',
    condition: 'Состояние',
    color: 'Цвет',
  };

  const params = item.params;

  // Check ALL expected fields for the category
  paramsFields.forEach((field: ParamsField) => {
    const key = field.key;
    const value = params[key as keyof typeof params];
    
    if (value === undefined || value === '' || value === null) {
      const label = fieldLabels.get(key) || fallbackLabels[key] || key;
      missing.push(label);
    }
  });

  if (missing.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 mb-6">
      <CardContent className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-orange-800">Требуются доработки</p>
          <p className="text-sm text-orange-700">
            Не заполнены: {missing.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
