import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, Send, Ghost } from 'lucide-react';
import { AppleModal } from '../common/AppleModal';
import { formatPrice } from '../../utils/format';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: Record<string, number>;
    items: any[];
    onAdd: (uuid: string) => void;
    onRemove: (uuid: string) => void;
    onClear: () => void;
    totalPrice: number;
    onSubmit: () => void;
    isSubmitting: boolean;
    clienteNome: string;
    onNomeChange: (value: string) => void;
    whatsapp: string;
    onWhatsappChange: (value: string) => void;
    isNameFromStorage?: boolean;
    isWhatsappFromStorage?: boolean;
}

export const CartModal = ({
    isOpen,
    onClose,
    cart,
    items,
    onAdd,
    onRemove,
    onClear,
    totalPrice,
    onSubmit,
    isSubmitting,
    clienteNome,
    onNomeChange,
    whatsapp,
    onWhatsappChange,
    isNameFromStorage,
    isWhatsappFromStorage
}: CartModalProps) => {
    const cartItems = Object.entries(cart).map(([uuid, qty]) => {
        const item = items.find((i: any) => i.uuid === uuid);
        return { ...item, qty };
    }).filter(i => i.uuid);

    const isFormValid = clienteNome.trim().length > 2 && whatsapp.trim().length >= 10;

    return (
        <AppleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Sua Sacola"
            stickyFooter={cartItems.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span className="text-[var(--primary)] font-black">{formatPrice(totalPrice)}</span>
                    </div>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting || !isFormValid}
                        className={`w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${isFormValid ? 'bg-[var(--primary)] text-white shadow-[var(--primary)]/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Confirmar Pedido
                                <Send className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            )}
        >
            <div className="space-y-6">
                {cartItems.length > 0 ? (
                    <>
                        {/* Items Section */}
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{cartItems.length} ITENS</span>
                            <button onClick={onClear} className="text-red-500 text-xs font-bold flex items-center gap-1.5 p-2 active:scale-95 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                                Limpar Sacola
                            </button>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.uuid}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="apple-card p-4 flex gap-4 border border-gray-50 bg-white rounded-2xl shadow-sm"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                                            {item.image_url ? (
                                                <img src={item.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between flex-grow py-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-[#2D3436] text-sm leading-tight pr-4">{item.nome}</h4>
                                                <span className="font-black text-[var(--primary)] text-sm whitespace-nowrap">
                                                    {formatPrice((item.precos?.preco || 0) * item.qty)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-gray-50 self-start px-2 py-1 rounded-xl border border-gray-100 mt-2">
                                                <button
                                                    onClick={() => onRemove(item.uuid)}
                                                    className="w-8 h-8 flex items-center justify-center text-[var(--primary)] hover:bg-white rounded-lg transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-bold min-w-[20px] text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => onAdd(item.uuid)}
                                                    className="w-8 h-8 flex items-center justify-center text-[var(--primary)] hover:bg-white rounded-lg transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* User Info Section */}
                        <div className="pt-6 border-t border-gray-100 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                                    Seu Nome (Para a comanda)
                                </label>
                                <input
                                    type="text"
                                    value={clienteNome}
                                    onChange={(e) => onNomeChange(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    disabled={isSubmitting || isNameFromStorage}
                                    className={`w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 focus:ring-0 focus:border-[var(--primary)] transition-all font-medium ${isNameFromStorage ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                                    Seu WhatsApp (Referência)
                                </label>
                                <input
                                    type="tel"
                                    value={whatsapp}
                                    onChange={(e) => onWhatsappChange(e.target.value)}
                                    placeholder="Ex: 11999999999"
                                    disabled={isSubmitting || isWhatsappFromStorage}
                                    className={`w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 focus:ring-0 focus:border-[var(--primary)] transition-all font-medium ${isWhatsappFromStorage ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Ghost className="w-10 h-10 text-gray-300" strokeWidth={1} />
                        </div>
                        <h3 className="text-xl font-bold text-[#2D3436] mb-2">Sua sacola está vazia</h3>
                        <p className="text-gray-400 px-10">Que tal explorar nosso cardápio e adicionar algumas delícias?</p>
                        <button
                            onClick={onClose}
                            className="mt-8 text-[var(--primary)] font-bold flex items-center gap-2 py-3 px-6 bg-[var(--primary)]/5 rounded-2xl active:scale-95 transition-all"
                        >
                            Explorar Cardápio
                        </button>
                    </div>
                )}
            </div>
        </AppleModal>
    );
};
