import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.item.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const location = formData.get("location") as string;
        const imageFile = formData.get("image") as File | null;

        let imageUrl: string | null = null;

        if (imageFile && imageFile.size > 0) {
            // Chuyển ảnh sang Base64 để lưu trực tiếp vào DB (tiện cho deploy cloud)
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = buffer.toString("base64");
            imageUrl = `data:${imageFile.type};base64,${base64Image}`;
        }

        const item = await prisma.item.create({
            data: { name, location, imageUrl },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
