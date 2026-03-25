import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABELS, ListItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdCardProps {
  item: ListItem;
  viewMode?: 'grid' | 'list';
}

export function AdCard({ item, viewMode = 'grid' }: AdCardProps) {
  const navigate = useNavigate();

  // List view layout
  if (viewMode === 'list') {
    return (
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md flex flex-row"
        onClick={() => navigate(`/ads/${item.id}`)}
      >
        <div className="w-32 h-24 bg-muted rounded-l-md flex items-center justify-center select-none shrink-0">
          <span className="text-muted-foreground text-xs">Нет фото</span>
        </div>
        <CardContent className="p-4 pl-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Badge variant="secondary" className="select-none text-xs">
                {CATEGORY_LABELS[item.category]}
              </Badge>
              {item.needsRevision && (
                <Badge
                  variant="outline"
                  className="text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 w-fit text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 mr-1.5"></span>
                  Требует доработки
                </Badge>
              )}
            </div>
            <h3 className="font-medium line-clamp-1 select-none">{item.title}</h3>
          </div>
          <div>
            <p className="text-lg font-bold select-none">
              {item.price?.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view layout
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md flex flex-col h-full"
      onClick={() => navigate(`/ads/${item.id}`)}
    >
      <div className="aspect-video bg-muted rounded-t-md flex items-center justify-center select-none w-full">
        <span className="text-muted-foreground text-sm">Нет фото</span>
      </div>

      <CardContent className="p-0 px-4 flex-1">
        <Badge variant="secondary" className="select-none text-xs mb-1">
          {CATEGORY_LABELS[item.category]}
        </Badge>
        <h3 className="font-medium line-clamp-2 mb-1 select-none">{item.title}</h3>

        <p className="text-lg font-bold select-none">
          {item.price?.toLocaleString('ru-RU')} ₽
        </p>

        {item.needsRevision && (
          <Badge
            variant="outline"
            className="text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 w-fit text-xs mt-1"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 mr-1.5"></span>
            Требует доработки
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
