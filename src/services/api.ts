import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3335/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export const cardapioService = {
    // We will need to implement public endpoints in the API
    getMenu: (tenantId: string) => api.get(`/public/cardapio?tenantId=${tenantId}`),
    getCategories: (tenantId: string) => api.get(`/public/categorias?tenantId=${tenantId}`),
    createOrder: (payload: any) => api.post('/public/pedidos', payload),
    getMyOrders: (tenantId: string, whatsapp: string) => api.get(`/public/pedidos/meus-pedidos?tenantId=${tenantId}&whatsapp=${whatsapp}`),
    getBrandConfig: (tenantId: string) => api.get(`/public/identidade-visual/${tenantId}`),
};
