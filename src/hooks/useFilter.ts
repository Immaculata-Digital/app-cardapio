import { useState, useMemo } from 'react';

export const useFilter = (items: any[], categories: any[]) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'alphabetical' | 'price-asc' | 'price-desc'>('alphabetical');
    const [searchTerm, setSearchTerm] = useState('');

    const toggleCategory = (category: string) => {
        setSelectedCategory(prev => prev === category ? null : category);
    };

    const filteredAndSortedItems = useMemo(() => {
        // Filtragem básica: Nome deve existir
        let result = (items || []).filter((item: any) => 
            item?.nome?.trim()
        );

        // Busca por termo
        if (searchTerm.trim()) {
            const normalizedSearch = searchTerm.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            result = result.filter((item: any) => {
                const normalizedNome = item.nome ? item.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
                const normalizedDesc = item.descricao ? item.descricao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
                return normalizedNome.includes(normalizedSearch) || normalizedDesc.includes(normalizedSearch);
            });
        }

        // Sorting logic
        result = [...result].sort((a: any, b: any) => {
            if (sortBy === 'alphabetical') return (a.nome || '').localeCompare(b.nome || '');
            if (sortBy === 'price-asc') return (a.precos?.preco || 0) - (b.precos?.preco || 0);
            if (sortBy === 'price-desc') return (b.precos?.preco || 0) - (a.precos?.preco || 0);
            return 0;
        });

        return result;
    }, [items, searchTerm, sortBy]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredAndSortedItems.forEach((item: any) => {
            const catName = item.categoria_nome || item.categoria_code || 'Outros';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(item);
        });
        return groups;
    }, [filteredAndSortedItems]);

    const displayGroups = useMemo(() => {
        // Se estiver buscando ou não houver filtro, mostra tudo
        if (searchTerm.trim() || !selectedCategory) return groupedItems;
        
        const filteredGroups: Record<string, any[]> = {};
        if (groupedItems[selectedCategory]) {
            filteredGroups[selectedCategory] = groupedItems[selectedCategory];
        }
        return filteredGroups;
    }, [selectedCategory, groupedItems, searchTerm]);

    const categoryOptions = useMemo(() => {
        const itemCategories = Object.keys(groupedItems);
        const ordered = categories
            .map((c: any) => c.name)
            .filter((name: string) => itemCategories.includes(name));
        const others = itemCategories.filter(name => !ordered.includes(name));
        return [...ordered, ...others];
    }, [groupedItems, categories]);

    const resetFilters = () => {
        setSelectedCategory(null);
        setSortBy('alphabetical');
        setSearchTerm('');
    };

    return {
        selectedCategory,
        setSelectedCategory,
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
