import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';

// Fetch Store Invoices & Bills
export const useInvoicesQuery = () => {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/bills');
        return response.data.data;
      } catch (error) {
        return [
          { id: 'INV-10025', customer: 'Rahul Electronics', date: '25 May 2025', total: '₹12,540', status: 'Paid' },
          { id: 'INV-10024', customer: 'Sharma Traders', date: '24 May 2025', total: '₹8,750', status: 'Paid' },
          { id: 'INV-10023', customer: 'Kumar Store', date: '24 May 2025', total: '₹6,300', status: 'Unpaid' },
        ];
      }
    },
  });
};

// Create Bill / Invoice Mutation
export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billData) => {
      const response = await axiosInstance.post('/bills', billData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
};
