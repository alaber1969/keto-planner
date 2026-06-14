import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { blogPosts, categories } from '../content/blog-posts';

export default function Blog() {
  useEffect(() => {
    document.title = 'Keto Blog — Free Guides, Meal Plans & Tips | KetoPlanner';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Explore our free keto blog for beginner guides, 7-day meal plans, snack lists, keto flu tips, and more. All content is optimized for the ketogenic diet.');
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Keto Blog & Guides
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Free keto resources including beginner guides, meal plans, food lists, and tips
          to help you succeed on your ketogenic diet journey.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="outline" className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 border-emerald-200">
          All Articles
        </Badge>
        {categories.map(cat => (
          <Badge key={cat} variant="outline" className="px-4 py-2 text-sm">
            {cat}
          </Badge>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map(post => (
          <Card key={post.slug} className="group hover:shadow-lg transition-all duration-300 border-emerald-100 hover:border-emerald-200 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
              <CardTitle className="text-xl leading-tight">
                <Link to={`/blog/${post.slug}`} className="hover:text-emerald-600 transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-sm flex items-center gap-3 text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
                <span>•</span>
                <span>{post.author}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                {post.description}
              </p>
              <Button variant="outline" size="sm" asChild className="self-start group-hover:bg-emerald-50">
                <Link to={`/blog/${post.slug}`} className="flex items-center gap-2">
                  Read Article <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter CTA */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Want More Keto Content?</h2>
          <p className="text-emerald-50/90 mb-6 max-w-lg mx-auto">
            We're adding new articles, meal plans, and guides regularly. Use our
            free tools to get personalized keto plans tailored to your body.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50" asChild>
              <Link to="/calculator">
                Try the Keto Calculator
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
              <Link to="/meal-planner">
                Generate AI Meal Plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
