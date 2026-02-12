"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleReset = async () => {
        if (!confirm("CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ dữ liệu (Items & Locations). Bạn có chắc chắn không?")) return;

        setIsLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/setup/reset", { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Đã xóa dữ liệu thành công! Đang chuyển hướng...");
                setTimeout(() => router.push("/locations"), 2000);
            } else {
                setMessage(`❌ Lỗi: ${data.error}`);
            }
        } catch (err) {
            setMessage("❌ Lỗi kết nối server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Dữ Liệu</h1>
                <p className="text-slate-500 mb-6">
                    Sử dụng chức năng này để xóa sạch dữ liệu cũ bị lỗi và bắt đầu lại từ đầu với cấu trúc mới.
                </p>

                {message && (
                    <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang xử lý..." : "Xóa Sạch Dữ Liệu"}
                </button>

                <div className="mt-4">
                    <a href="/" className="text-sm text-slate-500 hover:text-slate-700 underline">Quay lại trang chủ</a>
                </div>
            </div>
        </div>
    );
}
