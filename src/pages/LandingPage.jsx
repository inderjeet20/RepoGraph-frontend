import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HistoryDrawer from '../components/history/HistoryDrawer';
import { useStore } from '../store/useStore';
import { ArrowRight, AlertCircle, GitBranch, Zap, Globe } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

// Example repos to showcase
const EXAMPLE_REPOS = [
  { label: 'facebook/react',       url: 'https://github.com/facebook/react' },
  { label: 'tiangolo/fastapi',     url: 'https://github.com/tiangolo/fastapi' },
  { label: 'vercel/next.js',       url: 'https://github.com/vercel/next.js' },
];

// Feature highlights
const FEATURES = [
  { icon: GitBranch, text: 'Interactive architecture graph' },
  { icon: Zap,       text: 'Repo-grounded AI chat (CRAG)' },
  { icon: Globe,     text: 'Web fallback for external info' },
];

export default function LandingPage() {
  const {
    repoUrl,
    setRepoUrl,
    setStatus,
    setGraphData,
    setError,
    error,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleAnalyze = async (targetUrl) => {
    const cleanUrl = (targetUrl || repoUrl).trim();
    if (!cleanUrl) return;

    setLoading(true);
    setStatus('analyzing');
    setError('');
    if (targetUrl) setRepoUrl(targetUrl);

    const steps = [
      [0,    'Fetching repository tree & architectural files…'],
      [900,  'Chunking code & indexing vectors into Qdrant…'],
      [2800, 'Synthesizing architecture graph with Gemini…'],
      [5000, 'Almost there — validating nodes & edges…'],
    ];

    const timers = steps.map(([delay, msg]) =>
      setTimeout(() => setLoadingStep(msg), delay)
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: cleanUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to analyze repository');
      }

      const data = await res.json();
      setGraphData(data, data.repo_name, cleanUrl);
    } catch (e) {
      setError(e.message);
      setStatus('idle');
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-50 dark:bg-neutral-950
      text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-xl text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-airforce-500/10 border border-airforce-500/20 text-airforce-600 dark:text-airforce-400
            text-[11px] font-mono font-semibold uppercase tracking-wider mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-airforce-500 animate-pulse" />
            AI-Powered Repository Analysis
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white
            leading-tight tracking-tight mb-3">
            Understand any
            <span className="text-airforce-500"> GitHub repo</span>
            <br />in seconds.
          </h1>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed max-w-sm mx-auto">
            RepoGraph visualizes architecture as an interactive graph and lets you
            chat with the codebase using AI — grounded in the actual source code.
          </p>

          {/* Input form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}
            className="w-full mb-4"
          >
            <div className={`flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl
              bg-white dark:bg-neutral-900
              border-2 transition-colors duration-150
              ${loading
                ? 'border-airforce-500/40'
                : 'border-neutral-200 dark:border-neutral-800 focus-within:border-airforce-500'
              }
              shadow-sm`}
            >
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                placeholder="https://github.com/owner/repository"
                className="flex-1 px-3 py-2.5 bg-transparent font-mono text-sm
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-600
                  focus:outline-none disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading || !repoUrl.trim()}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5
                  rounded-xl text-sm font-semibold text-white
                  bg-airforce-500 hover:bg-airforce-600 active:bg-airforce-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Loading step */}
            {loading && (
              <div className="mt-3 px-4 py-2.5 rounded-xl bg-airforce-500/5
                border border-airforce-500/15 text-left">
                <p className="text-[11px] font-mono text-airforce-600 dark:text-airforce-400 animate-pulse">
                  {loadingStep || 'Connecting…'}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-start gap-2 text-[11px] font-mono text-rose-500 text-left px-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Example repos */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <span className="text-[11px] text-neutral-400 font-mono">Try:</span>
            {EXAMPLE_REPOS.map(({ label, url }) => (
              <button
                key={url}
                onClick={() => handleAnalyze(url)}
                disabled={loading}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg
                  bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700
                  text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700
                  transition-colors cursor-pointer disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400"
              >
                <Icon className="w-3.5 h-3.5 text-airforce-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </main>

      <HistoryDrawer />
    </div>
  );
}
