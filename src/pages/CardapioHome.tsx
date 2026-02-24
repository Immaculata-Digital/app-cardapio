import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, Plus, Minus, Search } from 'lucide-react';
import { cardapioService } from '../services/api';

// Mock data for UI testing if API is not ready
const MOCK_ITEMS = [
    { id: '1', nome: 'Hambúrguer Clássico', descricao: 'Pão brioche, blend 180g, queijo cheddar, alface e tomate.', preco: 38.00, categoria: 'Burgers', imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
    { id: '2', nome: 'Batata Rústica', descricao: 'Batatas temperadas com alecrim e páprica, servidas com maionese da casa.', preco: 22.00, categoria: 'Acompanhamentos', imagem: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&auto=format&fit=crop&q=60' },
    { id: '3', nome: 'Coca-Cola 350ml', descricao: 'Lata gelada.', preco: 7.00, categoria: 'Bebidas', imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60' },
];

const CATEGORIES = ['Destaques', 'Burgers', 'Acompanhamentos', 'Bebidas', 'Sobremesas'];

const CardapioHome = () => {
    const [searchParams] = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const mesaUuid = searchParams.get('mesaUuid');

    const [selectedCategory, setSelectedCategory] = useState('Destaques');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [isCartOpen, setIsCartOpen] = useState(false);

    /*
    const { data: items = MOCK_ITEMS } = useQuery({
      queryKey: ['cardapio', tenantId],
      queryFn: () => cardapioService.getMenu(tenantId!),
      enabled: !!tenantId
    });
    */
    const items = MOCK_ITEMS;

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((acc, [id, qty]) => {
        const item = items.find(i => i.id === id);
        return acc + (item?.preco || 0) * qty;
    }, 0);

    const addToCart = (id: string) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[id] > 1) newCart[id]--;
            else delete newCart[id];
            return newCart;
        });
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="glass-header px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Caldápio</h1>
                        <p className="text-gray-500 text-sm">Mesa {mesaUuid?.slice(0, 4) || '01'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                        <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=60" alt="Restaurant Logo" />
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="O que você deseja hoje?"
                        className="w-full bg-[#e3e3e6] border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-apple-blue transition-all"
                    />
                </div>
            </header>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar px-6 py-4 gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedCategory === cat
                                ? 'bg-apple-dark text-white'
                                : 'bg-white text-gray-500'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <main className="px-6 grid gap-6">
                <h2 className="text-xl font-semibold mt-4 mb-2">{selectedCategory}</h2>
                {items.filter(i => selectedCategory === 'Destaques' || i.categoria === selectedCategory).map(item => (
                    <motion.div
                        layout
                        key={item.id}
                        className="apple-card flex p-3 gap-4"
                    >
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-semibold text-lg">{item.nome}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2">{item.descricao}</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-apple-blue">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                </span>
                                <button
                                    onClick={() => addToCart(item.id)}
                                    className="bg-apple-dark text-white p-2 rounded-lg active:scale-90 transition-transform"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </main>

            {/* Floating Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-6 right-6 z-50"
                    >
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full bg-apple-dark text-white p-4 rounded-full flex justify-between items-center shadow-2xl active:scale-95 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-apple-blue w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                                    {totalItems}
                                </div>
                                <span className="font-medium">Ver Sacola</span>
                            </div>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer (Simplified as a Modal) */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-8 z-[70] max-h-[80vh] overflow-y-auto"
                        >
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
                            <h2 className="text-2xl font-bold mb-6">Sua Sacola</h2>

                            <div className="space-y-6 mb-10">
                                {Object.entries(cart).map(([id, qty]) => {
                                    const item = items.find(i => i.id === id)!;
                                    return (
                                        <div key={id} className="flex justify-between items-center">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                    <img src={item.imagem} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{item.nome}</h4>
                                                    <p className="text-gray-500 text-sm">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-xl">
                                                <button onClick={() => removeFromCart(id)} className="p-1 hover:text-apple-blue"><Minus className="w-4 h-4" /></button>
                                                <span className="font-bold min-w-[1.5rem] text-center">{qty}</span>
                                                <button onClick={() => addToCart(id)} className="p-1 hover:text-apple-blue"><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-gray-100 pt-6 mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
                                </div>
                            </div>

                            <button
                                className="w-full bg-apple-blue text-white p-5 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                                onClick={() => window.location.href = '/success'}
                            >
                                Confirmar Pedido
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CardapioHome;
