import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdsFilters, SortColumn, SortDirection, ItemUpdateInput } from '@/types';

interface AdsState {
  // Filters
  filters: AdsFilters;
  setFilters: (filters: Partial<AdsFilters>) => void;
  resetFilters: () => void;

  // Sorting
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  setSort: (column: SortColumn, direction: SortDirection) => void;

  // Pagination
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Draft storage for edit form
  drafts: Record<number, ItemUpdateInput>;
  saveDraft: (id: number, data: ItemUpdateInput) => void;
  getDraft: (id: number) => ItemUpdateInput | undefined;
  clearDraft: (id: number) => void;
}

const defaultFilters: AdsFilters = {
  search: '',
  categories: [],
  needsRevision: false,
};

export const useAdsStore = create<AdsState>()(
  persist(
    (set, get) => ({
      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          page: 1, // Reset to first page on filter change
        })),
      resetFilters: () =>
        set({
          filters: defaultFilters,
          page: 1,
        }),

      // Sorting
      sortColumn: 'createdAt',
      sortDirection: 'desc',
      setSort: (column, direction) =>
        set({
          sortColumn: column,
          sortDirection: direction,
        }),

      // Pagination
      page: 1,
      limit: 10,
      setPage: (page) => set({ page }),
      setLimit: (limit) => set({ limit, page: 1 }),

      // Drafts
      drafts: {},
      saveDraft: (id, data) =>
        set((state) => ({
          drafts: { ...state.drafts, [id]: data },
        })),
      getDraft: (id) => get().drafts[id],
      clearDraft: (id) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _deleted, ...rest } = state.drafts;
          return { drafts: rest };
        }),
    }),
    {
      name: 'ads-storage',
      partialize: (state) => ({
        filters: state.filters,
        sortColumn: state.sortColumn,
        sortDirection: state.sortDirection,
        page: state.page,
        limit: state.limit,
        drafts: state.drafts,
      }),
    }
  )
);
