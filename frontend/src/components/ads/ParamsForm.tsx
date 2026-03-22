import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemCategory, getParamsFields, getSelectLabel, ParamsField } from '@/types';

interface ParamsFormProps {
  category: ItemCategory;
  params: Record<string, string | number>;
  onChange: (key: string, value: string | number) => void;
}

export function ParamsForm({ category, params, onChange }: ParamsFormProps) {
  const paramsFields = getParamsFields(category);

  return (
    <>
      {paramsFields.map((field: ParamsField) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.type === 'select' ? (
            <Select
              value={String(params[field.key] || '')}
              onValueChange={(value) => onChange(field.key, value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите значение">
                  {params[field.key] 
                    ? getSelectLabel(category, field.key, String(params[field.key]))
                    : 'Выберите значение'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.key}
              type={field.type === 'number' ? 'number' : 'text'}
              min={field.type === 'number' ? 0 : undefined}
              value={String(params[field.key] || '')}
              onChange={(e) => onChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder="Введите значение"
            />
          )}
        </div>
      ))}
    </>
  );
}
