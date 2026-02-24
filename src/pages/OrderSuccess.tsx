import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-apple-blue mb-8"
            >
                <CheckCircle2 size={120} strokeWidth={1.5} />
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-4"
            >
                Pedido Enviado!
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 mb-12 max-w-xs"
            >
                Seu pedido foi recebido e já está sendo preparado. Em instantes um de nossos colaboradores chegará até você.
            </motion.p>

            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => navigate(-1)}
                className="apple-button-secondary flex items-center gap-2"
            >
                <ArrowLeft size={20} />
                Voltar ao Cardápio
            </motion.button>
        </div>
    );
};

export default OrderSuccess;
