
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const { url, alias } = await request.json();

        if (!url || !alias) {
            return NextResponse.json(
                { error: "URL and alias are required." },
                { status: 400 }
            );
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Please enter a valid URL." },
                { status: 400 }
            );
        }

        if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
        ) {
            return NextResponse.json(
                { error: "Only HTTP and HTTPS URLs are allowed." },
                { status: 400 }
            );
        }

        if (!/^[a-zA-Z0-9_-]{1,40}$/.test(alias)) {
            return NextResponse.json(
                { error: "Alias must contain only letters, numbers, - or _." },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "urlshortener");
        const links = db.collection("links");

        await links.createIndex({ alias: 1 }, { unique: true });

        await links.insertOne({
            alias,
            url: parsedUrl.toString(),
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, alias });

    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            return NextResponse.json(
                { error: "That alias is already taken. Try another one." },
                { status: 409 }
            );
        }

        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
