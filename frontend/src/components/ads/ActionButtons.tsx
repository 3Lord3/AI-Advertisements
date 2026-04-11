import { Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdForm } from '@/hooks/useAdForm';

export function ActionButtons() {
  const { itemId, updateMutation } = useAdForm();

  const handleCancel = () => {
    window.location.href = `/ads/${itemId}`;
  };

  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        className="bg-background dark:bg-input/30 border-gray-300 dark:border-gray-700 hover:bg-muted dark:hover:bg-input/50"
        onClick={handleCancel}
        disabled={updateMutation.isPending}
      >
        <X className="h-4 w-4 mr-2" />
Отмена
      </Button>
      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
Сохранить
      </Button>
    </div>
  );
}