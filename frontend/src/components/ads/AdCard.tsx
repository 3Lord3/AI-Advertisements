import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABELS, ItemWithRevision } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdCardProps {
  item: ItemWithRevision;
}

export function AdCard({ item }: AdCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md flex flex-col h-full"
      onClick={() => navigate(`/ads/${item.id}`)}
    >
      <CardContent className="p-4 flex-1">
        <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center select-none">
          <span className="text-muted-foreground text-sm">Нет фото</span>
        </div>

        <Badge variant="secondary" className="mb-2 select-none">
          {CATEGORY_LABELS[item.category]}
        </Badge>

        <h3 className="font-medium line-clamp-2 mb-1 select-none">{item.title}</h3>

        <p className="text-lg font-bold select-none">
          {item.price?.toLocaleString('ru-RU')} ₽
        </p>
      </CardContent>

      {item.needsRevision && (
        <CardFooter className="py-2 mt-auto">
          <div className="flex w-full items-center">
            <Badge
              variant="outline"
              className="text-orange-500 border-orange-200 bg-orange-50 w-fit"
            >
              Требует доработок
            </Badge>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
