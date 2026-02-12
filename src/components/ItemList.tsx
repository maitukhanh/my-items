"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";
import ItemCard from "./ItemCard";

interface Item {
    id: string;
    name: string;
    location: string;
    imageUrl: string | null;
    createdAt: string;
}

export interface ItemListHandle {
    refresh: () => void;
}

interface ItemListProps {
    searchQuery: string;
    onEdit: (item: Item) => void;
}

const ItemList = forwardRef<ItemListHandle, ItemListProps>(
    ({ searchQuery, onEdit }, ref) => {
        const [items, setItems] = useState<Item[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const fetchItems = useCallback(async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await fetch("/api/items");
                if (!res.ok) throw new Error("Không thể tải danh sách");
                const data = await res.json();
                setItems(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
            } finally {
                setIsLoading(false);
            }
        }, []);

        useImperativeHandle(ref, () => ({
            refresh: fetchItems,
        }));

        useEffect(() => {
            fetchItems();
        }, [fetchItems]);

        // Client-side filtering
        const filteredItems = items.filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                item.name.toLowerCase().includes(q) ||
                item.location.toLowerCase().includes(q)
            );
        });

        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                            <div className="h-48 shimmer" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 w-3/4 rounded-lg shimmer" />
                                <div className="h-4 w-1/2 rounded-lg shimmer" />
                                <div className="h-3 w-1/3 rounded-lg shimmer mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-red-600 font-medium mb-2">Lỗi tải dữ liệu</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchItems}
                        className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            );
        }

        if (filteredItems.length === 0) {
            return (
                <div className="text-center py-16 animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <p className="text-slate-900 font-medium mb-1">
                        {searchQuery ? "Không tìm thấy kết quả nào" : "Chưa có món đồ nào"}
                    </p>
                    <p className="text-slate-500 text-sm">
                        {searchQuery
                            ? "Hãy thử từ khóa khác xem sao"
                            : "Thêm món đồ đầu tiên bằng form bên trái nhé"}
                    </p>
                </div>
            );
        }

        return (
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                    <p className="text-sm text-slate-500 font-medium">
                        Tìm thấy {filteredItems.length} món đồ
                        {searchQuery && ` phù hợp với "${searchQuery}"`}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onDeleted={fetchItems}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            </div>
        );
    }
);

ItemList.displayName = "ItemList";

export default ItemList;
