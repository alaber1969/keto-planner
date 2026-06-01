// KetoPlanner AI Backend Server
// Provides API endpoint for LLM-powered keto meal plan generation

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Anti-abuse: daily request tracker (in-memory) ---
const dailyUsage = new Map();

function getDailyKey(ip) {
  const today = new Date().toISOString().slice(0, 10);
  return `${today}:${ip}`;
}

setInterval(() => {
  // Clear old entries every hour
  const today = new Date().toISOString().slice(0, 10);
  for (const [key] of dailyUsage) {
    if (!key.startsWith(today)) dailyUsage.delete(key);
  }
}, 60 * 60 * 1000);

// --- Middleware ---
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://ketoai.app', 'https://keto-planner-production.up.railway.app']
    : '*',
  methods: ['POST', 'GET'],
}));
app.use(express.json({ limit: '10mb' }));

// IP extraction helper
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip
    || req.connection?.remoteAddress
    || 'unknown';
}

// Rate limiting per minute (tight)
const perMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PER_MIN) || 5,
  keyGenerator: getClientIP,
  message: { error: 'Too many requests. Please wait a moment before generating another meal plan.' },
});

// Daily limit per IP
const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_DAILY) || 30,
  keyGenerator: getClientIP,
  message: { error: 'Daily limit reached. Come back tomorrow for more meal plans!' },
});

// --- Provider Configuration ---
const PROVIDERS = {
  openai: {
    baseURL: undefined,
    apiKey: () => process.env.OPENAI_API_KEY || process.env.LLM_API_KEY,
    model: () => process.env.OPENAI_MODEL || 'gpt-4o-mini',
    supportsJsonMode: true,
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    apiKey: () => process.env.DEEPSEEK_API_KEY || process.env.LLM_API_KEY,
    model: () => 'deepseek-chat',
    supportsJsonMode: false,
  },
};

function getLLMProvider() {
  return (process.env.LLM_PROVIDER || 'openai').toLowerCase();
}

function getProviderConfig() {
  const name = getLLMProvider();
  return PROVIDERS[name] || PROVIDERS.openai;
}

// Lazy OpenAI client — only created when actually needed
let _openai = null;
function getOpenAIClient() {
  if (!_openai) {
    const p = getProviderConfig();
    const apiKey = p.apiKey();
    if (!apiKey) {
      throw new Error(`No API key configured for provider "${getLLMProvider()}". Set ${getLLMProvider() === 'openai' ? 'OPENAI_API_KEY' : 'LLM_API_KEY'} environment variable.`);
    }
    _openai = new OpenAI({
      apiKey,
      ...(p.baseURL ? { baseURL: p.baseURL } : {}),
    });
  }
  return _openai;
}

