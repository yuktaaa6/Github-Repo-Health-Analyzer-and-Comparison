
import { describe, it, expect, vi, beforeEach } from "vitest";
import { compareRepos } from "./comparison";
import { analyzeRepo } from "./analyzer";
import { RepoAnalysis } from "@/types";

// Replace the real GitHub analyzer with a controllable mock.
vi.mock("./analyzer", () => ({
    analyzeRepo: vi.fn(),
}));

const mockedAnalyzeRepo = vi.mocked(analyzeRepo);

// Create a minimal mock result for testing.
const createMockAnalysis = (
    name: string,
    healthScore: number
): RepoAnalysis => ({
    url: `https://github.com/test-owner/${name}`,
    details: {
        owner: "test-owner",
        name,
        description: "Test repository",
        stars: 100,
        forks: 10,
        openIssues: 5,
        watchers: 20,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        lastCommitDate: "2026-01-01T00:00:00Z",
        hasWiki: true,
        hasPages: false,
        license: {
            name: "MIT License",
            key: "mit",
            url: null,
        },
        defaultBranch: "main",
    },
    contributorsCount: 3,
    commitsControl: {
        frequency: 2,
        totalLastYear: 20,
    },
    fileChecks: {
        hasReadme: true,
        readmeSize: 1200,
        hasLicense: true,
        hasContributing: true,
        hasCodeOfConduct: true,
    },
    healthScore,
    subScores: {
        documentation: 25,
        maintenance: 20,
        collaboration: 15,
        beginnerFriendly: 15,
    },
    breakdown: [],
    verdict: "Beginner Friendly",
});

describe("compareRepos", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should reject fewer than two repository URLs", async () => {
        await expect(
            compareRepos(["https://github.com/facebook/react"])
        ).rejects.toThrow(
            "Please provide at least two repository URLs to compare."
        );

        expect(mockedAnalyzeRepo).not.toHaveBeenCalled();
    });

    it("should analyze repositories and sort by health score", async () => {
        mockedAnalyzeRepo.mockImplementation(async (url) => {
            if (url.includes("repo-a")) {
                return createMockAnalysis("repo-a", 65);
            }

            if (url.includes("repo-b")) {
                return createMockAnalysis("repo-b", 90);
            }

            return createMockAnalysis("repo-c", 75);
        });

        const results = await compareRepos([
            "https://github.com/test-owner/repo-a",
            "https://github.com/test-owner/repo-b",
            "https://github.com/test-owner/repo-c",
        ]);

        expect(mockedAnalyzeRepo).toHaveBeenCalledTimes(3);
        expect(results.map((repo) => repo.healthScore)).toEqual([
            90, 75, 65,
        ]);
        expect(results[0].details.name).toBe("repo-b");
    });

    it("should propagate an analysis error", async () => {
        mockedAnalyzeRepo.mockRejectedValue(
            new Error("Repository not found (or private).")
        );

        await expect(
            compareRepos([
                "https://github.com/test-owner/repo-a",
                "https://github.com/test-owner/repo-b",
            ])
        ).rejects.toThrow(
            "Repository not found (or private)."
        );
    });
});
