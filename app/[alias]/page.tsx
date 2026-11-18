import { redirect, notFound } from "next/navigation";
import { connection } from "next/server";
import clientPromise from "@/lib/mongodb";
export const instant = false;
export default async function RedirectPage({
                                               params,
                                           }: {
    params: Promise<{ alias: string }>;
}) {
    const { alias } = await params;

    await connection();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "urlshortener");
    const link = await db.collection("links").findOne({ alias });

    if (!link) {
        notFound();
    }

    redirect(link.url);
}