// --- Prompt Builder ---
function buildMealPlanPrompt(userData) {
  const {
    age, gender, weight, height, activityLevel,
    goalWeightLoss, macros, dietaryPreferences, allergies, language
  } = userData;

  const lang = language || 'en';
  const isIndonesian = lang === 'id';

  const activityLabels = {
    sedentary: 'Sedentary (little to no exercise)',
    lightly_active: 'Lightly Active (1-3 days/week)',
    moderately_active: 'Moderately Active (3-5 days/week)',
    very_active: 'Very Active (6-7 days/week)',
    super_active: 'Super Active (daily + physical job)',
  };

  const preferencesText = dietaryPreferences?.length
    ? `\n- Dietary Preferences: ${dietaryPreferences.join(', ')}`
    : '';
  const allergiesText = allergies?.length
    ? `\n- Allergies / Foods to Avoid: ${allergies.join(', ')}`
    : '';

  const targetLanguage = isIndonesian
    ? 'BAHASA INDONESIA. All meal names, ingredients, and instructions MUST be written in Bahasa Indonesia.'
    : 'English. All meal names, ingredients, and instructions MUST be written in English.';

  return `You are a professional keto dietitian and chef. Generate a COMPLETE 7-day ketogenic diet meal plan.

USER PROFILE:
- Age: ${age} years old
- Gender: ${gender}
- Weight: ${weight} kg
- Height: ${height} cm
- Activity Level: ${activityLabels[activityLevel] || activityLevel}
- Weight Loss Goal: ${goalWeightLoss} lbs per week
${preferencesText}
${allergiesText}

DAILY MACRO TARGETS:
- Calories: ${macros.calories} kcal
- Fat: ${macros.fat}g (${macros.fatPercentage}%)
- Protein: ${macros.protein}g (${macros.proteinPercentage}%)
- Carbs: ${macros.carbs}g (${macros.carbPercentage}%)

IMPORTANT RULES:
1. Every meal must be strictly keto-friendly (net carbs < 5g per meal where possible)
2. Include variety across the week — do NOT repeat meals
3. Each meal must have realistic ingredient amounts in grams or standard units
4. Prep time should be realistic (5-45 minutes)
5. Total daily macros should approximately match the targets above (within ~10% variance)
6. Use whole, unprocessed keto foods: meat, fish, eggs, low-carb vegetables, healthy fats, full-fat dairy
7. Avoid: sugar, grains, legumes, starchy vegetables, fruit (except berries in small amounts), processed foods

RESPOND ONLY WITH VALID JSON — no markdown, no explanation, no code blocks.

The JSON structure must be exactly:
{
  "mealPlan": [
    {
      "day": 1,
      "dayName": "Monday",
      "breakfast": { "name": "...", "ingredients": [{ "name": "...", "amount": number, "unit": "g" }], "instructions": "...", "prepTime": number, "calories": number, "fat": number, "protein": number, "carbs": number, "fiber": number },
      "lunch": { ... same structure ... },
      "dinner": { ... same structure ... },
      "snack": { ... same structure ... },
      "totalCalories": number,
      "totalFat": number,
      "totalProtein": number,
      "totalCarbs": number
    }
    // ... days 2 through 7
  ]
}

Use ${targetLanguage}`
}

// --- Generate via OpenAI / DeepSeek ---
async function generateWithOpenAI(prompt) {
  const p = getProviderConfig();
  const model = p.model();

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a professional keto dietitian and chef. You always respond with valid JSON only. No markdown, no code fences, no extra text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  };

  // Only add JSON mode for OpenAI (DeepSeek doesn't support it)
  if (p.supportsJsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await getOpenAIClient().chat.completions.create(requestBody);

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from LLM');

  // For providers without JSON mode, extract JSON more robustly
  if (!p.supportsJsonMode) {
    // Remove markdown code fences
    let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find first { and last } to extract just the JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    // Fix trailing commas (common LLM issue)
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    // Fix missing closing brace (truncated response)
    let openBraces = (cleaned.match(/\{/g) || []).length;
    let closeBraces = (cleaned.match(/\}/g) || []).length;
    while (closeBraces < openBraces) {
      cleaned += '}';
      closeBraces++;
    }
    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      // Log the raw content for debugging
      console.error('JSON parse error:', parseErr.message, 'Content length:', content.length, 'Preview:', content.slice(0, 1000));
      throw new Error(`Failed to parse LLM response as JSON: ${parseErr.message}`);
    }
  }

  return JSON.parse(content);
}

// --- Generate via Anthropic (Claude) ---
async function generateWithAnthropic(prompt) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: 'You are a professional keto dietitian and chef. You always respond with valid JSON only. No markdown, no code fences, no extra text.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content?.[0]?.text;
  if (!content) throw new Error('Empty response from LLM');

  // Strip any markdown fences if present
  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*$/gm, '').trim();
  return JSON.parse(cleaned);
}

