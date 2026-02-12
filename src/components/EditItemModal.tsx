"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Item {
    id: string;
    name: string;
    locationName?: string; // Display name
    locationId?: string | null; // ID if linked
    legacyLocation?: string | null; // Old text if not linked
    imageUrl: string | null;
}

interface Location {
    id: string;
    name: string;
}

interface EditItemModalProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditItemModal({ item, isOpen, onClose, onUpdated }: EditItemModalProps) {
    const [name, setName] = useState(item.name);
    // locationId might be null if legacy item.
    const [locationId, setLocationId] = useState(item.locationId || "");
    const [locations, setLocations] = useState<Location[]>([]);

    // Legacy support: show what the old location text was if not mapped yet
    const legacyText = !item.locationId ? (item.legacyLocation || item.locationName) : "";

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl);
    const [removeImage, setRemoveImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch locations
    useEffect(() => {
        if (isOpen) {
            // Reset form based on item props
            setName(item.name);
            setLocationId(item.locationId || "");
            setImagePreview(item.imageUrl);
            setRemoveImage(false);
            setImageFile(null);

            // Load locations
            fetch("/api/locations")
                .then(res => res.json())
                .then(data => setLocations(data))
                .catch(err => console.error("Failed to load locations", err));
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
            formData.append("locationId", locationId);
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
                throw new Error(data.error || "Cập nhật thất bại");
            }

            onUpdated();
            onClose();
        } catch (err) {
            setErrors([err instanceof Error ? err.message : "Có lỗi xảy ra"]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Chỉnh Sửa Món Đồ</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên Món Đồ</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">Vị trí</label>
                            <Link href="/locations" className="text-xs text-indigo-600 font-medium">+ Tạo mới</Link>
                        </div>

                        <div className="relative">
                            <select
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none"
                            >
                                <option value="">-- Chọn vị trí --</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {/* Show legacy value helper if exists and not mapped */}
                        {!locationId && legacyText && (
                            <p className="text-xs text-amber-600 mt-1">
                                Vị trí cũ là: <strong>{typeof legacyText === 'string' ? legacyText : ''}</strong>. Hãy chọn lại vị trí đúng từ danh sách.
                            </p>
                        )}
                        {!locationId && !legacyText && (
                            <p className="text-xs text-red-500 mt-1">Vui lòng chọn vị trí.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hình ảnh</label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setRemoveImage(true);
                                            setImageFile(null);
                                        }}
                                        className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center hover:bg-slate-100 hover:border-indigo-400 transition-all text-slate-400 hover:text-indigo-500"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                            <div className="text-xs text-slate-500">
                                Nhấn vào ảnh để xóa hoặc nút cộng để thêm ảnh mới.
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || (!locationId && !legacyText)} // Allow submit if legacy text exists? Or force update? Let's allow update name only, but warn. Better force update location.
                            className="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
