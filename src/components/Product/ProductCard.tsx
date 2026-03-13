import { motion } from 'framer-motion';
import { Image as ImageIcon, Plus, Minus, Clock } from 'lucide-react';
import { formatPrice } from '../../utils/format';

interface ProductCardProps {
    item: any;
    cartCount: number;
    onAdd: (uuid: string) => void;
    onRemove: (uuid: string) => void;
    onClick: (item: any) => void;
}

const getMinutes = (tempo: any): number | null => {
    if (!tempo) return null;
    if (typeof tempo === 'number') return tempo;
    if (typeof tempo === 'string') {
        const parts = tempo.split(':');
        if (parts.length === 3) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
        return parseInt(tempo, 10);
    }
    if (typeof tempo === 'object') {
        let mins = 0;
        if (tempo.hours) mins += tempo.hours * 60;
        if (tempo.minutes) mins += tempo.minutes;
        return mins > 0 ? mins : null;
    }
    return null;
};

export const ProductCard = ({
    item,
    cartCount,
    onAdd,
    onRemove,
    onClick
}: ProductCardProps) => {
    // Extract prep time handling different possible formats and locations
    const tempoMinRaw = item.tempo_preparo_min || item.tempoPreparo_min || item.cardapio?.tempo_preparo_min || item.cardapio?.tempoPreparo_min;
    const tempoMaxRaw = item.tempo_preparo_max || item.tempoPreparo_max || item.cardapio?.tempo_preparo_max || item.cardapio?.tempoPreparo_max;
    
    const minTempo = getMinutes(tempoMinRaw);
    const maxTempo = getMinutes(tempoMaxRaw);
    const exibirTempoPreparo = item.exibir_tempo_preparo ?? item.cardapio?.exibir_tempo_preparo ?? true;
    
    let tempoDisplay = '';
    if (minTempo && maxTempo && minTempo !== maxTempo) {
        tempoDisplay = `${minTempo}-${maxTempo} min`;
    } else if (minTempo || maxTempo) {
        tempoDisplay = `${minTempo || maxTempo} min`;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="concordia-card p-3 flex gap-4 cursor-pointer active:scale-[0.98] transition-all bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md"
            onClick={() => onClick(item)}
        >
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        className="w-full h-full object-cover"
                        alt={item.nome}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
                        <ImageIcon size={24} strokeWidth={1} />
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-between flex-grow py-1">
                <div>
                    <h4 className="font-bold text-[#2D3436] text-[15px] leading-tight line-clamp-2 break-words overflow-hidden">{item.nome}</h4>
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        {tempoDisplay && exibirTempoPreparo && (
                            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                                <Clock className="w-3 h-3" />
                                <span className="text-[11px] font-medium">{tempoDisplay}</span>
                            </div>
                        )}
                        <span className="font-bold text-[#2D3436]">
                            {formatPrice(item.precos?.preco || 0)}
                        </span>
                    </div>
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
