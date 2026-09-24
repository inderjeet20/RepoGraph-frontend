import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { useStore } from './store/useStore';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';

export default function App() {
  const { status } = useStore();

  return (
    <ThemeProvider>
      {status === 'ready' ? <WorkspacePage /> : <LandingPage />}
    </ThemeProvider>
  );
}
