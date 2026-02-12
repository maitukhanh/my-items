import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.item.findMany({
            orderBy: { createdAt: "desc" },
            include: { location: true }, // Include Location details
        });

        // Map data to easy-to-use format
        const formattedItems = items.map(item => ({
            ...item,
            locationName: item.location?.name || item.legacyLocation || "Chưa có vị trí", // Prefer relationship, fallback to legacy
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
        // Accept either locationId (new) or location (legacy text if user enters custom?)
        // For now, assume locationId is passed if selected from dropdown.
        const locationId = formData.get("locationId") as string;
        // If we still want to support legacy text input (optional)
        const legacyLocation = formData.get("location") as string;

        const imageFile = formData.get("image") as File | null;

        if (!name) {
            return NextResponse.json(
                { errors: ["Tên món đồ là bắt buộc"] },
                { status: 400 }
            );
        }

        let imageUrl = null;
        if (imageFile) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            imageUrl = base64Image;
        }

        const newItem = await prisma.item.create({
            data: {
                name,
                locationId: locationId || null,
                legacyLocation: !locationId ? legacyLocation : null, // Only save legacy if no ID provided
                imageUrl,
            },
            include: { location: true },
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error("POST /api/items error:", error);
        return NextResponse.json(
            { error: "Failed to create", details: String(error) },
            { status: 500 }
        );
    }
}
