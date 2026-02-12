"use client";

import React, { useState, useRef, useEffect } from "react";

interface Item {
    id: string;
    name: string;
    location: string;
    imageUrl: string | null;
}

interface EditItemModalProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditItemModal({ item, isOpen, onClose, onUpdated }: EditItemModalProps) {
    const [name, setName] = useState(item.name);
    const [location, setLocation] = useState(item.location);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl);
    const [removeImage, setRemoveImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(item.name);
            setLocation(item.location);
            setImagePreview(item.imageUrl);
            setRemoveImage(false);
            setImageFile(null);
        }
    }, [isOpen, item]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors([]);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("location", location);
            if (imageFile) {
                formData.append("image", imageFile);
            }
            if (removeImage) {
                formData.append("removeImage", "true");
            }

            const res = await fetch(`/api/items/${item.id}`, {
                method: "PATCH",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Update failed");
            }

            onUpdated();
            onClose();
        } catch (err) {
            setErrors([err instanceof Error ? err.message : "Something went wrong"]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-strong w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Item</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Image</label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setRemoveImage(true);
                                            setImageFile(null);
                                        }}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-20 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-brand-500 transition-all"
                                >
                                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                            <div className="text-xs text-slate-500">
                                Click to change or remove image
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
                        >
                            {isSubmitting ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
