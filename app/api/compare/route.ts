
import { NextResponse } from "next/server";
import { compareRepos } from "@/lib/comparison";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("urls" in body) ||
            !Array.isArray(body.urls) ||
            !body.urls.every(
                (url): url is string => typeof url === "string"
            )
        ) {
            return NextResponse.json(
                { error: "Please provide an array of repository URLs." },
                { status: 400 }
            );
        }

        const urls = body.urls
            .map((url: string) => url.trim())
            .filter(Boolean);

        if (urls.length < 2) {
            return NextResponse.json(
                { error: "At least two repository URLs are required." },
                { status: 400 }
            );
        }

        if (urls.length > 5) {
            return NextResponse.json(
                { error: "You can compare up to five repositories at a time." },
                { status: 400 }
            );
        }

        const results = await compareRepos(urls);

        return NextResponse.json(results);
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to compare repositories.";

        const status = message.includes("not found")
            ? 404
            : message.toLowerCase().includes("rate limit")
              ? 429
              : 500;

        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
