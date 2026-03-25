import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getItems } from '@/lib/api';
import { useAdsStore } from '@/lib/store';
import { AdsListHeader } from '@/components/ads/AdsListHeader';
import { FiltersSidebar } from '@/components/ads/FiltersSidebar';
import { AdsGrid } from '@/components/ads/AdsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationPrevious, 
  PaginationNext 
} from '@/components/ui/pagination';

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

  const { data, isLoading, error } = useQuery({
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
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}

            {error && (
              <Card className="border-destructive">
                <CardContent>
                  <p className="text-destructive">
                    Ошибка загрузки объявлений. Попробуйте позже.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && (
              <>
                {data?.items.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Объявления не найдены
                    </CardContent>
                  </Card>
                ) : (
                  <AdsGrid items={data?.items || []} viewMode={viewMode} />
                )}

                {totalPages > 1 && (
                  <Pagination className="mt-6 justify-start">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(page - 1)} 
                          disabled={page === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === page}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(page + 1)} 
                          disabled={page === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
