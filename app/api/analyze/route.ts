
import { NextResponse } from "next/server";
import { analyzeRepo } from "@/lib/analyzer";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("url" in body) ||
            typeof body.url !== "string" ||
            !body.url.trim()
        ) {
            return NextResponse.json(
                { error: "Please provide a valid repository URL." },
                { status: 400 }
            );
        }

        const result = await analyzeRepo(body.url.trim());

        return NextResponse.json(result);
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to analyze repository.";

        const status = message.includes("not found")
            ? 404
            : message.includes("rate limit")
              ? 429
              : 500;

        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
