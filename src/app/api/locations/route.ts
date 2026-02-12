import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { items: true } } }, // Đếm số lượng món đồ trong mỗi vị trí
        });
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Location name is required" },
                { status: 400 }
            );
        }

        const location = await prisma.location.create({
            data: { name: name.trim() },
        });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        console.error("Error creating location:", error);
        // Check unique constraint violation
        if (String(error).includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Location name already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create location" },
            { status: 500 }
        );
    }
}
