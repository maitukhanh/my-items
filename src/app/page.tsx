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
        <div className="min-h-screen pb-12">
            {/* Header */}
            <header className="relative pt-12 pb-12 text-center overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10" />
                <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl -z-10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6 animate-fade-in shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Quản Lý Đồ Đạc & Tài Sản
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 animate-slide-up tracking-tight">
                        Theo Dõi{" "}
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            Đồ Đạc
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in leading-relaxed">
                        Không bao giờ thất lạc đồ đạc nữa. Phân loại, tìm kiếm và sắp xếp mọi thứ ở một nơi.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1 lg:sticky lg:top-8 animate-slide-up">
                        <AddItemForm onItemAdded={handleItemAdded} />
                    </div>

                    {/* Right Column: Search & List */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                            <SearchBar onSearch={handleSearch} />
                        </section>
                        <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                            <ItemList ref={itemListRef} searchQuery={searchQuery} onEdit={handleEdit} />
                        </section>
                    </div>
                </div>
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
            <footer className="border-t border-slate-200 mt-16 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-slate-500">
                        Quản Lý Đồ Đạc Cá Nhân &mdash; Xây dựng với Next.js, Prisma &amp; TailwindCSS
                    </p>
                </div>
            </footer>
        </div>
    );
}
