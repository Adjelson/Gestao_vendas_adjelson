import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export const useDashboardSummary = () => {
    return useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/summary'); // Fixed URL to match new routes
            return data;
        }
    });
};

export const useForecast = () => {
    return useQuery({
        queryKey: ['forecast'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/forecast');
            return data;
        }
    });
};

export const useSellerPerformance = () => {
    return useQuery({
        queryKey: ['seller-performance'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/performance/sellers');
            return data;
        }
    });
};

export const useTopCustomers = () => {
    return useQuery({
        queryKey: ['top-customers'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/performance/customers');
            return data;
        }
    });
};
