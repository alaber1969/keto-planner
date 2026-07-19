/**
 * Build-time SSG (Static Site Generation) for blog posts.
 *
 * After `vite build`, this script reads the built dist/index.html and generates
 * a static HTML file for every blog post at dist/blog/<slug>/index.html.
 *
 * Express's static middleware will serve these files directly, giving Googlebot
 * fully-rendered HTML with correct meta tags, canonical URLs, Open Graph tags,
 * Twitter Cards, and JSON-LD Article schema — without relying on JavaScript
 * execution.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

// ── Blog post metadata (keep in sync with src/content/blog-posts.ts) ──────────
const BLOG_POSTS = [
  {
    slug: 'calculate-keto-macros-women-over-50',
    title: 'How to Calculate Keto Macros for Women Over 50: Your Complete Hormone-Friendly Guide',
    description: 'Learn how to calculate keto macros for women over 50. Free menopause-friendly macro calculator with adjusted protein ratios, BMR recalibration, and a 7-day meal plan designed for hormonal weight loss after 50.',
    keywords: 'keto macros for women over 50, calculate keto macros for menopause, keto calculator for women over 50, menopause keto macro calculator, keto after 50 women weight loss, how to calculate macros for menopausal women on keto',
    date: '2026-06-14',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
  {
    slug: 'lazy-keto-meal-plan-no-cooking-beginners',
    title: 'The Lazy Keto Meal Plan: 7 Days of No-Cook Meals for Beginners Who Don\'t Want to Spend Hours in the Kitchen',
    description: 'A complete lazy keto meal plan with no cooking required for beginners. 7 days of breakfast, lunch, dinner, and snack ideas that need zero stove time. Includes a printable no-cook shopping list.',
    keywords: 'lazy keto meal plan, lazy keto no cooking, keto meal plan for beginners no cook, lazy keto diet plan, no cook keto meals, lazy keto for busy people, keto without cooking, beginner keto no cooking required',
    date: '2026-06-10',
    author: 'KetoPlanner Team',
    category: 'Meal Plans',
    image: null,
  },
  {
    slug: 'what-to-eat-first-week-of-keto-grocery-list',
    title: 'What to Eat Your First Week of Keto: Complete Day-by-Day Guide with Printable Grocery List',
    description: 'Exactly what to eat the first week of keto including a printable grocery list, day-by-day meal map, and what to expect for ketosis symptoms. No guesswork, no overwhelm — just a clear starting plan.',
    keywords: 'what to eat first week of keto, keto first week meal plan, keto grocery list for beginners, what to buy for keto diet first week, starting keto grocery list, week one keto diet plan, keto shopping list for beginners, what to eat when starting keto',
    date: '2026-06-06',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
  {
    slug: 'custom-keto-macro-calculator-for-fat-loss',
    title: 'Custom Keto Macro Calculator for Fat Loss: Get Your Personalized Numbers (Not Generic Ratios)',
    description: 'Stop guessing with generic keto ratios. Our custom keto macro calculator for fat loss adjusts for your unique BMR, body fat percentage, activity level, and weight loss speed — delivering precision macros that actually move the scale.',
    keywords: 'custom keto macro calculator for fat loss, personalized keto calculator, keto macros for weight loss, custom keto diet plan for fat loss, best keto macro calculator for weight loss, personalized keto macros for fat burning, keto calculator for fat loss customized',
    date: '2026-06-16',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
  {
    slug: 'keto-diet-macros-breakdown-calculator-for-female',
    title: 'Keto Diet Macros Breakdown Calculator for Female: The Complete Woman\'s Guide to Fat-Burning Ratios',
    description: 'The exact keto diet macros breakdown for female physiology — including hormonal adjustments, protein minimums for women, and a free calculator designed for the female body. Stop using male-centric ratios that sabotage your progress.',
    keywords: 'keto diet macros breakdown calculator for female, keto macros for women, female keto macro calculator, keto macros for women weight loss, macronutrient breakdown keto female, women\'s keto diet macros, keto ratio for women',
    date: '2026-06-15',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
  {
    slug: 'how-to-calculate-keto-macros-for-standard-vs-lazy-keto',
    title: 'How to Calculate Keto Macros for Standard vs Lazy Keto: Which Approach Is Right for You?',
    description: 'Learn how to calculate keto macros for standard vs lazy keto approaches. Compare strict macro tracking with intuitive lazy keto methods, and discover which strategy fits your lifestyle, personality, and weight loss goals.',
    keywords: 'how to calculate keto macros for standard vs lazy keto, standard keto vs lazy keto, lazy keto macro calculation, strict keto vs lazy keto, how to do lazy keto, lazy keto macros, standard keto macros calculation, keto tracking methods compared',
    date: '2026-06-13',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
  {
    slug: 'how-to-avoid-keto-flu-symptoms-before-they-start',
    title: 'How to Avoid Keto Flu Symptoms Before They Start: The Prevention-First Protocol',
    description: 'Learn how to avoid keto flu symptoms before they start with a proven prevention protocol. Electrolyte timing, sodium loading, hydration strategy, and mineral dosing — all before you even feel the first headache.',
    keywords: 'how to avoid keto flu symptoms before they start, prevent keto flu, keto flu prevention, avoid keto flu, keto flu symptoms prevention, stop keto flu before it starts, how to prevent keto flu headache',
    date: '2026-06-17',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
  {
    slug: 'how-long-does-keto-fatigue-last-if-you-drink-salt-water',
    title: 'How Long Does Keto Fatigue Last If You Drink Salt Water? The Complete Timeline to Energy Recovery',
    description: 'Exactly how long keto fatigue lasts if you drink salt water and use proper electrolyte dosing. A day-by-day energy recovery timeline plus the exact salt water protocol to restore your energy in hours, not days.',
    keywords: 'how long does keto fatigue last if you drink salt water, keto fatigue timeline, keto fatigue salt water, how long does keto flu fatigue last, keto energy recovery salt, keto tiredness duration, how to fix keto fatigue with salt',
    date: '2026-06-18',
    author: 'KetoPlanner Team',
    category: 'Guides',
    image: null,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPostHTML(post, baseHtml) {
  const url = `https://ketoai.app/blog/${post.slug}`;
  const image = post.image
    ? `https://ketoai.app${post.image}`
    : 'https://ketoai.app/og-image.png';

  const title = `${escHtml(post.title)} | KetoPlanner`;
  const desc = escHtml(post.description);
  const keywords = escHtml(post.keywords);

  // JSON-LD BlogPosting schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'KetoPlanner',
      logo: { '@type': 'ImageObject', url: 'https://ketoai.app/logo.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const schemaHtml = `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;

  // ── Replace base template values ─────────────────────────────────────────
  let html = baseHtml;

  // Title
  html = html.replace(
    '<title>KetoPlanner — #1 Keto AI Diet Calculator &amp; Meal Planner</title>',
    `<title>${title}</title>`,
  );

  // Description
  html = html.replace(
    'content="Free Keto AI calculator and meal planner. Get personalized keto macros, BMR, TDEE, BMI, and AI-generated 7-day meal plans tailored to your body and goals."',
    `content="${desc}"`,
  );

  // Keywords
  html = html.replace(
    'content="keto ai, keto calculator, keto meal planner, AI meal plan, ketogenic diet, macro calculator, keto recipes, weight loss, BMI calculator, BMR calculator"',
    `content="${keywords}"`,
  );

  // Canonical
  html = html.replace(
    'href="https://ketoai.app/" />',
    'href="https://ketoai.app/" />',  // no-op — replaced below with full canonical
  );
  // More precise canonical replacement
  html = html.replace(
    '<link rel="canonical" href="https://ketoai.app/" />',
    `<link rel="canonical" href="${url}" />`,
  );

  // OG:type → article for blog posts
  html = html.replace(
    '<meta property="og:type" content="website" />',
    '<meta property="og:type" content="article" />',
  );

  // OG:url
  html = html.replace(
    '<meta property="og:url" content="https://ketoai.app/" />',
    `<meta property="og:url" content="${url}" />`,
  );

  // OG:title
  html = html.replace(
    '<meta property="og:title" content="KetoPlanner — #1 Keto AI Diet Calculator &amp; Meal Planner" />',
    `<meta property="og:title" content="${title}" />`,
  );

  // OG:description
  html = html.replace(
    '<meta property="og:description" content="Free Keto AI calculator and meal planner. Get personalized keto macros and AI-generated 7-day meal plans tailored to your body and goals." />',
    `<meta property="og:description" content="${desc}" />`,
  );

  // OG:image
  html = html.replace(
    '<meta property="og:image" content="https://ketoai.app/og-image.png" />',
    `<meta property="og:image" content="${image}" />`,
  );

  // Twitter:title
  html = html.replace(
    '<meta name="twitter:title" content="KetoPlanner — #1 Keto AI Diet Calculator &amp; Meal Planner" />',
    `<meta name="twitter:title" content="${title}" />`,
  );

  // Twitter:description
  html = html.replace(
    '<meta name="twitter:description" content="Free Keto AI calculator and meal planner. Get personalized keto macros and AI-generated 7-day meal plans tailored to your body." />',
    `<meta name="twitter:description" content="${desc}" />`,
  );

  // Twitter:image
  html = html.replace(
    '<meta name="twitter:image" content="https://ketoai.app/og-image.png" />',
    `<meta name="twitter:image" content="${image}" />`,
  );

  // ── Remove FAQPage JSON-LD (homepage-specific) ─────────────────────────
  html = html.replace(
    /<!-- 🧠 FAQ Structured Data -->[\s\S]*?<\/script>\s*\n?/,
    '',
  );

  // ── Inject BlogPosting JSON-LD before </head> ──────────────────────────
  // (after the FAQ removal above, insert our schema near the other JSON-LD)
  html = html.replace(
    '</head>',
    `  <!-- 📝 Article Structured Data (BlogPosting) -->\n  ${schemaHtml}\n</head>`,
  );

  return html;
}

// ── Main ──────────────────────────────────────────────────────────────────────

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

  let count = 0;
  for (const post of BLOG_POSTS) {
    const dir = path.join(DIST, 'blog', post.slug);
    fs.mkdirSync(dir, { recursive: true });

    const html = buildPostHTML(post, baseHtml);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');

    console.log(`  ✅ /blog/${post.slug}/`);
    count++;
  }

  console.log(`\n🎉 Prerendered ${count} blog post pages.`);
}

main();
