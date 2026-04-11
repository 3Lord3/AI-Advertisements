import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem } from '@/lib/api';
import { useAdsStore } from '@/store';

import { adFormSchema, type AdFormData } from '@/lib/schemas';
import { AutoItemParams, RealEstateItemParams, ElectronicsItemParams, Item, ItemCategory } from '@/types';

interface UseAdFormReturn {
  form: ReturnType<typeof useForm<AdFormData>>;
  isLoading: boolean;
  error: boolean;
  itemId: number;
  item?: Item;
  updateMutation: {
    mutate: () => void;
    isPending: boolean;
    isError: boolean;
  };
  handleCategoryChange: (category: ItemCategory) => void;
  handleParamChange: (key: string, value: string | number) => void;
}

export function useAdForm(): UseAdFormReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemId = Number(id);
  const { saveDraft, clearDraft } = useAdsStore();

  const { data } = useSuspenseQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
  });

  const item = data?.item as Item | undefined;

  const form = useForm<AdFormData>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      category: 'electronics' as ItemCategory,
      title: '',
      price: 0,
      description: '',
      params: {},
    },
  });

  const { watch, setValue, reset } = form;

  // Update form when item loads
  useEffect(() => {
    if (item) {
      reset({
        category: item.category,
        title: item.title,
        price: item.price || 0,
        description: item.description || '',
        params: item.params as Record<string, string | number>,
      });
    }
  }, [item, reset]);

  const isInitialized = !!item;

  // Memoized form data with proper debounce using useRef
  const debouncedFormDataRef = useRef<AdFormData | null>(null);
  const [debouncedFormData, setDebouncedFormData] = useState<AdFormData | null>(null);

  // Watch form values and debounce them
  const formValues = watch();
  useEffect(() => {
    debouncedFormDataRef.current = formValues;
    const timer = setTimeout(() => {
      setDebouncedFormData(debouncedFormDataRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, [formValues]);

  // Save draft when debounced data changes
  useEffect(() => {
    if (!isInitialized || !itemId || !debouncedFormData?.title) return;
    saveDraft(itemId, {
      category: debouncedFormData.category,
      title: debouncedFormData.title,
      price: debouncedFormData.price,
      description: debouncedFormData.description,
      params: debouncedFormData.params as AutoItemParams | RealEstateItemParams | ElectronicsItemParams,
    });
  }, [debouncedFormData, itemId, saveDraft, isInitialized]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!debouncedFormData) {
        throw new Error('Form data not available');
      }
      return updateItem(itemId, {
        category: debouncedFormData.category,
        title: debouncedFormData.title,
        price: debouncedFormData.price,
        description: debouncedFormData.description,
        params: debouncedFormData.params as AutoItemParams | RealEstateItemParams | ElectronicsItemParams,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      clearDraft(itemId);
      navigate(`/ads/${itemId}`);
    },
  });

  const handleCategoryChange = (category: ItemCategory) => {
    setValue('category', category, { shouldDirty: true });
    setValue('params', {});
  };

  const handleParamChange = (key: string, value: string | number) => {
    const currentParams = watch('params') || {};
    setValue('params', { ...currentParams, [key]: value }, { shouldDirty: true });
  };

  return {
    form,
    isLoading: false,
    error: false,
    itemId,
    item,
    updateMutation: {
      mutate: () => mutation.mutate(),
      isPending: mutation.isPending,
      isError: mutation.isError,
    },
    handleCategoryChange,
    handleParamChange,
  };
}
