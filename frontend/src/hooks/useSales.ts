import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useSales = (filters?: any) => {
    return useQuery({
        queryKey: ['sales', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const { data } = await api.get(`/sales?${params}`);
            return data;
        }
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newSale: any) => {
            const { data } = await api.post('/sales', newSale);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); // Update dashboard too
        }
    });
};
