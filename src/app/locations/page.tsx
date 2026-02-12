"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Location {
    id: string;
    name: string;
    _count: { items: number };
}

export default function LocationsPage() {
    const router = useRouter();
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/locations");
            if (!res.ok) throw new Error("Không tải được danh sách địa điểm");
            const data = await res.json();
            if (!Array.isArray(data)) {
                console.error("API returned invalid data:", data);
                throw new Error("Dữ liệu trả về không hợp lệ");
            }
            setLocations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi hệ thống");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            const res = await fetch("/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Thêm thất bại");
            }
            setNewName("");
            fetchLocations(); // Refresh list
        } catch (err) {
            alert(err instanceof Error ? err.message : "Lỗi khi thêm");
        }
    };

    const handleDelete = async (id: string, count: number) => {
        if (count > 0) {
            alert(`Không thể xóa vị trí này vì đang có ${count} món đồ.`);
            return;
        }
        if (!confirm("Bạn có chắc muốn xóa vị trí này không?")) return;

        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Xóa thất bại");
            }
            fetchLocations();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Lỗi khi xóa");
        }
    };

    const startEdit = (loc: Location) => {
        setEditingId(loc.id);
        setEditName(loc.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleSaveEdit = async (id: string) => {
        if (!editName.trim()) return;
        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim() }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Cập nhật thất bại");
            }
            setEditingId(null);
            fetchLocations();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Lỗi cập nhật");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-2 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại trang chính
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Vị Trí (Mới)</h1>
                        <p className="text-slate-500 mt-1">Thêm, sửa, xóa các vị trí để quản lý đồ đạc dễ dàng hơn.</p>
                    </div>
                </div>

                {/* Add New Location Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Thêm Vị Trí Mới</h2>
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nhập tên vị trí (ví dụ: Phòng khách, Kệ sách...)"
                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newName.trim()}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            Thêm
                        </button>
                    </form>
                </div>

                {/* Locations List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Đang tải danh sách...</div>
                    ) : locations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Chưa có vị trí nào</h3>
                            <p className="text-slate-500 mt-1">Hãy thêm vị trí đầu tiên ở form bên trên.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên Vị Trí</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Số lượng đồ</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === loc.id ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900">{loc.name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${loc._count.items > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {loc._count.items} món đồ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingId === loc.id ? (
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => handleSaveEdit(loc.id)} className="text-indigo-600 hover:text-indigo-900 font-bold">Lưu</button>
                                                    <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-700">Hủy</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-4">
                                                    <button onClick={() => startEdit(loc)} className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                                                    <button
                                                        onClick={() => handleDelete(loc.id, loc._count.items)}
                                                        className={`transition-colors ${loc._count.items > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                                                        disabled={loc._count.items > 0}
                                                        title={loc._count.items > 0 ? "Không thể xóa vị trí đang có đồ" : "Xóa vị trí này"}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
