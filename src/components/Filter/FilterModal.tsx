import { Check } from 'lucide-react';
import { AppleModal } from '../common/AppleModal';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryOptions: string[];
    selectedCategories: string[];
    onCategoryToggle: (category: string) => void;
    sortBy: 'alphabetical' | 'price-asc' | 'price-desc';
    onSortChange: (sort: 'alphabetical' | 'price-asc' | 'price-desc') => void;
    onReset: () => void;
}

export const FilterModal = ({
    isOpen,
    onClose,
    categoryOptions,
    selectedCategories,
    onCategoryToggle,
    sortBy,
    onSortChange,
    onReset
}: FilterModalProps) => {
    const hasFilters = selectedCategories.length > 0 || sortBy !== 'alphabetical';

    return (
        <AppleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Filtros"
            stickyFooter={
                <div className="flex gap-3">
                    {hasFilters && (
                        <button
                            onClick={onReset}
                            className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-bold text-lg active:scale-95 transition-all"
                        >
                            Limpar
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`py-5 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 ${hasFilters ? 'flex-[2] bg-[var(--primary)] text-white shadow-[var(--primary)]/20' : 'w-full bg-[var(--primary)] text-white shadow-[var(--primary)]/20'}`}
                    >
                        Aplicar Filtros
                    </button>
                </div>
            }
        >
            <div className="space-y-10">
                {/* Sort Section */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">ORDENAR POR</h3>
                    <div className="space-y-3">
                        {[
                            { id: 'alphabetical', label: 'Ordem Alfabética' },
                            { id: 'price-asc', label: 'Menor Preço' },
                            { id: 'price-desc', label: 'Maior Preço' }
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onSortChange(option.id as any)}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2 ${sortBy === option.id 
                                    ? 'bg-[var(--primary)]/5 border-[var(--primary)]/20 text-[var(--primary)] font-bold shadow-sm' 
                                    : 'bg-gray-50/50 border-transparent text-gray-600 hover:bg-gray-50'}`}
                            >
                                {option.label}
                                {sortBy === option.id && <Check className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Section */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">CATEGORIAS</h3>
                    <div className="flex flex-wrap gap-3">
                        {categoryOptions.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => onCategoryToggle(cat)}
                                className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${selectedCategories.includes(cat)
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </AppleModal>
    );
};
