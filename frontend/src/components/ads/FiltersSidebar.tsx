import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdsStore } from '@/lib/store';
import { CATEGORY_LABELS, ItemCategory } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export function FiltersSidebar() {
  const { filters, setFilters, resetFilters } = useAdsStore();
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);

  const handleCategoryChange = (category: string) => {
    const categories = filters.categories;
    if (categories.includes(category as ItemCategory)) {
      setFilters({ categories: categories.filter((c) => c !== category) });
    } else {
      setFilters({ categories: [...categories, category as ItemCategory] });
    }
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.needsRevision;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4 min-h-[2rem]">
            <h2 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Фильтры
            </h2>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setCategoriesCollapsed(!categoriesCollapsed)}
              className="flex items-center justify-between w-full text-sm font-medium hover:text-foreground/80 transition-colors cursor-pointer"
            >
              <span>Категория</span>
              {categoriesCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
            {!categoriesCollapsed && (
              <div className="space-y-2">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${value}`}
                      checked={filters.categories.includes(value as ItemCategory)}
                      onCheckedChange={() => handleCategoryChange(value)}
                    />
                    <Label
                      htmlFor={`category-${value}`}
                      className="text-sm cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="needs-revision"
                className="text-sm cursor-pointer flex items-center gap-2"
              >
                Только требующие доработок
              </Label>
              <Switch
                id="needs-revision"
                checked={filters.needsRevision}
                onCheckedChange={(checked) => setFilters({ needsRevision: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasActiveFilters && (
        <button 
          type="button"
          onClick={resetFilters}
          className="w-full bg-white text-muted-foreground hover:text-foreground px-4 py-2 rounded-md border border-input text-sm transition-colors"
        >
          Сбросить фильтры
        </button>
      )}
    </aside>
  );
}
