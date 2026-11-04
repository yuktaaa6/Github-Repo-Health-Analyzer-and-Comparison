
import "server-only";

import { RepoDetails, Contributor } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Creates headers for authenticated GitHub API requests.
 * The token is read only on the server.
 */
function getGitHubHeaders(): HeadersInit {
    const token = process.env.GITHUB_TOKEN;

    return {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/**
 * Converts GitHub API errors into readable messages.
 */
async function handleGitHubError(response: Response): Promise<never> {
    if (response.status === 401) {
        throw new Error(
            "GitHub authentication failed. Check your GITHUB_TOKEN in .env.local."
        );
    }

    if (response.status === 403) {
        const remaining = response.headers.get("x-ratelimit-remaining");
        const reset = response.headers.get("x-ratelimit-reset");

        if (remaining === "0") {
            const resetTime = reset
                ? new Date(Number(reset) * 1000).toLocaleTimeString()
                : "later";

            throw new Error(
                `GitHub API rate limit exceeded. Try again after ${resetTime}.`
            );
        }

        throw new Error(
            "GitHub denied the request. Check token permissions or API access."
        );
    }

    if (response.status === 404) {
        throw new Error("Repository not found (or private).");
    }

    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
}

interface GitHubRepositoryResponse {
    owner: { login: string };
    name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    watchers_count: number;
    created_at: string;
    updated_at: string;
    has_wiki: boolean;
    has_pages: boolean;
    license: {
        name: string;
        key: string;
        url: string | null;
    } | null;
    default_branch: string;
}

interface GitHubCommitResponse {
    commit: {
        committer: {
            date: string;
        } | null;
    };
}

/**
 * Fetches repository metadata and the latest commit date.
 */
export async function fetchRepoDetails(
    owner: string,
    name: string
): Promise<RepoDetails> {
    const headers = getGitHubHeaders();

    const repoPromise = fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
        { headers, cache: "no-store" }
    );

    const lastCommitPromise = fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/commits?per_page=1`,
        { headers, cache: "no-store" }
    );

    const [res, lastCommitRes] = await Promise.all([
        repoPromise,
        lastCommitPromise,
    ]);

    if (!res.ok) {
        await handleGitHubError(res);
    }

    const data = (await res.json()) as GitHubRepositoryResponse;

    let lastCommitDate = data.updated_at;

    if (lastCommitRes.ok) {
        const commitData =
            (await lastCommitRes.json()) as GitHubCommitResponse[];

        if (commitData.length > 0 && commitData[0].commit.committer) {
            lastCommitDate = commitData[0].commit.committer.date;
        }
    } else if (lastCommitRes.status === 403) {
        await handleGitHubError(lastCommitRes);
    }

    return {
        owner: data.owner.login,
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        watchers: data.watchers_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastCommitDate,
        hasWiki: data.has_wiki,
        hasPages: data.has_pages,
        license: data.license
            ? {
                  name: data.license.name,
                  key: data.license.key,
                  url: data.license.url,
              }
            : null,
        defaultBranch: data.default_branch,
    };
}

interface GitHubContributor {
    login: string;
    contributions: number;
    avatar_url: string;
}

/**
 * Fetches contributors for a repository.
 */
export async function fetchContributors(
    owner: string,
    name: string
): Promise<Contributor[]> {
    const res = await fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contributors?per_page=30`,
        {
            headers: getGitHubHeaders(),
            cache: "no-store",
        }
    );

    if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
            await handleGitHubError(res);
        }

        // Some repositories may not have contributor data available.
        return [];
    }

    const data = (await res.json()) as GitHubContributor[];

    return data.map((contributor) => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatarUrl: contributor.avatar_url,
    }));
}

interface GitHubTreeItem {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
}

interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

/**
 * Fetches the repository's root-level file list.
 */
export async function checkFiles(
    owner: string,
    name: string,
    branch: string
): Promise<string[]> {
    const encodedBranch = encodeURIComponent(branch);

    const res = await fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/git/trees/${encodedBranch}?recursive=0`,
        {
            headers: getGitHubHeaders(),
            cache: "no-store",
        }
    );

    if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
            await handleGitHubError(res);
        }

        return [];
    }

    const data = (await res.json()) as GitHubTreeResponse;

    return data.tree.map((file) => file.path);
}

/**
 * Fetches README content as plain text.
 */
export async function fetchReadme(
    owner: string,
    name: string
): Promise<string | null> {
    const res = await fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/readme`,
        {
            headers: {
                ...getGitHubHeaders(),
                Accept: "application/vnd.github.raw+json",
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
            await handleGitHubError(res);
        }

        return null;
    }

    return await res.text();
}
