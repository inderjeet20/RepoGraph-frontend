import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HistoryDrawer from '../components/history/HistoryDrawer';
import { useStore } from '../store/useStore';
import { ArrowRight, AlertCircle } from 'lucide-react';

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
    setLoadingStep('Fetching repository tree & architecture manifests...');

    try {
      setTimeout(() => {
        setLoadingStep('Synthesizing architecture nodes & dependency edges...');
      }, 700);

      const res = await fetch('http://localhost:8000/api/analyze', {
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
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-2xl text-center">
          {/* Headline */}
          <p className="text-lg sm:text-xl font-normal text-neutral-700 dark:text-neutral-300 mb-8 leading-relaxed max-w-xl mx-auto">
            We are going to show you full flow of your repository like git in a beautiful manner, it's{' '}
            <span className="font-semibold text-neutral-900 dark:text-white">RepoGraph AI</span>
          </p>

          {/* Central repository input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm focus-within:border-airforce-500 dark:focus-within:border-airforce-500 transition-colors">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                placeholder="https://github.com/username/repository"
                className="w-full px-3 py-2.5 bg-transparent font-mono text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading || !repoUrl.trim()}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-airforce-500 hover:bg-airforce-600 active:bg-airforce-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="mt-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left font-mono text-xs text-airforce-600 dark:text-airforce-400 animate-pulse">
                <span>{loadingStep || 'Connecting to repository...'}</span>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-rose-500 text-left px-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Slide-Over History Sidebar */}
      <HistoryDrawer />
    </div>
  );
}
