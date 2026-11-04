
"use client";

import { RepoAnalysis } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import {
    Trophy,
    Star,
    GitFork,
    Bug,
    Users,
    BookOpen,
    GitCommit,
    CheckCircle2,
    GitCompare,
} from "lucide-react";

interface ComparisonDashboardProps {
    results: RepoAnalysis[];
}

export function ComparisonDashboard({
    results,
}: ComparisonDashboardProps) {
    if (results.length < 2) {
        return (
            <p className="text-slate-400">
                At least two repositories are required for comparison.
            </p>
        );
    }

    const highestScore = Math.max(
        ...results.map((repo) => repo.healthScore)
    );

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">
                    Repository Comparison
                </h2>
                <p className="text-slate-400 mt-2">
                    Compare repository health, maintenance, documentation,
                    and community activity.
                </p>
            </div>

            {/* Overall health scores */}
            <div
                className={`grid grid-cols-1 gap-6 ${
                    results.length === 2
                        ? "md:grid-cols-2"
                        : "md:grid-cols-2 xl:grid-cols-3"
                }`}
            >
                {results.map((repo) => {
                    const isBest =
                        repo.healthScore === highestScore;

                    return (
                        <Card
                            key={repo.url}
                            className={`space-y-5 ${
                                isBest
                                    ? "border-indigo-500/50 bg-indigo-500/5"
                                    : ""
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-white break-words">
                                        {repo.details.owner}/
                                        {repo.details.name}
                                    </h3>

                                    <p className="text-sm text-slate-400 mt-1">
                                        {repo.details.description ||
                                            "No description provided."}
                                    </p>
                                </div>

                                {isBest && (
                                    <Trophy className="w-6 h-6 text-yellow-400 shrink-0" />
                                )}
                            </div>

                            <div className="text-center py-4">
                                <p className="text-sm text-slate-400">
                                    Health Score
                                </p>
                                <p className="text-5xl font-bold text-white mt-2">
                                    {repo.healthScore}
                                    <span className="text-xl text-slate-500">
                                        /100
                                    </span>
                                </p>
                                <p className="text-sm text-indigo-300 mt-2">
                                    {repo.verdict}
                                </p>

                                {isBest && (
                                    <span className="inline-block mt-3 text-xs font-semibold text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
                                        Highest health score
                                    </span>
                                )}
                            </div>

                            <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                            >
                                View on GitHub
                            </a>

                            <div className="grid grid-cols-2 gap-3">
                                <Metric
                                    label="Stars"
                                    value={repo.details.stars}
                                    icon={Star}
                                />
                                <Metric
                                    label="Forks"
                                    value={repo.details.forks}
                                    icon={GitFork}
                                />
                                <Metric
                                    label="Open Issues"
                                    value={repo.details.openIssues}
                                    icon={Bug}
                                />
                                <Metric
                                    label="Contributors"
                                    value={repo.contributorsCount}
                                    icon={Users}
                                />
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Category-by-category comparison */}
            
            {/* Visual category scorecards */}
            <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40">
                <div className="mb-6">
                    <CardTitle className="text-xl">
                        Where Each Repository Stands Out
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-2">
                        Compare the four health dimensions at a glance.
                        Higher scores indicate stronger results under our
                        scoring rules.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {([
                        {
                            key: "documentation",
                            label: "Documentation",
                            max: 30,
                            color: "#38BDF8",
                            background: "bg-sky-500/10",
                            border: "border-sky-400/30",
                            text: "text-sky-300",
                            getScore: (repo: RepoAnalysis) =>
                                repo.subScores.documentation,
                        },
                        {
                            key: "maintenance",
                            label: "Maintenance",
                            max: 30,
                            color: "#34D399",
                            background: "bg-emerald-500/10",
                            border: "border-emerald-400/30",
                            text: "text-emerald-300",
                            getScore: (repo: RepoAnalysis) =>
                                repo.subScores.maintenance,
                        },
                        {
                            key: "collaboration",
                            label: "Collaboration",
                            max: 20,
                            color: "#A78BFA",
                            background: "bg-violet-500/10",
                            border: "border-violet-400/30",
                            text: "text-violet-300",
                            getScore: (repo: RepoAnalysis) =>
                                repo.subScores.collaboration,
                        },
                        {
                            key: "beginnerFriendly",
                            label: "Beginner Friendly",
                            max: 20,
                            color: "#FBBF24",
                            background: "bg-amber-500/10",
                            border: "border-amber-400/30",
                            text: "text-amber-300",
                            getScore: (repo: RepoAnalysis) =>
                                repo.subScores.beginnerFriendly,
                        },
                    ]).map((category) => {
                        const scores = results.map((repo) => ({
                            repo,
                            score: category.getScore(repo),
                        }));

                        const highest = Math.max(
                            ...scores.map((item) => item.score)
                        );
                        const lowest = Math.min(
                            ...scores.map((item) => item.score)
                        );
                        const tied = highest === lowest;

                        return (
                            <div
                                key={category.key}
                                className={`rounded-2xl border ${category.border} ${category.background} p-4 space-y-4`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-white">
                                        {category.label}
                                    </h4>
                                    <span className={`text-xs ${category.text}`}>
                                        /{category.max}
                                    </span>
                                </div>

                                {scores
                                    .slice()
                                    .sort((a, b) => b.score - a.score)
                                    .map(({ repo, score }) => (
                                        <div key={repo.url} className="space-y-2">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-xs text-slate-300 truncate">
                                                    {repo.details.name}
                                                </span>
                                                <span className="text-sm font-bold text-white tabular-nums">
                                                    {score}
                                                    <span className="text-slate-500 font-normal">
                                                        /{category.max}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="h-2.5 rounded-full bg-slate-950/70 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${(score / category.max) * 100}%`,
                                                        backgroundColor: category.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                <div className="pt-3 border-t border-white/10">
                                    {tied ? (
                                        <p className="text-xs text-slate-300">
                                            <span className="font-semibold">
                                                Even match
                                            </span>
                                            {" "}— all repositories scored equally.
                                        </p>
                                    ) : (
                                        <p className={`text-xs ${category.text}`}>
                                            <span className="font-semibold">
                                                {scores
                                                    .filter((item) => item.score === highest)
                                                    .map((item) => item.repo.details.name)
                                                    .join(", ")}
                                            </span>
                                            {" "}leads by {highest - lowest}{" "}
                                            {highest - lowest === 1 ? "point" : "points"}.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Data-driven comparison insights */}
            <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-950/20">
                <CardTitle className="text-xl mb-2">
                    What the Comparison Tells You
                </CardTitle>
                <p className="text-sm text-slate-400 mb-6">
                    These observations are generated from the repository
                    scores and available GitHub metrics.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((repo) => {
                        const categories = [
                            {
                                label: "Documentation",
                                score: repo.subScores.documentation,
                                max: 30,
                            },
                            {
                                label: "Maintenance",
                                score: repo.subScores.maintenance,
                                max: 30,
                            },
                            {
                                label: "Collaboration",
                                score: repo.subScores.collaboration,
                                max: 20,
                            },
                            {
                                label: "Beginner friendliness",
                                score: repo.subScores.beginnerFriendly,
                                max: 20,
                            },
                        ];

                        const strongest = [...categories].sort(
                            (a, b) =>
                                b.score / b.max - a.score / a.max
                        )[0];

                        const weakest = [...categories].sort(
                            (a, b) =>
                                a.score / a.max - b.score / b.max
                        )[0];

                        return (
                            <div
                                key={repo.url}
                                className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-5 space-y-4"
                            >
                                <div>
                                    <p className="text-xs text-cyan-300 uppercase tracking-wider mb-1">
                                        Repository profile
                                    </p>
                                    <h4 className="text-lg font-bold text-white break-words">
                                        {repo.details.owner}/{repo.details.name}
                                    </h4>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg p-2 bg-emerald-500/10">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-300">
                                            Strongest relative category
                                        </p>
                                        <p className="text-sm text-slate-300 mt-1">
                                            {strongest.label}: {strongest.score}/{strongest.max}
                                            {" "}({Math.round(
                                                (strongest.score / strongest.max) * 100
                                            )}% of available points).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg p-2 bg-amber-500/10">
                                        <GitCompare className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-300">
                                            Area with most room to improve
                                        </p>
                                        <p className="text-sm text-slate-300 mt-1">
                                            {weakest.label}: {weakest.score}/{weakest.max}
                                            {" "}({Math.round(
                                                (weakest.score / weakest.max) * 100
                                            )}% of available points).
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-700/70">
                                    <p className="text-sm text-slate-300">
                                        <span className="font-semibold text-white">
                                            Community signals:
                                        </span>
                                        {" "}{repo.details.stars.toLocaleString()} stars,{" "}
                                        {repo.details.forks.toLocaleString()} forks,{" "}
                                        {repo.contributorsCount.toLocaleString()} contributors.
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>


            {/* Repository checks */}
            <Card>
                <CardTitle className="mb-5">
                    Documentation and Community Checks
                </CardTitle>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-700 text-left">
                                <th className="py-3 pr-4 text-slate-400">
                                    Check
                                </th>
                                {results.map((repo) => (
                                    <th
                                        key={repo.url}
                                        className="py-3 px-3 text-slate-300"
                                    >
                                        {repo.details.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            <CheckRow
                                label="README present"
                                results={results}
                                getValue={(repo) =>
                                    repo.fileChecks.hasReadme
                                }
                            />
                            <CheckRow
                                label="License present"
                                results={results}
                                getValue={(repo) =>
                                    repo.fileChecks.hasLicense
                                }
                            />
                            <CheckRow
                                label="Contributing guide"
                                results={results}
                                getValue={(repo) =>
                                    repo.fileChecks.hasContributing
                                }
                            />
                            <CheckRow
                                label="Code of conduct"
                                results={results}
                                getValue={(repo) =>
                                    repo.fileChecks.hasCodeOfConduct
                                }
                            />
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Score interpretation */}
            <p className="text-xs text-slate-500 leading-relaxed">
                The highest health score indicates the strongest score under
                this application's scoring rules. It does not guarantee that
                the repository is best for every project or use case. Review
                category scores and repository requirements before deciding.
            </p>
        </div>
    );
}

function Metric({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
}) {
    return (
        <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-lg font-bold text-white">
                    {value.toLocaleString()}
                </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
    );
}

function ScoreRow({
    label,
    max,
    icon: Icon,
    results,
    getScore,
}: {
    label: string;
    max: number;
    icon: React.ElementType;
    results: RepoAnalysis[];
    getScore: (repo: RepoAnalysis) => number;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Icon className="w-4 h-4 text-indigo-400" />
                {label}
                <span className="text-xs text-slate-500">
                    (out of {max})
                </span>
            </div>

            <div className="space-y-3">
                {results.map((repo) => {
                    const score = getScore(repo);
                    const percentage = (score / max) * 100;

                    return (
                        <div key={repo.url}>
                            <div className="flex justify-between gap-3 text-xs mb-1">
                                <span className="text-slate-400">
                                    {repo.details.name}
                                </span>
                                <span className="text-white">
                                    {score}/{max}
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CheckRow({
    label,
    results,
    getValue,
}: {
    label: string;
    results: RepoAnalysis[];
    getValue: (repo: RepoAnalysis) => boolean;
}) {
    return (
        <tr className="border-b border-slate-800/50 last:border-0">
            <td className="py-3 pr-4 text-slate-300">{label}</td>

            {results.map((repo) => {
                const passed = getValue(repo);

                return (
                    <td key={repo.url} className="py-3 px-3">
                        <span
                            className={
                                passed
                                    ? "text-green-400"
                                    : "text-red-400"
                            }
                        >
                            {passed ? "Pass" : "Missing"}
                        </span>
                    </td>
                );
            })}
        </tr>
    );
}
