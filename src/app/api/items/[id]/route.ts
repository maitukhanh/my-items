import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        await prisma.item.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("DELETE /api/items/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete", details: String(error) },
            { status: 500 }
        );
    }
}

// PATCH - Update Item
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const formData = await request.formData();

        const name = formData.get("name") as string;
        const locationId = formData.get("locationId") as string;
        const removeImage = formData.get("removeImage") === "true";
        const imageFile = formData.get("image") as File | null;

        // Prepare raw update data (using any to bypass strict type check for conditional add)
        const updateData: any = {};

        if (name) updateData.name = name;

        // Image Handling
        if (removeImage) {
            updateData.imageUrl = null;
        } else if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            updateData.imageUrl = base64Image;
        }

        // Location Relation Handling
        if (locationId) {
            // Relink to new location
            updateData.location = {
                connect: { id: locationId }
            };
            // Optional: Clear legacy location if we move to strict relation
            // updateData.legacyLocation = null;
        } else if (locationId === "") { // Explicitly cleared
            updateData.location = { disconnect: true };
        }

        // Execute Update
        const updatedItem = await prisma.item.update({
            where: { id },
            data: updateData,
            include: { location: true },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("PATCH /api/items/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update", details: String(error) },
            { status: 500 }
        );
    }
}
