import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CATEGORY_LABELS, ItemWithRevision } from '@/types';
import { ItemParams } from './ItemParams';
import { RevisionWarning } from './RevisionWarning';

interface ItemCardProps {
  item: ItemWithRevision;
}

export function ItemCard({ item }: ItemCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {CATEGORY_LABELS[item.category]}
            </Badge>
            <CardTitle className="text-2xl">{item.title}</CardTitle>
          </div>
          <p className="text-2xl font-bold">{item.price?.toLocaleString('ru-RU')} ₽</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Опубликовано: {formatDate(item.createdAt)}
          {item.updatedAt && item.updatedAt !== item.createdAt && (
            <span className="ml-2">
              (Обновлено: {formatDate(item.updatedAt)})
            </span>
          )}
        </p>

        <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
          <span className="text-muted-foreground">Нет фото</span>
        </div>

        <RevisionWarning item={item} />

        <Separator className="my-4" />

        <ItemParams item={item} />

        {item.description && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Описание</h3>
            <Separator />
            <p className="whitespace-pre-wrap">{item.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
