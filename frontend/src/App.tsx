import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Spinner } from './components/ui/spinner';
import { ThemeToggle } from './components/ui/ThemeToggle';

// Lazy load pages for better performance
const AdsListPage = lazy(() => import('./pages/AdsListPage').then(m => ({ default: m.AdsListPage })));
const AdDetailPage = lazy(() => import('./pages/AdDetailPage').then(m => ({ default: m.AdDetailPage })));
const AdEditPage = lazy(() => import('./pages/AdEditPage').then(m => ({ default: m.AdEditPage })));

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Что-то пошло не так</h2>
        <p className="text-muted-foreground">{(error as Error).message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
    <Spinner className="h-8 w-8" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="relative min-h-screen">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/ads" replace />} />
            <Route path="/ads" element={<AdsListPage />} />
            <Route path="/ads/:id" element={<AdDetailPage />} />
            <Route path="/ads/:id/edit" element={<AdEditPage />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
