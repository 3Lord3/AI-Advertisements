import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getItems } from '@/lib/api';
import { useAdsStore } from '@/store';
import { AdsListHeader } from '@/components/ads/AdsListHeader';
import { FiltersSidebar } from '@/components/ads/FiltersSidebar';
import { AdsGrid } from '@/components/ads/AdsGrid';
import { AdsPagination } from '@/components/ads/AdsPagination';
import { Card, CardContent } from '@/components/ui/card';

export function AdsListPage() {
  const { filters, page, setPage, limit, sortColumn, sortDirection } = useAdsStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const queryParams = {
    q: filters.search || undefined,
    limit,
    skip: (page - 1) * limit,
    needsRevision: filters.needsRevision || undefined,
    categories: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
    sortColumn,
    sortDirection,
  };

  const { data } = useSuspenseQuery({
    queryKey: ['items', queryParams],
    queryFn: () => getItems(queryParams),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="container mx-auto px-4 py-4">
          <AdsListHeader 
            total={data?.total || 0} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-6 lg:flex-row">
          <FiltersSidebar />

          <main className="flex-1">
            {!data || data.items.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Объявления не найдены
                    </CardContent>
                  </Card>
                ) : (
                  <AdsGrid items={data.items} viewMode={viewMode} />
                )}

                <AdsPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
          </main>
        </div>
      </div>
    </div>
  );
}
