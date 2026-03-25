import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getItem } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { PageHeader } from '@/components/ui/PageHeader';
import { ItemCard } from '@/components/ads/ItemCard';

export function AdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
    enabled: !isNaN(itemId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data?.item) {
    return <ErrorMessage message="Объявление не найдено" />;
  }

  const item = data.item;

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
