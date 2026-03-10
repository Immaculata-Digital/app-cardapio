import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ChevronRight, Utensils, ReceiptText } from 'lucide-react';

interface OrderStatusBannerProps {
    myOrders: any[];
    onClick: () => void;
}

export const OrderStatusBanner = ({ myOrders, onClick }: OrderStatusBannerProps) => {
    const activeOrders = useMemo(() => 
        myOrders.filter(order => !['CANCELADO', 'PAGO', 'ENTREGUE'].includes(order.status)), 
    [myOrders]);

    if (activeOrders.length === 0) return null;

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PRONTO':
                return {
                    label: 'Pedido Pronto!',
                    description: 'Seu pedido está pronto.',
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-100',
                    step: 3
                };
            case 'EM_PREPARO':
                return {
                    label: 'Em Preparo',
                    description: 'Estamos preparando com carinho.',
                    icon: <Utensils className="w-5 h-5 text-orange-500 animate-bounce" />,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-100',
                    step: 2
                };
            case 'ENTREGUE':
                return {
                    label: 'Entregue',
                    description: 'Bom apetite!',
                    icon: <Clock className="w-5 h-5 text-blue-500" />,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-100',
                    step: 4
                };
            default:
                return {
                    label: 'Pedido Recebido',
                    description: 'Aguardando início do preparo.',
                    icon: <ReceiptText className="w-5 h-5 text-red-500" />,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-100',
                    step: 1
                };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6"
        >
            <div className="space-y-2">
                {activeOrders.slice(-3).map((order) => {
                    const status = getStatusInfo(order.status);
                    const isSingle = activeOrders.length === 1;

                    return (
                        <button
                            key={order.uuid}
                            onClick={onClick}
                            className={`w-full ${status.bgColor} border ${status.borderColor} rounded-2xl ${isSingle ? 'p-4' : 'p-3'} flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm`}
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className={`bg-white ${isSingle ? 'p-2.5' : 'p-2'} rounded-xl shadow-sm`}>
                                    {status.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-sm font-black ${status.color} uppercase tracking-tight`}>
                                            {status.label}
                                        </h3>
                                        <span className="text-[10px] bg-white/50 text-gray-400 px-1.5 py-0.5 rounded-md font-bold border border-white/20">
                                            #{order.seqId}
                                        </span>
                                    </div>
                                    {isSingle && (
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            {status.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isSingle && (
                                    <div className="hidden sm:flex gap-1.5">
                                        {[1, 2, 3].map((s) => (
                                            <div 
                                                key={s}
                                                className={`w-1.5 h-1.5 rounded-full ${s <= status.step ? status.color.replace('text', 'bg') : 'bg-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                            </div>
                        </button>
                    );
                })}
                {activeOrders.length > 3 && (
                    <button 
                        onClick={onClick}
                        className="w-full text-center py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                    >
                        + {activeOrders.length - 3} outros pedidos em andamento
                    </button>
                )}
            </div>
        </motion.div>
    );
};
