import { motion } from 'framer-motion';
import { Image as ImageIcon, Plus, Minus } from 'lucide-react';
import { formatPrice } from '../../utils/format';

interface ProductCardProps {
    item: any;
    cartCount: number;
    onAdd: (uuid: string) => void;
    onRemove: (uuid: string) => void;
    onClick: (item: any) => void;
}

export const ProductCard = ({
    item,
    cartCount,
    onAdd,
    onRemove,
    onClick
}: ProductCardProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="concordia-card p-3 flex gap-4 cursor-pointer active:scale-[0.98] transition-all bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md"
            onClick={() => onClick(item)}
        >
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                {item.produtoImagem ? (
                    <img
                        src={item.produtoImagem}
                        className="w-full h-full object-cover"
                        alt={item.produtoNome}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
                        <ImageIcon size={24} strokeWidth={1} />
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-between flex-grow py-1">
                <div>
                    <h4 className="font-bold text-[#2D3436] text-[15px] leading-tight line-clamp-2 break-words overflow-hidden">{item.produtoNome}</h4>
                </div>
                <div className="flex justify-between items-end">
                    <span className="font-bold text-[#2D3436]">
                        {formatPrice(item.produtoPreco || 0)}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {cartCount > 0 ? (
                            <motion.div 
                                initial={{ width: 40 }}
                                animate={{ width: 'auto' }}
                                className="flex items-center gap-3 bg-gray-100/80 px-2 py-1.5 rounded-xl border border-gray-200"
                            >
                                <button 
                                    onClick={() => onRemove(item.uuid)}
                                    className="w-7 h-7 flex items-center justify-center text-[var(--primary)] hover:bg-white rounded-lg transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-bold min-w-[12px] text-center">{cartCount}</span>
                                <button 
                                    onClick={() => onAdd(item.uuid)}
                                    className="w-7 h-7 flex items-center justify-center text-[var(--primary)] hover:bg-white rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => onAdd(item.uuid)}
                                className="bg-gray-100 w-10 h-10 rounded-full text-[var(--primary)] hover:bg-gray-200 flex items-center justify-center transition-all active:scale-90"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
