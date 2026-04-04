/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem } from '@/lib/api';
import { useAdsStore } from '@/lib/store';
import { useDebounce } from './useDebounce';
import { ItemCategory, AutoItemParams, RealEstateItemParams, ElectronicsItemParams, Item } from '@/types';

interface FormData {
  category: ItemCategory;
  title: string;
  price: number;
  description: string;
  params: Record<string, string | number>;
}

const initialFormData: FormData = {
  category: 'electronics',
  title: '',
  price: 0,
  description: '',
  params: {},
};

interface UseAdFormReturn {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isLoading: boolean;
  error: boolean;
  itemId: number;
  item?: Item;
  updateMutation: {
    isPending: boolean;
    isError: boolean;
  };
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
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

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const userHasModified = useRef(false);

  // Обновляем форму когда загружается item, только если пользователь не изменял её
  useEffect(() => {
    if (item && !userHasModified.current) {
      setFormData({
        category: item.category,
        title: item.title,
        price: item.price || 0,
        description: item.description || '',
        params: item.params as Record<string, string | number>,
      });
    }
  }, [item]);

  const isInitialized = !!item;

  // Debounced save to store
  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    if (!isInitialized || !itemId || !debouncedFormData.title) return;
    saveDraft(itemId, {
      category: debouncedFormData.category,
      title: debouncedFormData.title,
      price: debouncedFormData.price,
      description: debouncedFormData.description,
      params: debouncedFormData.params as AutoItemParams | RealEstateItemParams | ElectronicsItemParams,
    });
  }, [debouncedFormData, itemId, saveDraft, clearDraft, isInitialized]);

  const updateMutation = useMutation({
    mutationFn: () => updateItem(itemId, {
      category: formData.category,
      title: formData.title,
      price: formData.price,
      description: formData.description,
      params: formData.params as AutoItemParams | RealEstateItemParams | ElectronicsItemParams,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      clearDraft(itemId);
      navigate(`/ads/${itemId}`);
    },
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    updateMutation.mutate();
  };

  const handleCategoryChange = (category: ItemCategory) => {
    userHasModified.current = true;
    setFormData({ ...formData, category, params: {} });
  };

  const handleParamChange = (key: string, value: string | number) => {
    userHasModified.current = true;
    setFormData({ ...formData, params: { ...formData.params, [key]: value } });
  };

  return {
    formData,
    setFormData,
    isLoading: false,
    error: false,
    itemId,
    item,
    updateMutation: { isPending: updateMutation.isPending, isError: updateMutation.isError },
    handleSubmit,
    handleCategoryChange,
    handleParamChange,
  };
}
