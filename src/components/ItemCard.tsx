"use client";

import React from "react";

interface Item {
    id: string;
    name: string;
    location: string;
    imageUrl: string | null;
    createdAt: string;
}

interface ItemCardProps {
    item: Item;
    onDeleted: () => void;
    onEdit: (item: Item) => void;
}

export default function ItemCard({ item, onDeleted, onEdit }: ItemCardProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            onDeleted();
        } catch (err) {
            alert("Error deleting item");
        } finally {
            setIsDeleting(false);
        }
    };

    const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="glass rounded-2xl overflow-hidden card-hover animate-slide-up group relative">
            {/* Control Buttons (Visible on hover) */}
            <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-brand-600 transition-colors"
                    title="Edit"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                >
                    {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Image section */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-900/50 to-brand-950/50">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <svg
                                className="w-12 h-12 mx-auto text-slate-600 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                            <span className="text-sm text-slate-600">No image</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content section */}
            <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-brand-300 transition-colors">
                    {item.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                    <svg
                        className="w-4 h-4 text-brand-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <span className="text-sm text-slate-400 truncate">{item.location}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-500">{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}
