import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem } from '@/lib/api';
import { useAdsStore } from '@/lib/store';
import { ItemCategory, AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from '@/types';

interface FormData {
  category: ItemCategory;
  title: string;
  price: number;
  description: string;
  params: Record<string, string | number>;
}

interface UseAdFormReturn {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isLoading: boolean;
  error: boolean;
  itemId: number;
  updateMutation: {
    isPending: boolean;
    isError: boolean;
  };
  handleSubmit: (e: React.FormEvent) => void;
  handleCategoryChange: (category: ItemCategory) => void;
  handleParamChange: (key: string, value: string | number) => void;
}

export function useAdForm(): UseAdFormReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemId = Number(id);
  const { saveDraft, clearDraft } = useAdsStore();

  const [formData, setFormData] = useState<FormData>({
    category: 'electronics',
    title: '',
    price: 0,
    description: '',
    params: {},
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
    enabled: !isNaN(itemId) && itemId > 0,
  });

  const item = data?.item;

  useEffect(() => {
    if (!isInitialized && item) {
      setFormData({
        category: item.category,
        title: item.title,
        price: item.price || 0,
        description: item.description || '',
        params: item.params as Record<string, string | number>,
      });
      setIsInitialized(true);
    }
  }, [item, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !itemId || !formData.title) return;
    const timer = setTimeout(() => {
      saveDraft(itemId, {
        category: formData.category,
        title: formData.title,
        price: formData.price,
        description: formData.description,
        params: formData.params as AutoItemParams | RealEstateItemParams | ElectronicsItemParams,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, itemId, saveDraft, clearDraft, isInitialized]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleCategoryChange = (category: ItemCategory) => {
    setFormData({ ...formData, category, params: {} });
  };

  const handleParamChange = (key: string, value: string | number) => {
    setFormData({ ...formData, params: { ...formData.params, [key]: value } });
  };

  return {
    formData,
    setFormData,
    isLoading,
    error: !!error,
    itemId,
    updateMutation: { isPending: updateMutation.isPending, isError: updateMutation.isError },
    handleSubmit,
    handleCategoryChange,
    handleParamChange,
  };
}
