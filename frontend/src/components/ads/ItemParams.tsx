import { Item, getParamsFields, ParamsField } from '@/types';

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
        if (field.type === 'select' && field.options) {
          const option = field.options.find((opt) => opt.value === value);
          displayValue = option?.label || String(value);
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