// --- Generate Meal Plan ---
async function generateMealPlan(userData) {
  const prompt = buildMealPlanPrompt(userData);
  const provider = getLLMProvider();

  let result;
  switch (provider) {
    case 'anthropic':
    case 'claude':
      result = await generateWithAnthropic(prompt);
      break;
    case 'openai':
    case 'gpt':
    default:
      result = await generateWithOpenAI(prompt);
      break;
  }

  return result;
}

// --- Validate the generated meal plan ---
function validateMealPlan(plan) {
  if (!plan || !plan.mealPlan || !Array.isArray(plan.mealPlan)) {
    throw new Error('Invalid meal plan structure from LLM');
  }
  if (plan.mealPlan.length !== 7) {
    throw new Error(`Expected 7 days, got ${plan.mealPlan.length}`);
  }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (let i = 0; i < plan.mealPlan.length; i++) {
    const day = plan.mealPlan[i];
    if (!day.breakfast || !day.lunch || !day.dinner || !day.snack) {
      throw new Error(`Day ${i + 1} is missing meals`);
    }
    if (!day.breakfast.name || !day.lunch.name || !day.dinner.name || !day.snack.name) {
      throw new Error(`Day ${i + 1} has meals with missing names`);
    }
    // Fix dayName if needed
    if (!day.dayName) {
      day.dayName = dayNames[i];
    }
    if (!day.day) {
      day.day = i + 1;
    }
  }

  return plan;
}

// --- Routes ---
app.get('/api/health', (req, res) => {
  const p = getProviderConfig();
  res.json({
    status: 'ok',
    provider: getLLMProvider(),
    model: p.model(),
  });
});

app.post('/api/generate-meal-plan', perMinuteLimiter, dailyLimiter, async (req, res) => {
  try {
    const userData = req.body;

        // Anti-bot checks
    // 1. Honeypot: hidden field that bots auto-fill
    if (req.body._hp && req.body._hp !== '') {
      console.warn(`[${new Date().toISOString()}] Honeypot triggered from IP: ${getClientIP(req)}`);
      return res.json({ mealPlan: [] });
    }

    // 2. Block known bot user-agents
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const botPatterns = ['curl', 'wget', 'python-requests', 'go-http-client', 'java', 'scrapy', 'axios', 'aiohttp', 'httpx', 'okhttp'];
    if (botPatterns.some(p => ua.includes(p))) {
      console.warn(`[${new Date().toISOString()}] Bot UA blocked from IP: ${getClientIP(req)}`);
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Validate required fields
    const requiredFields = ['age', 'gender', 'weight', 'height', 'activityLevel', 'goalWeightLoss', 'macros'];
    const missing = requiredFields.filter(f => !userData[f]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    if (!userData.macros.calories || !userData.macros.fat || !userData.macros.protein || !userData.macros.carbs) {
      return res.status(400).json({ error: 'Macro targets must include calories, fat, protein, and carbs' });
    }

    console.log(`[${new Date().toISOString()}] Generating meal plan for: age=${userData.age}, gender=${userData.gender}, provider=${getLLMProvider()}`);

    const plan = await generateMealPlan(userData);
    const validated = validateMealPlan(plan);

    console.log(`[${new Date().toISOString()}] Meal plan generated successfully - ${validated.mealPlan.length} days`);

    res.json(validated);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating meal plan:`, error.message);

    // Differentiate between API errors and parsing errors
    if (error.status === 401) {
      return res.status(500).json({ error: 'LLM API authentication failed. Check your API key.' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'LLM API rate limit exceeded. Please try again later.' });
    }

    res.status(500).json({
      error: 'Failed to generate meal plan',
      details: error.message,
    });
  }
});

// --- Serve static frontend in production ---
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║         KetoPlanner AI Server                ║
  ║──────────────────────────────────────────────║
  ║  Port:       ${String(PORT).padEnd(30)}║
  ║  LLM Provider: ${getLLMProvider().padEnd(27)}║
  ║  Model:      ${(getProviderConfig().model()).padEnd(27)}║
  ║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
  ╚══════════════════════════════════════════════╝
  `);
});
