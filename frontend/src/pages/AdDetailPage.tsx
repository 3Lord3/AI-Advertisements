import { useParams } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getItem } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { ItemCard } from '@/components/ads/ItemCard';

export function AdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);

  const { data } = useSuspenseQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
  });

  const item = data?.item;

  if (!item) {
    throw new Error('Объявление не найдено');
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Объявление" backLink="/ads" />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <ItemCard item={item} />
        </div>
      </main>
    </div>
  );
}
