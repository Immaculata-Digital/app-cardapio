import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, ChevronDown, Plus, Minus, Search, Image as ImageIcon, History, Clock } from 'lucide-react';
import { cardapioService } from '../services/api';

// Mock data for UI testing if API is not ready
const MOCK_ITEMS = [
    { id: '1', nome: 'Hambúrguer Clássico', descricao: 'Pão brioche, blend 180g, queijo cheddar, alface e tomate.', preco: 38.00, categoria: 'Burgers', imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
    { id: '2', nome: 'Batata Rústica', descricao: 'Batatas temperadas com alecrim e páprica, servidas com maionese da casa.', preco: 22.00, categoria: 'Acompanhamentos', imagem: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&auto=format&fit=crop&q=60' },
    { id: '3', nome: 'Coca-Cola 350ml', descricao: 'Lata gelada.', preco: 7.00, categoria: 'Bebidas', imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60' },
];

const CATEGORIES = ['Destaques', 'Burgers', 'Acompanhamentos', 'Bebidas', 'Sobremesas'];

const CardapioHome = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const mesaUuid = searchParams.get('mesaUuid');

    const [selectedCategory, setSelectedCategory] = useState<string>('Destaques');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);

    const [clienteNome, setClienteNome] = useState(() => localStorage.getItem('concordia:clienteNome') || '');
    const [whatsapp, setWhatsapp] = useState(() => localStorage.getItem('concordia:whatsapp') || '');

    // Track if these values were initially pulled from localStorage to disable them
    const [isNameFromStorage] = useState(() => !!localStorage.getItem('concordia:clienteNome'));
    const [isWhatsappFromStorage] = useState(() => !!localStorage.getItem('concordia:whatsapp'));

    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ['categories', tenantId],
        queryFn: async () => {
            const res = await cardapioService.getCategories(tenantId!);
            return res.data;
        },
        enabled: !!tenantId
    });

    const { data: items = [], isLoading: loadingItems } = useQuery({
        queryKey: ['cardapio', tenantId],
        queryFn: async () => {
            const res = await cardapioService.getMenu(tenantId!);
            return res.data;
        },
        enabled: !!tenantId
    });

    const { data: myOrders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['my-orders', tenantId, whatsapp],
        queryFn: async () => {
            const res = await cardapioService.getMyOrders(tenantId!, whatsapp);
            return res.data;
        },
        enabled: !!tenantId && !!whatsapp && whatsapp.length >= 10,
        refetchInterval: 10000 // Refresh every 10s to see status changes
    });

    const isLoadingData = loadingCategories || loadingItems;
    const isEmpty = !isLoadingData && items.length === 0;

    const groupedItems = useMemo(() => {
        const groups: Record<string, any[]> = {};
        items.forEach((item: any) => {
            const catName = item.categoriaNome || item.categoriaCode || 'Outros';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(item);
        });
        return groups;
    }, [items]);

    const categoryOptions = useMemo(() => {
        const itemCategories = Object.keys(groupedItems);
        const ordered = categories
            .map((c: any) => c.name)
            .filter((name: string) => itemCategories.includes(name));
        const others = itemCategories.filter(name => !ordered.includes(name));
        return ['Destaques', ...ordered, ...others];
    }, [groupedItems, categories]);

    const displayGroups = useMemo(() => {
        if (selectedCategory === 'Destaques') return groupedItems;
        return { [selectedCategory]: groupedItems[selectedCategory] || [] };
    }, [selectedCategory, groupedItems]);

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((acc, [uuid, qty]) => {
        const item = items.find((i: any) => i.uuid === uuid);
        return acc + (item?.produtoPreco || 0) * qty;
    }, 0);

    const addToCart = (uuid: string) => setCart(prev => ({ ...prev, [uuid]: (prev[uuid] || 0) + 1 }));
    const removeFromCart = (uuid: string) => setCart(prev => {
        const newCart = { ...prev };
        if (newCart[uuid] > 1) newCart[uuid]--;
        else delete newCart[uuid];
        return newCart;
    });

    const [isShipping, setIsShipping] = useState(false);

    const formatPrice = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!tenantId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Ops! QR Code Inválido</h1>
                <p className="text-gray-500">O link que você acessou não contém as informações necessárias.</p>
            </div>
        );
    }

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-apple-blue/20 border-t-apple-blue rounded-full mb-4"
                />
                <p className="text-gray-500 font-medium">Carregando cardápio...</p>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f5f5f7]">
                <div className="w-20 h-20 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Cardápio Vazio</h1>
                <p className="text-gray-500">Ainda não há itens disponíveis neste cardápio.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Glass Header */}
            <header className="glass-header px-6 py-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Nosso Cardápio</h1>
                        <p className="text-sm text-gray-500">Mesa Selecionada</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                        <Search className="w-5 h-5" />
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {categoryOptions.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-apple-blue text-white shadow-md shadow-apple-blue/20'
                                : 'bg-white text-gray-600 border border-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content List */}
            <main className="px-6 space-y-8">
                {Object.entries(displayGroups).map(([groupName, groupItems]) => (
                    groupItems.length > 0 && (
                        <section key={groupName}>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                {groupName}
                                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {groupItems.length}
                                </span>
                            </h3>

                            <div className="grid gap-4">
                                {groupItems.map((item: any) => (
                                    <motion.div
                                        key={item.uuid}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="apple-card p-4 flex gap-4 active:scale-[0.98] transition-all"
                                    >
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-100 italic text-gray-400 text-[10px] text-center px-2">
                                            {item.produtoImagem ? (
                                                <img
                                                    src={item.produtoImagem}
                                                    className="w-full h-full object-cover"
                                                    alt={item.produtoNome}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <ImageIcon size={16} strokeWidth={1.5} />
                                                    <span>Sem Foto</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between flex-grow">
                                            <div>
                                                <h4 className="font-semibold text-[#1d1d1f]">{item.produtoNome}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                    {item.produtoDescricao || 'Nenhuma descrição disponível.'}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-apple-blue">
                                                    {formatPrice(item.produtoPreco || 0)}
                                                </span>
                                                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                    {(cart[item.uuid] || 0) > 0 && (
                                                        <>
                                                            <button
                                                                onClick={() => removeFromCart(item.uuid)}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-red-500"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-bold min-w-[1rem] text-center text-sm">
                                                                {cart[item.uuid]}
                                                            </span>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => addToCart(item.uuid)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-apple-blue text-white shadow-sm"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )
                ))}

                {/* My Open Orders Section - Collapsible and moved below items */}
                {myOrders.length > 0 && (
                    <section className="mt-12 py-6 border-t border-gray-100 pb-8">
                        <button
                            onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                            className="w-full flex items-center justify-between text-lg font-bold group"
                        >
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-apple-blue" />
                                Seus Pedidos de Hoje
                                <span className="bg-apple-blue/10 text-apple-blue text-[10px] px-2 py-0.5 rounded-full">
                                    {myOrders.length}
                                </span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOrdersExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isOrdersExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-3 pt-4">
                                        {myOrders.map((order: any) => (
                                            <div key={order.uuid} className={`apple-card p-4 flex justify-between items-center border-l-4 ${order.status === 'NOVO' ? 'border-red-500' :
                                                order.status === 'EM_PREPARO' ? 'border-orange-500' :
                                                    order.status === 'PRONTO' ? 'border-green-500' :
                                                        order.status === 'ENTREGUE' ? 'border-blue-500' :
                                                            order.status === 'PAGO' ? 'border-emerald-500' :
                                                                'border-gray-300'
                                                }`}>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-800">Pedido #{order.seqId}</span>
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Mesa {order.mesaNumero}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'NOVO' ? 'bg-red-50 text-red-500' :
                                                        order.status === 'EM_PREPARO' ? 'bg-orange-50 text-orange-500' :
                                                            order.status === 'PRONTO' ? 'bg-green-50 text-green-500' :
                                                                order.status === 'ENTREGUE' ? 'bg-blue-50 text-blue-500' :
                                                                    order.status === 'PAGO' ? 'bg-emerald-50 text-emerald-600' :
                                                                        order.status === 'CANCELADO' ? 'bg-gray-100 text-gray-400' :
                                                                            'bg-gray-50 text-gray-500'
                                                        }`}>
                                                        {order.status === 'PAGO' ? 'Pedido Pago' : order.status.replace('_', ' ')}
                                                    </div>
                                                    <div className="mt-1 font-bold text-apple-blue">
                                                        {formatPrice(order.total)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                )}
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
                            className="w-full bg-apple-blue text-white p-4 rounded-2xl font-bold flex justify-between items-center shadow-2xl shadow-apple-blue/40 active:scale-95 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                                    {totalItems}
                                </div>
                                <span>Ver Sacola</span>
                            </div>
                            <span className="text-lg">{formatPrice(totalPrice)}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isShipping && setIsCartOpen(false)}
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
                                {Object.entries(cart).map(([uuid, qty]) => {
                                    const item = items.find((i: any) => i.uuid === uuid);
                                    if (!item) return null;
                                    return (
                                        <div key={uuid} className="flex justify-between items-center">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                    <img src={item.produtoImagem || item.imagem || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{item.produtoNome}</h4>
                                                    <p className="text-gray-500 text-sm">
                                                        {formatPrice(item.produtoPreco || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-xl">
                                                <button onClick={() => !isShipping && removeFromCart(uuid)} className="p-1 hover:text-apple-blue disabled:opacity-50" disabled={isShipping}><Minus className="w-4 h-4" /></button>
                                                <span className="font-bold min-w-[1.5rem] text-center">{qty}</span>
                                                <button onClick={() => !isShipping && addToCart(uuid)} className="p-1 hover:text-apple-blue disabled:opacity-50" disabled={isShipping}><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Seu Nome (Para a comanda)
                                </label>
                                <input
                                    type="text"
                                    value={clienteNome}
                                    onChange={(e) => {
                                        setClienteNome(e.target.value);
                                        localStorage.setItem('concordia:clienteNome', e.target.value);
                                    }}
                                    placeholder="Ex: João Silva"
                                    disabled={isShipping || isNameFromStorage}
                                    className={`w-full bg-gray-100 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-apple-blue transition-all ${isShipping || isNameFromStorage ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''}`}
                                />
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Seu WhatsApp (Referência da comanda)
                                </label>
                                <input
                                    type="tel"
                                    value={whatsapp}
                                    onChange={(e) => {
                                        setWhatsapp(e.target.value);
                                        localStorage.setItem('concordia:whatsapp', e.target.value);
                                    }}
                                    placeholder="Ex: 11999999999"
                                    disabled={isShipping || isWhatsappFromStorage}
                                    className={`w-full bg-gray-100 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-apple-blue transition-all ${isShipping || isWhatsappFromStorage ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''}`}
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-6 mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            <button
                                className={`w-full p-5 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${clienteNome.trim().length > 2 && whatsapp.trim().length >= 10 && !isShipping
                                    ? 'bg-apple-blue text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={clienteNome.trim().length <= 2 || whatsapp.trim().length < 10 || isShipping}
                                onClick={async () => {
                                    if (isShipping) return;
                                    setIsShipping(true);
                                    try {
                                        await cardapioService.createOrder({
                                            tenantId,
                                            mesaId: mesaUuid,
                                            clienteNome,
                                            whatsapp,
                                            itens: Object.entries(cart).map(([uuid, qty]) => {
                                                const item = items.find((i: any) => i.uuid === uuid);
                                                return {
                                                    produtoId: item.produtoId,
                                                    quantidade: qty,
                                                    precoUnitario: item.produtoPreco
                                                }
                                            })
                                        });
                                        // Finalizar pedido e limpar carrinho
                                        setCart({});
                                        setIsCartOpen(false);
                                        setIsShipping(false);
                                        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
                                    } catch (error) {
                                        alert('Erro ao enviar pedido. Tente novamente.');
                                        setIsShipping(false);
                                    }
                                }}
                            >
                                {isShipping ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        Enviando Pedido...
                                    </>
                                ) : (
                                    clienteNome.trim().length <= 2
                                        ? 'Informe seu nome'
                                        : whatsapp.trim().length < 10
                                            ? 'Informe seu WhatsApp'
                                            : 'Confirmar Pedido'
                                )}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CardapioHome;
