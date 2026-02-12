"use client";

import React, { useState, useRef, useCallback } from "react";
import AddItemForm from "@/components/AddItemForm";
import ItemList, { ItemListHandle } from "@/components/ItemList";
import SearchBar from "@/components/SearchBar";
import EditItemModal from "@/components/EditItemModal";

interface Item {
    id: string;
    name: string;
    location: string;
    imageUrl: string | null;
}

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const itemListRef = useRef<ItemListHandle>(null);

    const handleItemAdded = useCallback(() => {
        itemListRef.current?.refresh();
    }, []);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleEdit = useCallback((item: Item) => {
        setEditingItem(item);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero header */}
            <header className="relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
                <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-6 animate-fade-in">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Personal Item Manager
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 animate-slide-up">
                            Track Your{" "}
                            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                                Belongings
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto animate-fade-in">
                            Never lose track of your items again. Catalog, search, and organize
                            everything in one beautiful place.
                        </p>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Add Item Form */}
                <section className="max-w-xl mx-auto mb-12 animate-slide-up">
                    <AddItemForm onItemAdded={handleItemAdded} />
                </section>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm font-medium">Your Items</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* Search bar */}
                <section className="max-w-xl mx-auto mb-8">
                    <SearchBar onSearch={handleSearch} />
                </section>

                {/* Item list */}
                <section>
                    <ItemList ref={itemListRef} searchQuery={searchQuery} onEdit={handleEdit} />
                </section>
            </main>

            {/* Edit Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onUpdated={handleItemAdded}
                />
            )}

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-slate-600">
                        Personal Item Manager &mdash; Built with Next.js, Prisma &amp; TailwindCSS
                    </p>
                </div>
            </footer>
        </div>
    );
}
