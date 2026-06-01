import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { UserDataProvider } from './contexts/UserDataContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import MealPlanner from './pages/MealPlanner';
import SavedPlans from './pages/Progress';
import Education from './pages/Education';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="keto-planner-theme">
      <UserDataProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/meal-planner" element={<MealPlanner />} />
                <Route path="/progress" element={<SavedPlans />} />
                <Route path="/education" element={<Education />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
              </Routes>
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
