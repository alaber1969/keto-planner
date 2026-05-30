import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { UserDataProvider } from './contexts/UserDataContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import MealPlanner from './pages/MealPlanner';
import Progress from './pages/Progress';
import Education from './pages/Education';
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
                <Route path="/progress" element={<Progress />} />
                <Route path="/education" element={<Education />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </UserDataProvider>
    </ThemeProvider>
  );
}

export default App;
