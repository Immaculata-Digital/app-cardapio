import { useQuery } from '@tanstack/react-query';
import { cardapioService } from '../services/api';

export const useOrders = (tenantId: string | null, whatsapp: string) => {
    return useQuery({
        queryKey: ['my-orders', tenantId, whatsapp],
        queryFn: async () => {
            const res = await cardapioService.getMyOrders(tenantId!, whatsapp);
            return res.data;
        },
        enabled: !!tenantId && !!whatsapp && whatsapp.length >= 10,
        refetchInterval: 10000, 
    });
};
