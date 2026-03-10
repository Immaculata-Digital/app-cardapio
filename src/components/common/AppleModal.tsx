import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface AppleModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    description?: string;
    maxHeight?: string;
    stickyFooter?: ReactNode;
}

export const AppleModal = forwardRef<HTMLDivElement, AppleModalProps>(({ 
    isOpen, 
    onClose, 
    children, 
    title, 
    stickyFooter,
    maxHeight = '90vh' 
}, ref) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Handle & Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] flex flex-col shadow-2xl overflow-hidden`}
                        style={{ maxHeight }}
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center p-4 pt-4 pb-2" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full cursor-grab active:cursor-grabbing" />
                        </div>

                        {/* Title */}
                        {title && (
                            <div className="px-6 py-2">
                                <h2 className="text-2xl font-black text-[#2D3436] tracking-tight">{title}</h2>
                            </div>
                        )}

                        {/* Content Area - Scrollable */}
                        <div 
                            ref={ref}
                            className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar pb-10"
                        >
                            {children}
                        </div>

                        {/* Sticky Footer */}
                        {stickyFooter && (
                            <div className="p-6 pt-4 bg-white border-t border-gray-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                                {stickyFooter}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});

AppleModal.displayName = 'AppleModal';
