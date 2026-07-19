import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft, Sparkles, Calculator, Share2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import SocialShare from '../components/SocialShare';
import { getBlogPost, getRecentPosts } from '../content/blog-posts';

function injectMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function injectMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function removeExistingJSONLD(type: string) {
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '{}');
      if (data['@type'] === type) script.remove();
    } catch { /* skip */ }
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;
  const recentPosts = getRecentPosts(3);

  useEffect(() => {
    if (post) {
      const url = `https://ketoai.app/blog/${post.slug}`;
      const image = post.image ? `https://ketoai.app${post.image}` : 'https://ketoai.app/og-image.png';

      // --- Core SEO ---
      document.title = `${post.title} | KetoPlanner`;
      injectMeta('description', post.description);
      injectMeta('keywords', post.keywords);
      injectMeta('robots', 'index, follow');

      // --- Canonical ---
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
      canonical.setAttribute('href', url);

      // --- Open Graph ---
      injectMetaProperty('og:title', post.title);
      injectMetaProperty('og:description', post.description);
      injectMetaProperty('og:url', url);
      injectMetaProperty('og:image', image);
      injectMetaProperty('og:type', 'article');

      // --- Twitter Card ---
      injectMeta('twitter:title', post.title);
      injectMeta('twitter:description', post.description);
      injectMeta('twitter:image', image);
      injectMeta('twitter:card', 'summary_large_image');

      // --- JSON-LD BlogPosting Schema ---
      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.description,
        "image": image,
        "datePublished": post.date,
        "author": { "@type": "Person", "name": post.author },
        "publisher": {
          "@type": "Organization",
          "name": "KetoPlanner",
          "logo": { "@type": "ImageObject", "url": "https://ketoai.app/logo.svg" }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      };

      // Remove old BlogPosting schemas before adding fresh one
      removeExistingJSONLD('BlogPosting');

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Article Not Found</h1>
        <p className="text-gray-600">The article you're looking for doesn't exist or has been moved.</p>
        <Button asChild>
          <Link to="/blog">Browse All Articles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Article Header */}
      <article>
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            {post.description}
          </p>

          <div className="text-sm text-gray-500">
            By <span className="font-medium text-gray-700">{post.author}</span>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-emerald max-w-none space-y-6">
          {post.content.map((html, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </div>

        {/* Share */}
        <div className="mt-10 p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-medium text-gray-700 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-emerald-600" />
              Share this article:
            </span>
            <SocialShare
              title={post.title}
              description={post.description}
              url={`https://ketoai.app/blog/${post.slug}`}
            />
          </div>
        </div>
      </article>

      {/* Related Content */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">More Articles You Might Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPosts.filter(p => p.slug !== post.slug).slice(0, 3).map(related => (
            <Link key={related.slug} to={`/blog/${related.slug}`} className="group">
              <Card className="h-full hover:shadow-md transition-shadow border-emerald-100">
                <CardContent className="p-5">
                  <Badge variant="outline" className="text-xs mb-2">{related.category}</Badge>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm mb-2">
                    {related.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{related.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Get Your Personalized Keto Plan</h2>
          <p className="text-emerald-50/90 mb-6 max-w-lg mx-auto">
            Don't just read about keto — get a custom plan tailored to your body, goals, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50" asChild>
              <Link to="/calculator">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Your Macros
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
              <Link to="/meal-planner">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate AI Meal Plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute
          medical advice. Consult a healthcare professional before starting any diet, especially if you have
          pre-existing health conditions.
        </AlertDescription>
      </Alert>

      {/* Prose styles */}
      <style>{`
        .prose h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose h3 { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .prose p { color: #4b5563; line-height: 1.75; margin-bottom: 1rem; }
        .prose ul, .prose ol { color: #4b5563; line-height: 1.75; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose li { margin-bottom: 0.25rem; }
        .prose strong { color: #111827; }
        .prose a { color: #059669; text-decoration: underline; }
        .prose a:hover { color: #047857; }
        .prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .prose th { background: #f0fdf4; text-align: left; padding: 0.75rem; border: 1px solid #d1d5db; font-weight: 600; }
        .prose td { padding: 0.75rem; border: 1px solid #d1d5db; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
