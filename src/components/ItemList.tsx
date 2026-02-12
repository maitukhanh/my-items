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
                if (!res.ok) throw new Error("Failed to fetch items");
                const data = await res.json();
                setItems(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
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
                        <div
                            key={i}
                            className="glass rounded-2xl overflow-hidden animate-pulse"
                        >
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
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <p className="text-red-400 font-medium mb-2">Error loading items</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchItems}
                        className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (filteredItems.length === 0) {
            return (
                <div className="text-center py-16 animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-brand-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>
                    <p className="text-slate-300 font-medium mb-1">
                        {searchQuery ? "No items match your search" : "No items yet"}
                    </p>
                    <p className="text-slate-500 text-sm">
                        {searchQuery
                            ? "Try a different search term"
                            : "Add your first item using the form above"}
                    </p>
                </div>
            );
        }

        return (
            <div>
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-slate-400">
                        {filteredItems.length}{" "}
                        {filteredItems.length === 1 ? "item" : "items"}
                        {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
