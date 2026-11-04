
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RepoAnalysis } from "@/types";
import {
    Loader2,
    Search,
    Github,
    Sparkles,
    Shield,
    Zap,
    GitCompare,
    Plus,
    Trash2,
} from "lucide-react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ComparisonDashboard } from "@/components/dashboard/comparisonDashboard";
import { FeatureCard } from "@/components/ui/feature-card";
import { analyzeRepo } from "@/lib/analyzer";
import { compareRepos } from "@/lib/comparison";

type Mode = "single" | "compare";

export default function Home() {
    const [mode, setMode] = useState<Mode>("single");

    const [url, setUrl] = useState("");
    const [comparisonUrls, setComparisonUrls] = useState(["", ""]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
    const [comparisonResults, setComparisonResults] =
        useState<RepoAnalysis[] | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setError("Please enter a GitHub repository URL.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze repository.");
      }

      setAnalysis(data as RepoAnalysis);

        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unexpected error while analyzing repository.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async (e: React.FormEvent) => {
        e.preventDefault();

        const urls = comparisonUrls
            .map((value) => value.trim())
            .filter(Boolean);

        if (urls.length < 2) {
            setError("Please enter at least two repository URLs.");
            return;
        }

        const normalizedUrls = urls.map((value) =>
            value.replace(/\/+$/, "").replace(/\.git$/i, "")
        );

        if (
            new Set(normalizedUrls.map((value) => value.toLowerCase()))
                .size !== normalizedUrls.length
        ) {
            setError("Please enter different repository URLs.");
            return;
        }

        setLoading(true);
        setError(null);
        setComparisonResults(null);

        try {
            
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compare repositories.");
      }

      setComparisonResults(data as RepoAnalysis[]);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unexpected error while comparing repositories.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const resetResults = () => {
        setAnalysis(null);
        setComparisonResults(null);
        setError(null);
    };

    const switchMode = (nextMode: Mode) => {
        setMode(nextMode);
        resetResults();
    };

    return (
        <main className="min-h-screen selection:bg-indigo-500/30 overflow-hidden">
            <div className="container mx-auto px-4 py-12 md:py-20">
                {!analysis && !comparisonResults && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col items-center text-center space-y-6 mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm font-medium text-indigo-300">
                                <Sparkles className="w-4 h-4" />
                                GitHub Repo Health Analyzer
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                                Is that repo{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                                    worth your time?
                                </span>
                            </h1>

                            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                                Analyze repository health or compare projects
                                to find the one that best fits your needs.
                            </p>
                        </div>

                        <div className="flex justify-center gap-3 mb-8">
                            <Button
                                type="button"
                                variant={mode === "single" ? "primary" : "outline"}
                                onClick={() => switchMode("single")}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Analyze Repository
                            </Button>

                            <Button
                                type="button"
                                variant={mode === "compare" ? "primary" : "outline"}
                                onClick={() => switchMode("compare")}
                            >
                                <GitCompare className="w-4 h-4 mr-2" />
                                Compare Repositories
                            </Button>
                        </div>

                        {mode === "single" ? (
                            <div className="max-w-2xl mx-auto mb-16">
                                <form
                                    onSubmit={handleAnalyze}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />

                                    <div className="relative flex flex-col sm:flex-row items-stretch gap-3 p-3 glass rounded-2xl">
                                        <div className="flex items-center gap-3 flex-1 px-2">
                                            <Github className="w-6 h-6 text-slate-500 shrink-0" />

                                            <Input
                                                placeholder="https://github.com/owner/repo"
                                                value={url}
                                                onChange={(e) =>
                                                    setUrl(e.target.value)
                                                }
                                                className="border-0 bg-transparent focus:ring-0 text-base h-12 placeholder:text-slate-500"
                                                aria-label="GitHub repository URL"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            className="shrink-0 h-12 px-6 rounded-xl"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Search className="w-5 h-5 mr-2" />
                                            )}
                                            {loading ? "Analyzing..." : "Analyze Repo"}
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-6 text-center text-sm text-slate-500">
                                    Try:
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUrl("https://github.com/facebook/react")
                                        }
                                        className="ml-2 text-indigo-400 underline underline-offset-2"
                                    >
                                        facebook/react
                                    </button>
                                    <span className="mx-2">•</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUrl("https://github.com/vercel/next.js")
                                        }
                                        className="text-indigo-400 underline underline-offset-2"
                                    >
                                        vercel/next.js
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto mb-16">
                                <form
                                    onSubmit={handleCompare}
                                    className="glass rounded-2xl p-5 space-y-4"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            Repositories to compare
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Enter at least two public GitHub repositories.
                                        </p>
                                    </div>

                                    {comparisonUrls.map((value, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="flex-1 flex items-center gap-2">
                                                <Github className="w-5 h-5 text-slate-500 shrink-0" />

                                                <Input
                                                    placeholder={`https://github.com/owner/repo`}
                                                    value={value}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...comparisonUrls,
                                                        ];
                                                        updated[index] =
                                                            e.target.value;
                                                        setComparisonUrls(updated);
                                                    }}
                                                    aria-label={`Repository URL ${index + 1}`}
                                                    className="bg-slate-950/40"
                                                />
                                            </div>

                                            {comparisonUrls.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setComparisonUrls(
                                                            comparisonUrls.filter(
                                                                (_, i) => i !== index
                                                            )
                                                        )
                                                    }
                                                    aria-label={`Remove repository ${index + 1}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setComparisonUrls([
                                                ...comparisonUrls,
                                                "",
                                            ])
                                        }
                                        disabled={loading || comparisonUrls.length >= 5}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add repository
                                    </Button>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        ) : (
                                            <GitCompare className="w-5 h-5 mr-2" />
                                        )}
                                        {loading
                                            ? "Comparing..."
                                            : "Compare Repositories"}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {error && (
                            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl glass border border-red-500/30 text-red-400 text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <FeatureCard
                                icon={Shield}
                                title="Health Score"
                                description="Score repositories using documentation, maintenance, and community signals."
                                delay="delay-100"
                            />
                            <FeatureCard
                                icon={Zap}
                                title="Instant Analysis"
                                description="Retrieve public repository data using GitHub's API."
                                delay="delay-200"
                            />
                            <FeatureCard
                                icon={GitCompare}
                                title="Repository Comparison"
                                description="Compare health scores, category scores, and key repository metrics."
                                delay="delay-300"
                            />
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="animate-slide-up">
                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                onClick={resetResults}
                                className="text-slate-400 pl-0"
                            >
                                ← Back
                            </Button>
                        </div>

                        <Dashboard data={analysis} />
                    </div>
                )}

                {comparisonResults && (
                    <div className="animate-slide-up">
                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                onClick={resetResults}
                                className="text-slate-400 pl-0"
                            >
                                ← Back
                            </Button>
                        </div>

                        <ComparisonDashboard results={comparisonResults} />
                    </div>
                )}
            </div>

        </main>
    );
}
