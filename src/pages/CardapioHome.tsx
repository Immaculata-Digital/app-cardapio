import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Utensils, History, X, Clock, Sliders } from 'lucide-react';

// Hooks
import { useCardapioData } from '../hooks/useCardapioData';
import { useCart } from '../hooks/useCart';
import { useFilter } from '../hooks/useFilter';
import { useOrders } from '../hooks/useOrders';

// Components
import { BrandHeader } from '../components/Brand/BrandHeader';
import { ProductList } from '../components/Product/ProductList';
import { OrderStatusBanner } from '../components/Order/OrderStatusBanner';
import { CartModal } from '../components/Cart/CartModal';
import { ProductModal } from '../components/Product/ProductModal';
import { FilterModal } from '../components/Filter/FilterModal';
import { AppleModal } from '../components/common/AppleModal';

// Services
import { cardapioService } from '../services/api';
import { formatPrice } from '../utils/format';

const CardapioHome = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const mesaUuid = searchParams.get('mesaUuid');

    // Data Hook
    const { 
        brandConfig, 
        categories, 
        items, 
        isLoading: isLoadingData 
    } = useCardapioData(tenantId);

    // Filter Hook
    const {
        selectedCategory,
        toggleCategory,
        sortBy,
        setSortBy,
        searchTerm,
        setSearchTerm,
        displayGroups,
        categoryOptions,
        resetFilters
    } = useFilter(items, categories);

    // Cart Hook
    const {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice
    } = useCart(items, tenantId);

    // Local State for Modals
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

    // User Info (Sync with LocalStorage)
    const [clienteNome, setClienteNome] = useState(() => localStorage.getItem('concordia:clienteNome') || '');
    const [whatsapp, setWhatsapp] = useState(() => localStorage.getItem('concordia:whatsapp') || '');
    const [isNameFromStorage] = useState(() => !!localStorage.getItem('concordia:clienteNome'));
    const [isWhatsappFromStorage] = useState(() => !!localStorage.getItem('concordia:whatsapp'));

    // Orders Hook
    const { data: myOrders = [] } = useOrders(tenantId, whatsapp);

    // Prevent Scroll when modals are open
    useEffect(() => {
        const isModalOpen = isCartOpen || !!selectedProduct || isFilterModalOpen || isOrdersModalOpen;
        document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCartOpen, selectedProduct, isFilterModalOpen, isOrdersModalOpen]);

    const handleOrderSubmit = async () => {
        if (isSubmitting || clienteNome.trim().length <= 2 || whatsapp.trim().length < 10) return;
        
        setIsSubmitting(true);
        try {
            await cardapioService.createOrder({
                tenantId: tenantId!,
                mesaId: mesaUuid,
                clienteNome,
                whatsapp,
                itens: Object.entries(cart).map(([uuid, qty]) => {
                    const item = items.find((i: any) => i.uuid === uuid);
                    return {
                        produtoId: item.uuid,
                        quantidade: qty,
                        precoUnitario: item.precos?.preco_promocional > 0 ? item.precos.preco_promocional : (item.precos?.preco || 0)
                    };
                })
            });
            clearCart();
            setIsCartOpen(false);
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        } catch (error) {
            alert('Erro ao enviar pedido. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Carregando cardápio...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] antialiased">
            <div className="max-w-2xl mx-auto min-h-screen pb-32 bg-[#F9FDFD] shadow-2xl relative">
                
                <BrandHeader 
                    brandConfig={brandConfig}
                    totalItems={totalItems}
                    totalOrders={myOrders.length}
                    onCartClick={() => setIsCartOpen(true)}
                    onHistoryClick={() => setIsOrdersModalOpen(true)}
                />

                {/* Sticky Search & Status Banner */}
                <div className="sticky top-0 z-40 bg-[#F9FDFD]/90 backdrop-blur-md pt-4 pb-4 space-y-4 border-b border-gray-100/50">
                    <div className="px-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Procurar Produto"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100/50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <OrderStatusBanner 
                        myOrders={myOrders} 
                        onClick={() => setIsOrdersModalOpen(true)} 
                    />
                </div>

                {/* Filter and Categories (Non-sticky, below Search) */}
                <div className="px-6 py-6 flex items-center gap-4 bg-[#F9FDFD]">
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex-shrink-0 w-12 h-12 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                    >
                        <Sliders className="w-5 h-5" />
                    </button>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 flex-grow">
                        {categoryOptions.map(cat => (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`badge-category flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCategory === cat 
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <ProductList 
                    displayGroups={displayGroups}
                    cart={cart}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    onProductClick={setSelectedProduct}
                    searchTerm={searchTerm}
                    hasActiveFilters={!!selectedCategory || !!searchTerm}
                />

                {/* Floating Cart Summary */}
                <AnimatePresence>
                    {totalItems > 0 && !isCartOpen && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-8 left-6 right-6 z-50 max-w-[600px] mx-auto"
                        >
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="w-full bg-[var(--primary)] text-white p-5 rounded-3xl font-black flex justify-between items-center shadow-2xl shadow-[var(--primary)]/20 active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 px-4 py-1.5 rounded-xl text-sm">
                                        {totalItems}
                                    </div>
                                    <span className="text-lg">Ver Sacola</span>
                                </div>
                                <span className="text-xl font-black">{formatPrice(totalPrice)}</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modals */}
                <CartModal 
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cart={cart}
                    items={items}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    onClear={clearCart}
                    totalPrice={totalPrice}
                    onSubmit={handleOrderSubmit}
                    isSubmitting={isSubmitting}
                    clienteNome={clienteNome}
                    onNomeChange={setClienteNome}
                    whatsapp={whatsapp}
                    onWhatsappChange={setWhatsapp}
                    isNameFromStorage={isNameFromStorage}
                    isWhatsappFromStorage={isWhatsappFromStorage}
                />

                <ProductModal 
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    product={selectedProduct}
                    cartCount={cart[selectedProduct?.uuid] || 0}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    relatedItems={items.filter((i: any) => i.categoria_code === selectedProduct?.categoria_code && i.uuid !== selectedProduct?.uuid).slice(0, 6)}
                    onRelatedClick={setSelectedProduct}
                />

                <FilterModal 
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    categoryOptions={categoryOptions}
                    selectedCategory={selectedCategory}
                    onCategoryToggle={toggleCategory}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onReset={resetFilters}
                />

                <AppleModal isOpen={isOrdersModalOpen} onClose={() => setIsOrdersModalOpen(false)}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <History className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Seus Pedidos</h2>
                                    <p className="text-xs text-gray-500 font-medium">Acompanhe seus pedidos de hoje</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOrdersModalOpen(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {myOrders.filter((o: any) => o.status !== 'CANCELADO').map((order: any) => (
                                <div key={order.uuid} className={`apple-card p-5 flex justify-between items-center border-l-4 ${
                                    order.status === 'NOVO' ? 'border-red-500' :
                                    order.status === 'EM_PREPARO' ? 'border-orange-500' :
                                    order.status === 'PRONTO' ? 'border-green-500' :
                                    order.status === 'ENTREGUE' ? 'border-blue-500' :
                                    order.status === 'PAGO' ? 'border-emerald-500' :
                                    'border-gray-200'
                                }`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-900">Pedido #{order.seqId}</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-bold">Mesa {order.mesaNumero}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                            order.status === 'NOVO' ? 'bg-red-50 text-red-500' :
                                            order.status === 'EM_PREPARO' ? 'bg-orange-50 text-orange-500' :
                                            order.status === 'PRONTO' ? 'bg-green-50 text-green-500' :
                                            order.status === 'ENTREGUE' ? 'bg-blue-50 text-blue-500' :
                                            order.status === 'PAGO' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-gray-50 text-gray-400'
                                        }`}>
                                            {order.status === 'PAGO' ? 'Pago' : order.status.replace('_', ' ')}
                                        </div>
                                        <div className="mt-2 font-black text-gray-900">
                                            {formatPrice(order.total)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </AppleModal>
            </div>
        </div>
    );
};

export default CardapioHome;
