import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import { ArrowRight, GitBranch } from 'lucide-react';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [submittedRepo, setSubmittedRepo] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setError('Please enter a repository URL');
      return;
    }
    setError('');
    setSubmittedRepo(trimmed);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col font-sans bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
          <div className="w-full max-w-2xl text-center">
            {/* Text written above the box */}
            <p className="text-lg sm:text-xl font-normal text-neutral-700 dark:text-neutral-300 mb-8 leading-relaxed max-w-xl mx-auto">
              We are going to show you full flow of your repository like git in a beautiful manner, it's{' '}
              <span className="font-semibold text-neutral-900 dark:text-white">RepoGraph</span>
            </p>

            {/* Box to add repository link */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm focus-within:border-airforce-500 dark:focus-within:border-airforce-500 transition-colors">
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3 py-2.5 bg-transparent font-mono text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-airforce-500 hover:bg-airforce-600 active:bg-airforce-700 transition-colors cursor-pointer"
                >
                  <span>Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <p className="mt-2 text-xs font-mono text-rose-500 text-left px-2">
                  {error}
                </p>
              )}
            </form>

            {/* Clean minimal submission state */}
            {submittedRepo && (
              <div className="mt-8 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left">
                <div className="flex items-center gap-2 text-xs font-mono text-airforce-500 font-medium mb-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Repository Loaded</span>
                </div>
                <div className="font-mono text-sm text-neutral-800 dark:text-neutral-200 break-all">
                  {submittedRepo}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
