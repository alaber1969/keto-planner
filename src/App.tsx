import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { UserDataProvider } from './contexts/UserDataContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import './App.css';

// ── Route-level code splitting ──────────────────────────────────────────────
// Each page is fetched only when its route is visited, keeping the initial
// bundle small (better Core Web Vitals — a Google ranking signal).
const Calculator = lazy(() => import('./pages/Calculator'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const SavedPlans = lazy(() => import('./pages/Progress'));
const Education = lazy(() => import('./pages/Education'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Guide = lazy(() => import('./pages/Guide'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="keto-planner-theme">
      <UserDataProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Suspense fallback={
                <div className="flex justify-center py-24" role="status" aria-busy="true">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                  <span className="sr-only">Loading…</span>
                </div>
              }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/meal-planner" element={<MealPlanner />} />
                <Route path="/progress" element={<SavedPlans />} />
                <Route path="/education" element={<Education />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
              </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </UserDataProvider>
    </ThemeProvider>
  );
}

export default App;
