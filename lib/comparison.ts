
import { analyzeRepo } from "@/lib/analyzer";
import { RepoAnalysis } from "@/types";

export async function compareRepos(
    urls: string[]
): Promise<RepoAnalysis[]> {
    if (urls.length < 2) {
        throw new Error(
            "Please provide at least two repository URLs to compare."
        );
    }

    const results = await Promise.all(
        urls.map((url) => analyzeRepo(url))
    );

    return results.sort(
        (a, b) => b.healthScore - a.healthScore
    );
}
