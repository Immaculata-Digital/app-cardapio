import { ShoppingBag, Utensils, History } from 'lucide-react';

interface BrandHeaderProps {
    brandConfig: any;
    totalItems: number;
    totalOrders: number;
    onCartClick: () => void;
    onHistoryClick: () => void;
}

export const BrandHeader = ({
    brandConfig,
    totalItems,
    totalOrders,
    onCartClick,
    onHistoryClick
}: BrandHeaderProps) => {
    return (
        <header className="px-6 py-5 bg-[#F9FDFD]">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {brandConfig?.logo?.principal ? (
                        <img src={brandConfig.logo.principal} alt={brandConfig.name} className="w-20 h-10 rounded-xl object-contain bg-white p-1 shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center">
                            <Utensils className="w-5 h-5" />
                        </div>
                    )}
                    {!brandConfig?.logo?.principal && (
                        <h2 className="text-xl font-black text-[var(--primary)] tracking-tight">
                            {brandConfig?.name || "Cardápio"}
                        </h2>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    {totalOrders > 0 && (
                        <>
                            <button 
                                onClick={onHistoryClick}
                                className="relative p-2 text-gray-400 hover:text-[var(--primary)] active:scale-95 transition-all"
                            >
                                <History className="w-6 h-6" />
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-gray-400 text-white rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black px-1">
                                    {totalOrders}
                                </span>
                            </button>
                            
                            <div className="w-px h-6 bg-gray-100 mx-1" />
                        </>
                    )}

                    <button 
                        onClick={onCartClick}
                        className="relative p-2 text-[var(--primary)] active:scale-95 transition-transform"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};
