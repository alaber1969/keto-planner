import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-md mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-3">
              <ChefHat className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                KetoPlanner
              </span>
            </Link>
            <p className="text-sm text-gray-600 max-w-md">
              AI-powered keto diet planner. Get personalized meal plans, macro calculations, 
              and recipes tailored to your body and goals — all generated fresh by artificial intelligence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link></li>
              <li><Link to="/calculator" className="hover:text-emerald-600 transition-colors">Calculator</Link></li>
              <li><Link to="/meal-planner" className="hover:text-emerald-600 transition-colors">Meal Planner</Link></li>
              <li><Link to="/progress" className="hover:text-emerald-600 transition-colors">My Plans</Link></li>
              <li><Link to="/education" className="hover:text-emerald-600 transition-colors">Learn Keto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="hover:text-emerald-600 transition-colors">Health Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} KetoPlanner. All rights reserved.</p>
          <p className="text-xs">
            Built with ❤️ — Not medical advice. Consult a healthcare professional before starting any diet.
          </p>
        </div>
      </div>
    </footer>
  );
}
