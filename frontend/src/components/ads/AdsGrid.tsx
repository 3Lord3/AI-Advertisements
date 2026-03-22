import { ItemWithRevision } from '@/types';
import { AdCard } from './AdCard';

interface AdsGridProps {
  items: ItemWithRevision[];
}

export function AdsGrid({ items }: AdsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <AdCard key={item.id} item={item} />
      ))}
    </div>
  );
}
