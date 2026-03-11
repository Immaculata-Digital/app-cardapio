import { useState, useMemo, useEffect } from 'react';

const getStorageKey = (tenantId?: string | null) => 
    tenantId ? `concordia:cart:${tenantId}` : 'concordia:cart';

export const useCart = (items: any[], tenantId?: string | null) => {
    const [cart, setCart] = useState<Record<string, number>>({});

    // Load initial state when tenantId is available
    useEffect(() => {
        if (!tenantId) return;
        try {
            const saved = localStorage.getItem(getStorageKey(tenantId));
            if (saved) {
                setCart(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }, [tenantId]);

    // Save changes
    useEffect(() => {
        if (!tenantId || Object.keys(cart).length === 0 && !localStorage.getItem(getStorageKey(tenantId))) return;
        localStorage.setItem(getStorageKey(tenantId), JSON.stringify(cart));
    }, [cart, tenantId]);

    const addToCart = (uuid: string) => {
        setCart(prev => ({
            ...prev,
            [uuid]: (prev[uuid] || 0) + 1
        }));
    };

    const removeFromCart = (uuid: string) => {
        setCart(prev => {
            const next = { ...prev };
            if (next[uuid] > 1) {
                next[uuid] -= 1;
            } else {
                delete next[uuid];
            }
            return next;
        });
    };

    const clearCart = () => setCart({});

    const totalItems = useMemo(() => 
        Object.values(cart).reduce((a, b) => a + b, 0), 
    [cart]);

    const totalPrice = useMemo(() => 
        Object.entries(cart).reduce((acc, [uuid, qty]) => {
            const item = items?.find((i: any) => i.uuid === uuid);
            return acc + (item?.precos?.preco || 0) * qty;
        }, 0), 
    [cart, items]);

    return {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice
    };
};
