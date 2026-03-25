import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CATEGORY_LABELS, ItemWithRevision } from '@/types';
import { formatDate } from '@/lib/dateUtils';
import { ItemParams } from './ItemParams';
import { RevisionWarning } from './RevisionWarning';

interface ItemCardProps {
  item: ItemWithRevision;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  {CATEGORY_LABELS[item.category]}
                </Badge>
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <div className="mt-4">
                  <Link to={`/ads/${item.id}/edit`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-2xl font-bold">{item.price?.toLocaleString('ru-RU')} ₽</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                Опубликовано: {formatDate(item.createdAt)}
              </p>
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <p className="text-sm text-muted-foreground">
                  Отредактировано: {formatDate(item.updatedAt)}
                </p>
              )}
            </div>

            {item.needsRevision && (
              <div className="mb-6">
                <RevisionWarning item={item} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="space-y-2">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Нет фото</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-video bg-muted rounded-md flex items-center justify-center"
                      >
                        <span className="text-muted-foreground text-xs">Нет фото</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <ItemParams item={item} />
              </div>
            </div>

            {item.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Описание</h3>
                <Separator />
                <p className="whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
