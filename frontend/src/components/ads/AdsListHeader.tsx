import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useAdsStore } from '@/store';
import { useDebounce } from '@/hooks/useDebounce';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Сначала новые' },
  { value: 'createdAt-asc', label: 'Сначала старые' },
  { value: 'title-asc', label: 'По названию (А-Я)' },
  { value: 'title-desc', label: 'По названию (Я-А)' },
];

interface AdsListHeaderProps {
  total: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function AdsListHeader({ total, viewMode, onViewModeChange }: AdsListHeaderProps) {
  const { filters, setFilters, sortColumn, sortDirection, setSort } = useAdsStore();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const [column, direction] = value.split('-') as ['title' | 'createdAt', 'asc' | 'desc'];
    setSort(column, direction);
  };

  const currentSortOption = SORT_OPTIONS.find(
    (opt) => opt.value === `${sortColumn}-${sortDirection}`
  );

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h1 className="text-2xl font-bold">Мои объявления</h1>
        <p className="text-muted-foreground">{total} объявлений</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по названию..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pr-9"
            />
          </div>

          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select
              value={`${sortColumn}-${sortDirection}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>{currentSortOption?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
