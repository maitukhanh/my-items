import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic'; // Prevent static caching

const prisma = new PrismaClient();

export async function GET() {
    try {
        const items = await prisma.item.findMany({
            orderBy: { createdAt: "desc" },
            include: { location: true }, // Include Location details
        });

        // Map data to handle compatibility
        // Important: Overwrite 'location' object with string name for frontend compatibility
        const formattedItems = items.map(item => ({
            ...item,
            location: item.location?.name || item.legacyLocation || "Chưa có vị trí", // Overwrite location object with string
            rawLocation: item.location, // Keep raw object if needed (optional)
            locationName: item.location?.name || item.legacyLocation || "Chưa có vị trí"
        }));

        return NextResponse.json(formattedItems, { status: 200 });
    } catch (error) {
        console.error("GET /api/items error:", error);
        return NextResponse.json(
            { error: "Failed to fetch", details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const locationId = formData.get("locationId") as string;

        const imageFile = formData.get("image") as File | null;

        if (!name) {
            return NextResponse.json(
                { errors: ["Tên món đồ là bắt buộc"] },
                { status: 400 }
            );
        }

        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            imageUrl = base64Image;
        }

        // Logic Location
        let locationData = {};
        if (locationId) {
            locationData = { location: { connect: { id: locationId } } };
        }
        // Note: We don't save legacyLocation for new items if we enforce relation.
        // But if locationId is missing, we could treat it as "Chưa có".

        const newItem = await prisma.item.create({
            data: {
                name,
                imageUrl,
                ...locationData,
            },
            include: { location: true } // Return fully populated item
        });

        // Format return data consistently
        const formattedItem = {
            ...newItem,
            location: newItem.location?.name || "Chưa có vị trí",
            locationName: newItem.location?.name || "Chưa có vị trí"
        };

        return NextResponse.json(formattedItem, { status: 201 });
    } catch (error) {
        console.error("POST /api/items error:", error);
        return NextResponse.json(
            { error: "Failed to create item", details: String(error) },
            { status: 500 }
        );
    }
}
