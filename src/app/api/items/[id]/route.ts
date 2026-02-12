import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.item.delete({ where: { id } });
        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const location = formData.get("location") as string;
        const imageFile = formData.get("image") as File | null;
        const removeImage = formData.get("removeImage") === "true";

        const existingItem = await prisma.item.findUnique({ where: { id } });
        if (!existingItem) return NextResponse.json({ error: "Not found" }, { status: 404 });

        let imageUrl = existingItem.imageUrl;
        if (removeImage) imageUrl = null;

        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = buffer.toString("base64");
            imageUrl = `data:${imageFile.type};base64,${base64Image}`;
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data: { name, location, imageUrl },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
