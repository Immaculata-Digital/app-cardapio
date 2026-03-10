import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Plus, Minus, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { AppleModal } from '../common/AppleModal';
import { formatPrice } from '../../utils/format';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    cartCount: number;
    onAdd: (uuid: string) => void;
    onRemove: (uuid: string) => void;
    relatedItems: any[];
    onRelatedClick: (item: any) => void;
}

export const ProductModal = ({
    isOpen,
    onClose,
    product,
    cartCount,
    onAdd,
    onRemove,
    relatedItems,
    onRelatedClick
}: ProductModalProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const relatedRef = useRef<HTMLDivElement>(null);
    const [activeProduct, setActiveProduct] = useState<any>(null);

    const scrollRelated = (direction: 'left' | 'right') => {
        if (!relatedRef.current) return;
        const scrollAmount = 300;
        relatedRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // Sync activeProduct only when product is present
    // This allows the modal to keep showing content during the exit animation
    useEffect(() => {
        if (product) {
            setActiveProduct(product);
        }
    }, [product]);

    // Scroll to top when product uuid changes
    useEffect(() => {
        if (product?.uuid && isOpen) {
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [product?.uuid, isOpen]);

    // Use activeProduct for rendering, but check isOpen for the modal itself
    if (!activeProduct) return null;

    const fichaTecnica = activeProduct.fichaTecnica || [];
    const getFichaValue = (keys: string[]) => {
        const item = fichaTecnica.find((f: any) => keys.includes(f.chave?.toLowerCase().trim()));
        return item ? item.valor : null;
    };

    const descricao = getFichaValue(['descrição', 'descricao']) || activeProduct.produtoDescricao;
    const preparo = getFichaValue(['preparo', 'tempo de preparo', 'tempo']);

    return (
        <AppleModal
            ref={scrollRef}
            isOpen={isOpen}
            onClose={onClose}
            stickyFooter={
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-3.5 rounded-2xl border border-gray-200">
                        <button 
                            onClick={() => onRemove(activeProduct.uuid)}
                            className="text-[var(--primary)] active:scale-90 transition-transform"
                        >
                            <Minus className="w-5 h-5" />
                        </button>
                        <span className="font-black text-lg min-w-[20px] text-center">
                            {cartCount}
                        </span>
                        <button 
                            onClick={() => onAdd(activeProduct.uuid)}
                            className="text-[var(--primary)] active:scale-90 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            if (cartCount === 0) onAdd(activeProduct.uuid);
                            onClose();
                        }}
                        className="flex-grow bg-[var(--primary)] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-[15px]"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Confirmar
                    </button>
                </div>
            }
        >
            <div className="space-y-8">
                {/* Image Container */}
                <div className="relative aspect-square md:aspect-auto md:h-[300px] w-full rounded-3xl overflow-hidden bg-gray-50 drop-shadow-sm border border-gray-100">
                    {activeProduct.produtoImagem ? (
                        <img
                            src={activeProduct.produtoImagem}
                            className="w-full h-full object-cover"
                            alt={activeProduct.produtoNome}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                            <ImageIcon size={48} strokeWidth={1} />
                            <span className="text-sm">Sem imagem disponível</span>
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div>
                    <h2 className="text-3xl font-black text-[#2D3436] tracking-tight mb-4">
                        {activeProduct.produtoNome}
                    </h2>
                    {descricao && (
                        <p className="text-[#2D3436]/60 leading-relaxed text-lg">
                            {descricao}
                        </p>
                    )}
                </div>

                {/* Info Blocks */}
                <div className={`grid ${preparo ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {preparo && (
                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Preparo</span>
                            </div>
                            <div className="text-[#2D3436] font-bold text-xl">
                                {preparo}
                            </div>
                        </div>
                    )}
                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-2">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Preço</span>
                        </div>
                        <div className="text-[#2D3436] font-bold text-xl">
                            {formatPrice(activeProduct.produtoPreco || 0)}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {relatedItems.length > 0 && (
                    <div className="pt-4 pb-8 relative">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">VEJA TAMBÉM</h3>
                        
                        <div 
                            ref={relatedRef}
                            className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2 scroll-smooth"
                        >
                            {relatedItems.map((related: any) => (
                                <div 
                                    key={related.uuid} 
                                    className="flex-shrink-0 w-40 cursor-pointer group"
                                    onClick={() => onRelatedClick(related)}
                                >
                                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 group-active:scale-95 transition-all shadow-sm">
                                        {related.produtoImagem ? (
                                            <img src={related.produtoImagem} className="w-full h-full object-cover" alt={related.produtoNome} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <h5 className="font-bold text-[#2D3436] line-clamp-1 text-sm">{related.produtoNome}</h5>
                                    <p className="text-xs font-bold text-[var(--primary)]">{formatPrice(related.produtoPreco || 0)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows (Desktop Only) */}
                        <div className="hidden md:flex absolute bottom-0 right-0 gap-2 pb-4">
                            <button 
                                onClick={() => scrollRelated('left')}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-90 transition-all text-gray-400 hover:text-[var(--primary)]"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => scrollRelated('right')}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-90 transition-all text-gray-400 hover:text-[var(--primary)]"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppleModal>
    );
};
