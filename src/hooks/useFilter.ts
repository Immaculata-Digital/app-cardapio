import { useState, useMemo } from 'react';

export const useFilter = (items: any[], categories: any[]) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'alphabetical' | 'price-asc' | 'price-desc'>('alphabetical');
    const [searchTerm, setSearchTerm] = useState('');

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category]
        );
    };

    const filteredAndSortedItems = useMemo(() => {
        let result = items.filter((item: any) => 
            item.produtoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.produtoDescricao && item.produtoDescricao.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Sorting logic
        result = [...result].sort((a: any, b: any) => {
            if (sortBy === 'alphabetical') return a.produtoNome.localeCompare(b.produtoNome);
            if (sortBy === 'price-asc') return (a.produtoPreco || 0) - (b.produtoPreco || 0);
            if (sortBy === 'price-desc') return (b.produtoPreco || 0) - (a.produtoPreco || 0);
            return 0;
        });

        return result;
    }, [items, searchTerm, sortBy]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredAndSortedItems.forEach((item: any) => {
            const catName = item.categoriaNome || item.categoriaCode || 'Outros';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(item);
        });
        return groups;
    }, [filteredAndSortedItems]);

    const displayGroups = useMemo(() => {
        if (selectedCategories.length === 0) return groupedItems;
        
        const filteredGroups: Record<string, any[]> = {};
        selectedCategories.forEach(cat => {
            if (groupedItems[cat]) filteredGroups[cat] = groupedItems[cat];
        });
        return filteredGroups;
    }, [selectedCategories, groupedItems]);

    const categoryOptions = useMemo(() => {
        const itemCategories = Object.keys(groupedItems);
        const ordered = categories
            .map((c: any) => c.name)
            .filter((name: string) => itemCategories.includes(name));
        const others = itemCategories.filter(name => !ordered.includes(name));
        return [...ordered, ...others];
    }, [groupedItems, categories]);

    const resetFilters = () => {
        setSelectedCategories([]);
        setSortBy('alphabetical');
        setSearchTerm('');
    };

    return {
        selectedCategories,
        setSelectedCategories,
        toggleCategory,
        sortBy,
        setSortBy,
        searchTerm,
        setSearchTerm,
        displayGroups,
        categoryOptions,
        resetFilters
    };
};
