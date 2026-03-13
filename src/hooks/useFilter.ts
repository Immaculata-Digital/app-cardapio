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
            // Se houver campo ordem, ele tem prioridade absoluta na ordenação padrão
            if (a.ordem !== undefined && b.ordem !== undefined && a.ordem !== b.ordem) {
                return a.ordem - b.ordem;
            }

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
        if (searchTerm.trim() || !selectedCategory) {
            // Ordenar as chaves do grupo pela ordem das categorias
            const sortedGroups: Record<string, any[]> = {};
            
            // Pega as categorias ordenadas
            const sortedCats = [...categories]
                .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

            // Adiciona grupos na ordem correta
            sortedCats.forEach(cat => {
                const name = cat.nome || cat.name;
                if (name && groupedItems[name]) {
                    sortedGroups[name] = groupedItems[name];
                }
            });

            // Adiciona grupos que não estavam na lista de categorias ou não tinham nome (se houver)
            Object.keys(groupedItems).forEach(name => {
                if (!sortedGroups[name]) {
                    sortedGroups[name] = groupedItems[name];
                }
            });

            return sortedGroups;
        }
        
        const filteredGroups: Record<string, any[]> = {};
        if (groupedItems[selectedCategory]) {
            filteredGroups[selectedCategory] = groupedItems[selectedCategory];
        }
        return filteredGroups;
    }, [selectedCategory, groupedItems, searchTerm, categories]);

    const categoryOptions = useMemo(() => {
        const itemCategories = Object.keys(groupedItems);
        const ordered = [...categories]
            .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
            .map((c: any) => c.nome || c.name)
            .filter((name: string) => name && itemCategories.includes(name));
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
