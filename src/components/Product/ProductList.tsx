import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface ProductListProps {
    displayGroups: Record<string, any[]>;
    cart: Record<string, number>;
    onAdd: (uuid: string) => void;
    onRemove: (uuid: string) => void;
    onProductClick: (item: any) => void;
    searchTerm: string;
    hasActiveFilters: boolean;
}

export const ProductList = ({
    displayGroups,
    cart,
    onAdd,
    onRemove,
    onProductClick,
    searchTerm,
    hasActiveFilters
}: ProductListProps) => {
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    // Quando houver busca ou filtros ativos, expande tudo automaticamente
    useEffect(() => {
        if (searchTerm.trim() || hasActiveFilters) {
            setCollapsedGroups({});
        }
    }, [searchTerm, hasActiveFilters]);

    const toggleGroup = (groupName: string) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    return (
        <main className="space-y-4 py-8">
            {Object.entries(displayGroups).map(([groupName, groupItems]) => {
                const isCollapsed = collapsedGroups[groupName] || false;
                
                return groupItems.length > 0 && (
                    <section key={groupName} className="px-6">
                        <button 
                            onClick={() => toggleGroup(groupName)}
                            className="w-full flex items-center justify-between py-2 group"
                        >
                            <h3 className="text-xl font-bold flex items-center gap-3 text-[#2D3436]">
                                {groupName}
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {groupItems.length}
                                </span>
                            </h3>
                            <motion.div
                                animate={{ rotate: isCollapsed ? -90 : 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="text-gray-400 group-hover:text-[var(--primary)] transition-colors"
                            >
                                <ChevronDown size={20} />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                                        {groupItems.map((item: any) => (
                                            <ProductCard 
                                                key={item.uuid}
                                                item={item}
                                                cartCount={cart[item.uuid] || 0}
                                                onAdd={onAdd}
                                                onRemove={onRemove}
                                                onClick={onProductClick}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                );
            })}
        </main>
    );
};
