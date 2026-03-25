import { Item, getParamsFields, getSelectLabel, ParamsField } from '@/types';

interface ItemParamsProps {
  item: Item;
}

export function ItemParams({ item }: ItemParamsProps) {
  const params = item.params;
  const fields = getParamsFields(item.category);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Характеристики</h3>
      {fields.map((field: ParamsField) => {
        const value = params[field.key as keyof typeof params];
        if (value === undefined || value === '' || value === null) return null;

        let displayValue = String(value);
        // Используем getSelectLabel для преобразования технических значений в читаемые
        if (field.type === 'select') {
          displayValue = getSelectLabel(item.category, field.key, String(value));
        }

        return (
          <div key={field.key} className="flex justify-between">
            <span className="text-muted-foreground">{field.label}</span>
            <span className="font-medium">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}
