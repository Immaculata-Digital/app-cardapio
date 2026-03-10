import { useQuery } from '@tanstack/react-query';
import { cardapioService } from '../services/api';
import { useEffect } from 'react';

export const useCardapioData = (tenantId: string | null) => {
    const { data: brandConfig, isLoading: loadingBrand } = useQuery({
        queryKey: ['brand-config', tenantId],
        queryFn: async () => {
            const res = await cardapioService.getBrandConfig(tenantId!);
            return res.data;
        },
        enabled: !!tenantId
    });

    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ['categories', tenantId],
        queryFn: async () => {
            const res = await cardapioService.getCategories(tenantId!);
            return res.data;
        },
        enabled: !!tenantId
    });

    const { data: items = [], isLoading: loadingItems } = useQuery({
        queryKey: ['cardapio', tenantId],
        queryFn: async () => {
            const res = await cardapioService.getMenu(tenantId!);
            return res.data;
        },
        enabled: !!tenantId
    });

    useEffect(() => {
        if (brandConfig?.palette?.primary) {
            document.documentElement.style.setProperty('--primary', brandConfig.palette.primary);
        }
        
        // Update Favicon and Title
        if (brandConfig?.logo?.icon) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = brandConfig.logo.icon;
        }

        if (brandConfig?.name) {
            document.title = brandConfig.name;
        }
    }, [brandConfig]);

    return {
        brandConfig,
        categories,
        items,
        isLoading: loadingBrand || loadingCategories || loadingItems
    };
};
