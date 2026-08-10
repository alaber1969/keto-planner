/**
 * Build-time SSG (Static Site Generation).
 *
 * After `vite build`, this script reads the built dist/index.html and generates
 * static HTML files for:
 *   - The homepage (/) with real H1 + intro content
 *   - Main routes: /calculator, /meal-planner, /guide, /education, /blog
 *   - Every blog post at /blog/<slug>/ with the FULL article body (no JS required)
 *
 * Express's static middleware serves these files directly, giving Googlebot
 * fully-rendered HTML with correct meta tags, canonical URLs, Open Graph tags,
 * Twitter Cards, and JSON-LD schema — without relying on JavaScript execution.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const SITE = 'https://ketoai.app';
const OG_IMAGE = `${SITE}/og-image.png`;

// ── Load blog posts from src/content/blog-posts.ts ────────────────────────
// The file is TypeScript, but it is pure data + helper functions. We strip the
// type annotations / ES-module keywords, then require the remainder as CJS so
// the prerendered HTML can embed the FULL article text (not just meta tags).
function loadBlogPosts() {
  const src = path.join(__dirname, '..', 'src', 'content', 'blog-posts.ts');
  let js = fs.readFileSync(src, 'utf-8');

  // Remove the BlogPost interface block (pure type declarations).
  js = js.replace(/export interface BlogPost\s*\{[\s\S]*?\n\}/, '');

  // Convert ES-module exports to CJS.
  js = js.replace('export const blogPosts: BlogPost[] = [', 'const blogPosts = [');
  js = js.replace('export function getBlogPost(slug: string): BlogPost | undefined {', 'function getBlogPost(slug) {');
  js = js.replace('export function getRecentPosts(count: number = 3): BlogPost[] {', 'function getRecentPosts(count = 3) {');
  js = js.replace('export function getPostsByCategory(category: string): BlogPost[] {', 'function getPostsByCategory(category) {');
  js = js.replace('export const categories', 'const categories');

  // Append a CJS export.
  js += '\nmodule.exports = { blogPosts, getBlogPost, getRecentPosts, getPostsByCategory, categories };';

  const tmp = path.join(DIST, `.blog-posts-data-${Date.now()}.cjs`);
  fs.writeFileSync(tmp, js, 'utf-8');
  const mod = require(tmp);
  fs.unlinkSync(tmp);
  return mod.blogPosts;
}

// ── HTML helpers ──────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setTitle(html, title) {
  return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function setMetaName(html, name, content) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta name="${name}" content="${content}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setMetaProperty(html, property, content) {
  const re = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*>`, 'i');
  const tag = `<meta property="${property}" content="${content}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setCanonical(html, url) {
  const re = /<link[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${url}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setBody(html, bodyHtml) {
  return html.replace(/<div id="root">\s*<\/div>/, `<div id="root">\n${bodyHtml}\n</div>`);
}

function removeAllJSONLD(html) {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*\n?/g, '');
}

function injectJSONLD(html, schemas) {
  let schemaHtml = '';
  for (const schema of schemas || []) {
    schemaHtml += `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>\n`;
  }
  return html.replace('</head>', `${schemaHtml}</head>`);
}

// ── Build a full static HTML page from the base Vite template ────────────

function buildPage(html, cfg) {
  html = setTitle(html, cfg.title);
  html = setMetaName(html, 'description', cfg.description);
  html = setMetaName(html, 'keywords', cfg.keywords);
  html = setCanonical(html, cfg.url);

  // Open Graph
  html = setMetaProperty(html, 'og:type', cfg.ogType || 'website');
  html = setMetaProperty(html, 'og:url', cfg.url);
  html = setMetaProperty(html, 'og:title', cfg.title);
  html = setMetaProperty(html, 'og:description', cfg.description);
  html = setMetaProperty(html, 'og:image', cfg.image || OG_IMAGE);

  // Twitter Card
  html = setMetaName(html, 'twitter:card', 'summary_large_image');
  html = setMetaName(html, 'twitter:title', cfg.title);
  html = setMetaName(html, 'twitter:description', cfg.description);
  html = setMetaName(html, 'twitter:image', cfg.image || OG_IMAGE);

  // Replace JSON-LD with page-specific schema.
  html = removeAllJSONLD(html);
  html = injectJSONLD(html, cfg.schemas);

  // Inject the static body (React replaces it on mount — crawlers see it before JS runs).
  if (cfg.body) {
    html = setBody(html, cfg.body);
  }

  return html;
}

// ── Body builders ─────────────────────────────────────────────────────────

function buildArticleBody(post) {
  const visibleContent = (post.content || [])
    .filter(s => !/^\s*<!--\s*(META|CTR|CTX)-/.test(s))
    .join('\n');

  return `  <article>
    <header>
      <p>${escHtml(post.category)} &middot; ${escHtml(post.readTime || '')} &middot; <time datetime="${escHtml(post.date)}">${escHtml(post.date)}</time></p>
      <h1>${escHtml(post.title)}</h1>
      <p>${escHtml(post.description)}</p>
      <p>By <span>${escHtml(post.author)}</span></p>
    </header>
    <div>
${visibleContent}
    </div>
  </article>`;
}

function buildPageBody(h1, intro, extraHtml) {
  return `  <header>
    <h1>${escHtml(h1)}</h1>
    <p>${escHtml(intro)}</p>
  </header>
${extraHtml || ''}`;
}

// ── Schemas ───────────────────────────────────────────────────────────────

function webAppSchema(name, url, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'KetoPlanner' },
  };
}

function articleSchema(headline, url, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    publisher: { '@type': 'Organization', name: 'KetoPlanner' },
  };
}

const homepageFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the keto calculator work?',
      acceptedAnswer: { '@type': 'Answer', text: 'Enter your age, gender, weight, height, and activity level to get your BMR, TDEE, BMI, and personalized keto macro targets.' },
    },
    {
      '@type': 'Question',
      name: 'Can I get a personalized keto meal plan?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes! After calculating your macros, click Generate AI Meal Plan to get a custom 7-day keto menu with breakfast, lunch, dinner, and snacks.' },
    },
    {
      '@type': 'Question',
      name: 'Is KetoPlanner free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, KetoPlanner is completely free. The keto calculator, meal planner, and saved plans all work without any payment or account registration.' },
    },
    {
      '@type': 'Question',
      name: 'What makes this a Keto AI calculator?',
      acceptedAnswer: { '@type': 'Answer', text: 'KetoPlanner uses AI-powered algorithms to calculate your personalized keto macros based on your age, weight, height, gender, and activity level.' },
    },
  ],
};

// ── Page definitions ──────────────────────────────────────────────────────

function buildPages() {
  const posts = loadBlogPosts();

  const postItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'KetoPlanner Blog',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/blog/${p.slug}/`,
      name: p.title,
    })),
  };

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'KetoPlanner Blog',
    url: `${SITE}/blog/`,
    description: 'Free keto resources including beginner guides, meal plans, food lists, and tips.',
  };

  const pages = [
    {
      out: 'index.html',
      title: 'KetoPlanner — #1 Keto AI Diet Calculator & Meal Planner',
      description: 'Free Keto AI calculator and meal planner. Get personalized keto macros, BMR, TDEE, BMI, and AI-generated 7-day meal plans tailored to your body and goals.',
      keywords: 'keto ai, keto calculator, keto meal planner, AI meal plan, ketogenic diet, macro calculator, keto recipes, weight loss, BMI calculator, BMR calculator',
      url: `${SITE}/`,
      schemas: [
        webAppSchema('KetoPlanner', `${SITE}/`, 'AI-powered keto diet calculator and meal planner. Calculates BMR, TDEE, BMI, macros and generates personalized 7-day keto meal plans.'),
        homepageFAQ,
      ],
      body: buildPageBody(
        'Your AI-Powered Keto Journey Starts Here',
        'Transform your health with our Keto AI platform. Get personalized meal plans, precision macro calculations, and expert guidance for sustainable weight loss.',
        `    <section>
      <h2>Everything You Need for Keto Success</h2>
      <ul>
        <li>Free keto calculator — personalized macros, BMR, TDEE, and BMI</li>
        <li>AI-generated 7-day keto meal plans tailored to your goals</li>
        <li>Beginner guides, keto food lists, and expert tips</li>
      </ul>
      <p>Start your keto journey with a free personalized macro calculation at <a href="${SITE}/calculator/">ketoai.app/calculator</a>.</p>
    </section>`,
      ),
    },
    {
      out: 'calculator/index.html',
      title: 'Keto Macro Calculator — Free Personalized Keto Diet Calculator | KetoPlanner',
      description: 'Free keto macro calculator. Enter your age, weight, height, and activity level to get personalized keto macros (fat, protein, carbs), BMR, TDEE, BMI, and weight-loss targets — then generate a custom 7-day keto meal plan.',
      keywords: 'keto macro calculator, keto calculator, keto diet macro calculator, keto weight loss calculator, keto fat loss calculator, calculate keto macros, keto meal calculator, macro calculator for perimenopause, keto macros for weight loss, free keto calculator',
      url: `${SITE}/calculator/`,
      schemas: [webAppSchema('Keto Macro Calculator', `${SITE}/calculator/`, 'Free keto macro calculator that computes personalized macros, BMR, TDEE, BMI, and weight-loss targets.')],
      body: buildPageBody(
        'Keto Calculator',
        'Get personalized macro calculations and weight loss projections',
        `    <section>
      <ul>
        <li>Personalized keto macros: fat, protein, and net carbs for your body</li>
        <li>BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure)</li>
        <li>BMI analysis and weight-loss projections</li>
        <li>Weight-loss goal targeting (1-2 lbs/week recommendations)</li>
      </ul>
      <p>Enter your stats above to get your numbers in under a minute, then generate a custom 7-day keto meal plan with our <a href="${SITE}/meal-planner/">AI meal planner</a>.</p>
    </section>`,
      ),
    },
    {
      out: 'meal-planner/index.html',
      title: 'Keto AI Meal Planner — Generate Custom 7-Day Diet Plans | KetoPlanner',
      description: 'Generate custom keto meal plans with our AI meal planner. Enter your macros and get a personalized 7-day keto diet plan with breakfast, lunch, dinner, and snacks — free.',
      keywords: 'keto meal plan generator, keto meal planner, keto meal plan, AI meal plan, custom keto meal plan, 7 day keto meal plan, keto diet plan, keto menu planner',
      url: `${SITE}/meal-planner/`,
      schemas: [webAppSchema('Keto AI Meal Planner', `${SITE}/meal-planner/`, 'AI keto meal planner that generates custom 7-day keto diet plans with full macro breakdowns.')],
      body: buildPageBody(
        'AI-Powered Meal Plan',
        'Custom keto meals generated by AI to match your exact macro targets',
        `    <section>
      <ul>
        <li>7-day personalized keto meal plans created by AI</li>
        <li>Breakfast, lunch, dinner, and snacks with ingredients and instructions</li>
        <li>Macro breakdown for every meal: calories, fat, protein, carbs</li>
        <li>Unlimited regenerations — every plan is unique</li>
        <li>Sample mode available without an AI key</li>
      </ul>
      <p>First get your personalized macros with our free <a href="${SITE}/calculator/">keto macro calculator</a>, then generate a plan here.</p>
    </section>`,
      ),
    },
    {
      out: 'guide/index.html',
      title: "How to Use KetoPlanner — Beginner's Keto Guide",
      description: 'Learn how to use KetoPlanner step by step. Calculate your keto macros, generate AI meal plans, track progress, and stay on track with your keto journey — in 6 simple steps.',
      keywords: 'keto guide, how to use keto calculator, keto for beginners, keto macro guide, keto meal plan guide, keto planner tutorial',
      url: `${SITE}/guide/`,
      schemas: [articleSchema("How to Use KetoPlanner — Beginner's Keto Guide", `${SITE}/guide/`, 'A step-by-step guide to calculating keto macros, generating AI meal plans, and staying on track with KetoPlanner.')],
      body: buildPageBody(
        'How to Use KetoPlanner',
        'Your complete guide to calculating macros, generating AI meal plans, and staying on track with your keto journey — in 6 simple steps.',
        `    <section>
      <ol>
        <li><strong>Calculate Your Numbers</strong> — enter your stats and weight-loss goal to get your BMR, TDEE, BMI, and daily keto macro targets.</li>
        <li><strong>Generate AI Meal Plan</strong> — get a personalized 7-day keto menu with ingredients, amounts, and step-by-step instructions.</li>
        <li><strong>View Your Meals</strong> — review each day's breakfast, lunch, dinner, and snacks with full macro breakdowns.</li>
        <li><strong>Download &amp; Shop</strong> — export your plan and shop for the exact ingredients you need.</li>
        <li><strong>Revisit Saved Plans</strong> — save and track your plans to stay consistent.</li>
        <li><strong>Learn &amp; Adjust</strong> — read our keto education guides and adjust your macros as you progress.</li>
      </ol>
    </section>`,
      ),
    },
    {
      out: 'education/index.html',
      title: 'Keto Diet Education — Complete Keto Guide for Beginners | KetoPlanner',
      description: 'Everything you need to know about the ketogenic diet — keto basics, foods to eat and avoid, benefits and risks, and tips for safe and effective weight loss on keto.',
      keywords: 'keto diet education, what is keto diet, keto for beginners, ketogenic diet, keto foods, keto flu, keto macros, keto tips',
      url: `${SITE}/education/`,
      schemas: [articleSchema('Keto Diet Education — Complete Keto Guide for Beginners', `${SITE}/education/`, 'A complete beginner education hub on the ketogenic diet: keto basics, foods, benefits, risks, and tips.')],
      body: buildPageBody(
        'Keto Diet Education',
        'Everything you need to know about the ketogenic diet for safe and effective weight loss',
        `    <section>
      <ul>
        <li><strong>Keto Basics</strong> — what ketosis is, how the keto diet works, and your macro targets.</li>
        <li><strong>Foods to Eat &amp; Avoid</strong> — keto-friendly foods and what to steer clear of.</li>
        <li><strong>Benefits &amp; Risks</strong> — the science-backed benefits and how to avoid common pitfalls.</li>
        <li><strong>Tips &amp; Mistakes</strong> — practical advice to stay on track and common keto mistakes to avoid.</li>
      </ul>
    </section>`,
      ),
    },
    {
      out: 'blog/index.html',
      title: 'Keto Blog & Guides — Free Keto Resources | KetoPlanner',
      description: 'Free keto resources including beginner guides, meal plans, food lists, and tips. Learn how to calculate macros, avoid keto flu, and succeed on the ketogenic diet.',
      keywords: 'keto blog, keto guides, keto articles, keto tips, how to avoid keto flu, keto macros guide',
      url: `${SITE}/blog/`,
      schemas: [blogSchema, postItemList],
      body: `  <header>
    <h1>Keto Blog & Guides</h1>
    <p>Free keto resources including beginner guides, meal plans, food lists, and tips</p>
  </header>
  <section>
    <ul>
${posts.map(p => `      <li><a href="${SITE}/blog/${p.slug}/">${escHtml(p.title)}</a> — ${escHtml(p.description)}</li>`).join('\n')}
    </ul>
  </section>`,
    },
  ];

  // Blog posts — full article body + BlogPosting schema
  const postPages = posts.map(post => ({
    out: `blog/${post.slug}/index.html`,
    title: `${post.title} | KetoPlanner`,
    description: post.description,
    keywords: post.keywords,
    url: `${SITE}/blog/${post.slug}/`,
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: OG_IMAGE,
        datePublished: post.date,
        author: { '@type': 'Person', name: post.author },
        publisher: { '@type': 'Organization', name: 'KetoPlanner', logo: { '@type': 'ImageObject', url: `${SITE}/logo.svg` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${post.slug}/` },
        articleBody: (post.content || [])
          .filter(s => !/^\s*<!--\s*(META|CTR|CTX)-/.test(s))
          .map(s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .join('\n'),
      },
    ],
    body: buildArticleBody(post),
  }));

  return [...pages, ...postPages];
}

// ── Main ──────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('❌ dist/ directory not found. Run `pnpm build` first.');
    process.exit(1);
  }

  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf-8');

  // Save the pristine SPA shell for Express's fallback route (so /terms, /privacy
  // etc. do NOT inherit the homepage's prerendered body/meta).
  fs.writeFileSync(path.join(DIST, '_spa-shell.html'), baseHtml, 'utf-8');

  const pages = buildPages();

  let count = 0;
  for (const page of pages) {
    const outFile = path.join(DIST, page.out);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const html = buildPage(baseHtml, page);
    fs.writeFileSync(outFile, html, 'utf-8');
    console.log(`  ✅ /${page.out.replace(/\/index\.html$/, '/')}`);
    count++;
  }

  console.log(`\n🎉 Prerendered ${count} static pages.`);
}

main();
