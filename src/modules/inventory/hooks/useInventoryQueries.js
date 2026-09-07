import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';

// Fetch Inventory Stock Levels
export const useInventoryQuery = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await axiosInstance.get('/inventory');
      return response.data?.data || response.data || [];
    },
  });
};

// Stock Adjustment Mutation
export const useAdjustStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, newQuantity }) => {
      const response = await axiosInstance.post('/inventory/adjust', { productId, newQuantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
