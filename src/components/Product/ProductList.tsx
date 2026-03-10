import { ProductCard } from './ProductCard';

interface ProductListProps {
    displayGroups: Record<string, any[]>;
    cart: Record<string, number>;
    onAdd: (uuid: string) => void;
    onRemove: (uuid: string) => void;
    onProductClick: (item: any) => void;
}

export const ProductList = ({
    displayGroups,
    cart,
    onAdd,
    onRemove,
    onProductClick
}: ProductListProps) => {
    return (
        <main className="space-y-10 py-8">
            {Object.entries(displayGroups).map(([groupName, groupItems]) => (
                groupItems.length > 0 && (
                    <section key={groupName} className="px-6">
                        <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-[#2D3436]">
                            {groupName}
                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                {groupItems.length}
                            </span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groupItems.map((item: any) => (
                                <ProductCard 
                                    key={item.uuid}
                                    item={item}
                                    cartCount={cart[item.uuid] || 0}
                                    onAdd={onAdd}
                                    onRemove={onRemove}
                                    onClick={onProductClick}
                                />
                            ))}
                        </div>
                    </section>
                )
            ))}
        </main>
    );
};
