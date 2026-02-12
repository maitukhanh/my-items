"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface AddItemFormProps {
    onItemAdded: () => void;
}

interface Location {
    id: string;
    name: string;
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
    const [name, setName] = useState("");
    const [locationId, setLocationId] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch locations when component mounts
    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch("/api/locations");
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
                // Auto select first location if available? No, user should choose.
            }
        } catch (error) {
            console.error("Failed to load locations", error);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const validate = (): string[] => {
        const errs: string[] = [];
        if (!name.trim()) errs.push("Vui lòng nhập tên món đồ");
        if (!locationId) errs.push("Vui lòng chọn vị trí");
        return errs;
    };

    const resetForm = () => {
        setName("");
        setLocationId("");
        setImageFile(null);
        setImagePreview(null);
        setErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");

        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("locationId", locationId); // Send ID instead of text
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await fetch("/api/items", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors(data.errors || ["Thêm món đồ thất bại"]);
                return;
            }

            setSuccessMessage("Thêm món đồ thành công!");
            resetForm();
            onItemAdded();

            setTimeout(() => setSuccessMessage(""), 3000);
        } catch {
            setErrors(["Lỗi kết nối. Vui lòng thử lại."]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-100"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Thêm Món Đồ Mới</h2>
            </div>

            {/* Error messages */}
            {errors.length > 0 && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 animate-scale-in">
                    {errors.map((err, i) => (
                        <p key={i} className="text-red-600 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {err}
                        </p>
                    ))}
                </div>
            )}

            {/* Success message */}
            {successMessage && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 animate-scale-in">
                    <p className="text-emerald-600 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                    </p>
                </div>
            )}

            {/* Name input */}
            <div className="mb-4">
                <label htmlFor="item-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Tên Món Đồ <span className="text-red-500">*</span>
                </label>
                <input
                    id="item-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ví dụ: Sạc Laptop"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                />
            </div>

            {/* Location Select (Updated) */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="item-location" className="block text-sm font-medium text-slate-700">
                        Vị Trí <span className="text-red-500">*</span>
                    </label>
                    <Link href="/locations" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        + Tạo mới
                    </Link>
                </div>

                {isLoadingLocations ? (
                    <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
                        Đang tải danh sách...
                    </div>
                ) : (
                    <div className="relative">
                        <select
                            id="item-location"
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 appearance-none"
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
                )}
                {locations.length === 0 && !isLoadingLocations && (
                    <p className="text-xs text-amber-600 mt-2">
                        Chưa có vị trí nào. Hãy <Link href="/locations" className="underline font-bold">tạo vị trí trước</Link>.
                    </p>
                )}
            </div>

            {/* Image upload */}
            <div className="mb-6">
                <label htmlFor="item-image" className="block text-sm font-medium text-slate-700 mb-2">
                    Hình Ảnh <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <div className="relative">
                    <input
                        id="item-image"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {imageFile ? imageFile.name : "Chọn hình ảnh..."}
                    </button>
                </div>

                {/* Image preview */}
                {imagePreview && (
                    <div className="mt-3 relative animate-scale-in">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang thêm...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm Món Đồ
                    </>
                )}
            </button>
        </form>
    );
}
