import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE: Xóa vị trí
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params is Promise in Next.js 15
) {
    try {
        const { id } = await params;

        // Kiểm tra xem vị trí có đang được sử dụng không
        const location = await prisma.location.findUnique({
            where: { id },
            include: { _count: { select: { items: true } } },
        });

        if (!location) {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }

        if (location._count.items > 0) {
            return NextResponse.json(
                { error: `Cannot delete location because it has ${location._count.items} items associated with it.` },
                { status: 400 }
            );
        }

        await prisma.location.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting location:", error);
        return NextResponse.json(
            { error: "Failed to delete location" },
            { status: 500 }
        );
    }
}

// PATCH: Sửa tên vị trí
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params is Promise in Next.js 15
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Location name is required" },
                { status: 400 }
            );
        }

        const updatedLocation = await prisma.location.update({
            where: { id },
            data: { name: name.trim() },
        });

        return NextResponse.json(updatedLocation);
    } catch (error) {
        console.error("Error updating location:", error);
        if (String(error).includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Location name already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update location" },
            { status: 500 }
        );
    }
}
