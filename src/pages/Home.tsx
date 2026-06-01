import { Link } from 'react-router-dom';
import SocialShare from '../components/SocialShare';
import StarRating from '../components/StarRating';
import { ArrowRight, Calculator, Utensils, BookOpen, Target, ClipboardList, Compass, Share2, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: 'Personalized Calculator',
      description: 'Get precise BMR, TDEE, and macro calculations tailored to your goals.',
      link: '/calculator',
    },
    {
      icon: Utensils,
      title: 'Custom Meal Plans',
      description: 'Generate personalized keto meal plans with shopping lists.',
      link: '/meal-planner',
    },
    {
      icon: ClipboardList,
      title: 'Saved Meal Plans',
      description: 'Browse, compare, and re-download all your AI-generated meal plans.',
      link: '/progress',
    },
    {
      icon: Compass,
      title: 'How-to Guide',
      description: 'Step-by-step guide to using the calculator, AI meal plans, and tracking.',
      link: '/guide',
    },
    {
      icon: BookOpen,
      title: 'Keto Education',
      description: 'Learn the science behind ketosis and safe weight loss.',
      link: '/education',
    },
  ];

  const stats = [
    {
      icon: Calculator,
      value: 'Free',
      label: 'No account required',
    },
    {
      icon: Target,
      value: '100%',
      label: 'AI-generated meal plans',
    },
    {
      icon: Star,
      value: 'Privacy',
      label: 'Your data stays on your device',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 p-8 md:p-16 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
            ✨ Science-Based Keto Planning
          </Badge>
          <h1 className="mb-6 text-4xl md:text-6xl font-bold leading-tight">
            Your Personalized
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Keto Journey
            </span>
            Starts Here
          </h1>
          <p className="mb-8 text-lg md:text-xl text-emerald-50 max-w-2xl">
            Transform your health with our comprehensive keto diet planning platform. 
            Get personalized meal plans, macro calculations, and expert guidance for sustainable weight loss.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50" asChild>
              <Link to="/calculator" className="flex items-center">
                Start Planning <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-emerald-200 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" asChild>
              <Link to="/education">
                Learn About Keto
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-3/5 overflow-hidden rounded-l-3xl">
          {/* Gradient blend on the left edge so it fades into the green hero */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-emerald-600 to-transparent z-10" />
          <img
            src="/images/keto-foods-hero.jpg"
            alt="Keto foods"
            className="h-full w-full object-cover object-center scale-125"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50">
            <CardContent className="pt-6">
              <stat.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Keto Success
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and knowledge you need 
            for a successful ketogenic lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {feature.description}
                </CardDescription>
                <Button variant="outline" className="group-hover:bg-emerald-50" asChild>
                  <Link to={feature.link} className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Health?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Get your personalized keto meal plan in seconds — no account, no strings attached.
          Just fill in your info and let AI do the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link to="/calculator">
              Start Your Journey
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/education">
              Learn More
            </Link>
          </Button>
        </div>
      </section>

      {/* Share + Rating + Support */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Share KetoPlanner</h3>
          <p className="text-gray-600 mb-4 text-sm">Know someone who wants to start keto? Share this free tool!</p>
          <div className="flex justify-center">
            <SocialShare variant="row" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
          <StarRating />
        </div>
        <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Support the Project</h3>
          <p className="text-gray-600 mb-4 text-sm">If this tool helped you, consider buying me a coffee!</p>
          <a href="https://buymeacoffee.com/ketoaicoffee" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" className="h-12 mx-auto" />
          </a>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-amber-100 rounded-full">
            <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Important Health Notice</h3>
            <p className="text-amber-700 text-sm">
              This tool provides educational information and should not replace professional medical advice. 
              Please consult with a healthcare professional before starting any new diet, especially if you have 
              pre-existing health conditions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
