import { ListItem } from '@/types';
import { AdCard } from './AdCard';

interface AdsGridProps {
  items: ListItem[];
  viewMode?: 'grid' | 'list';
}

export function AdsGrid({ items, viewMode = 'grid' }: AdsGridProps) {
  const gridClass = viewMode === 'list' 
    ? 'grid grid-cols-1 gap-4' 
    : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-5';
  
  return (
    <div className={gridClass}>
      {items.map((item) => (
        <AdCard key={item.id} item={item} viewMode={viewMode} />
      ))}
    </div>
  );
}
