import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Download, ArrowRight, Sparkles, Calculator, Utensils, ClipboardList, BookOpen, AlertTriangle, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import SocialShare from '../components/SocialShare';

const steps = [
  {
    icon: Calculator,
    title: '1. Calculate Your Numbers',
    desc: 'Go to the Calculator page and enter your age, gender, weight, height, and activity level. Set your weight loss goal (recommended: 1-2 lbs/week).',
    details: [
      'Your BMR (Basal Metabolic Rate) — calories burned at rest',
      'Your TDEE (Total Daily Energy Expenditure) — calories with activity',
      'Your BMI and weight loss projection timeline',
      'Daily macro targets: Fat (75%), Protein (20%), Carbs (5%)',
    ],
  },
  {
    icon: Sparkles,
    title: '2. Generate AI Meal Plan',
    desc: 'After calculating, click "Generate AI Meal Plan" to get a personalized 7-day keto menu created just for you by AI.',
    details: [
      'Every meal includes ingredients, amounts, and step-by-step instructions',
      'Macro breakdown for each meal (calories, fat, protein, carbs)',
      'You can regenerate as many times as you want — each plan is unique',
      'No AI key? No problem — click "Sample Mode" for a built-in plan',
    ],
  },
  {
    icon: Utensils,
    title: '3. View Your Meals',
    desc: 'Browse the daily view to see breakfast, lunch, dinner, and snack for each day of the week.',
    details: [
      'Daily tab — shows one full day at a time with complete recipes',
      'Weekly tab — overview of all 7 days side by side',
      'Expand any meal card to see all ingredients and full instructions',
      'Prep times are included — pick meals that fit your schedule',
    ],
  },
  {
    icon: Download,
    title: '4. Download & Shop',
    desc: 'Export your meal plan and get a categorized shopping list for the week.',
    details: [
      'Click "Plan" to download a text file of your full 7-day menu',
      'Click "Shopping List" to get everything you need, organized by category',
      'Take the shopping list to the store — no thinking required',
      'Plans are saved automatically in "My Plans" for revisiting later',
    ],
  },
  {
    icon: ClipboardList,
    title: '5. Revisit Saved Plans',
    desc: 'Every plan you generate is auto-saved in "My Plans" page. Browse, rename, download, or delete past plans anytime.',
    details: [
      'Plans are stored in your browser (no account needed)',
      'Rename plans to remember which one you liked best',
      'Compare different plans side by side',
      'Generate a new plan anytime — all past plans stay saved',
    ],
  },
  {
    icon: BookOpen,
    title: '6. Learn & Adjust',
    desc: 'Visit the "Learn Keto" page for tips on ketosis, what to eat, and how to adjust macros as you progress.',
    details: [
      'Understand the science behind ketosis',
      'Learn which foods are keto-friendly and which to avoid',
      'Adjust your calories as you lose weight',
      'Stay consistent — results take time!',
    ],
  },
];

export default function Guide() {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'How to Use KetoPlanner — Complete Guide to Keto Diet Planning | KetoPlanner';
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateTextGuide();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keto-planner-guide.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How to Use KetoPlanner
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Your complete guide to calculating macros, generating AI meal plans, and 
          staying on track with your keto journey — in 6 simple steps.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={handlePrint} variant="outline" size="lg">
            <Printer className="mr-2 h-5 w-5" />
            Print / Save as PDF
          </Button>
          <Button onClick={handleDownload} variant="outline" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download Text Guide
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div ref={printRef} className="space-y-8">
        {steps.map((step, index) => (
          <Card key={index} className="border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <step.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-emerald-500 mt-0.5">✦</span>
                    {detail}
                  </li>
                ))}
              </ul>
              {index < steps.length - 1 && (
                <div className="mt-4 flex justify-center">
                  <ArrowRight className="h-5 w-5 text-emerald-400" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-3">💡 Quick Tips for Success</h3>
          <ul className="space-y-2 text-emerald-50">
            <li>• <strong>Stay under 20-25g net carbs</strong> per day to stay in ketosis</li>
            <li>• <strong>Drink plenty of water</strong> — keto is diuretic, aim for 2-3 liters daily</li>
            <li>• <strong>Don't forget electrolytes</strong> — sodium, potassium, magnesium prevent keto flu</li>
            <li>• <strong>Eat when hungry</strong> — don't force yourself to eat if you're not hungry</li>
            <li>• <strong>Regenerate plans weekly</strong> — the AI creates new variety each time</li>
            <li>• <strong>Use the shopping list</strong> — it saves time and prevents impulse buys</li>
          </ul>
        </CardContent>
      </Card>

      {/* Share */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-gray-700">Share this guide:</span>
        </div>
        <SocialShare url="https://ketoai.app/guide" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 h-auto py-4">
          <Link to="/calculator" className="flex items-center justify-center gap-3">
            <Calculator className="h-6 w-6" />
            <div className="text-left">
              <div className="font-bold">Start Calculator</div>
              <div className="text-xs text-emerald-100">Get your personalized macros</div>
            </div>
          </Link>
        </Button>
        <Button size="lg" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 h-auto py-4">
          <Link to="/meal-planner" className="flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6" />
            <div className="text-left">
              <div className="font-bold">Generate AI Meal Plan</div>
              <div className="text-xs text-yellow-100">Get your 7-day keto menu</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Disclaimer */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Not medical advice.</strong> This guide is for educational purposes. 
          Consult a healthcare professional before starting any diet, especially if you have 
          pre-existing health conditions. See our full <Link to="/disclaimer" className="text-amber-600 underline">Health Disclaimer</Link>.
        </AlertDescription>
      </Alert>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, footer, button, .no-print { display: none !important; }
          body { background: white; font-size: 12pt; }
          .max-w-4xl { max-width: 100% !important; }
          .bg-gradient-to-r { background: #f0fdf4 !important; color: black !important; }
          a { text-decoration: none !important; }
        }
      `}</style>
    </div>
  );
}

function generateTextGuide(): string {
  let content = '========================================\n';
  content += '    KETOPLANNER - USER GUIDE\n';
  content += '    How to Calculate & Plan Your Keto Journey\n';
  content += '========================================\n\n';

  steps.forEach((step) => {
    content += `${step.title}\n`;
    content += `${'-'.repeat(step.title.length)}\n`;
    content += `${step.desc}\n\n`;
    step.details.forEach((d) => {
      content += `  • ${d}\n`;
    });
    content += '\n';
  });

  content += '---\n';
  content += '💡 Quick Tips:\n';
  content += '  • Stay under 20-25g net carbs per day\n';
  content += '  • Drink 2-3 liters of water daily\n';
  content += '  • Supplement electrolytes (sodium, potassium, magnesium)\n';
  content += "  • Eat when hungry — don't force meals\n";
  content += '  • Regenerate plans weekly for variety\n';
  content += '  • Use the shopping list to stay organized\n\n';

  content += '========================================\n';
  content += 'KetoPlanner - https://ketoai.app\n';
  content += 'Not medical advice. Consult your doctor.\n';
  content += '========================================\n';

  return content;
}
