import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItemWithRevision, getMissingFields } from '@/types';

interface RevisionWarningProps {
  item: ItemWithRevision;
}

export function RevisionWarning({ item }: RevisionWarningProps) {
  if (!item.needsRevision) return null;

  // Use getMissingFields from types
  const missing = getMissingFields(item);

  if (missing.length === 0) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 mb-6">
      <CardContent className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-orange-800 dark:text-orange-200">Требуются доработки</p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Не заполнены: {missing.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
