import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Delete all data. Order matters due to Foreign Key constraints.
        // Delete items (which reference locations) first.
        await prisma.item.deleteMany({});

        // Then delete locations
        await prisma.location.deleteMany({});

        return NextResponse.json({ message: "Database reset successfully! All items and locations deleted." });
    } catch (error) {
        console.error("Reset error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
