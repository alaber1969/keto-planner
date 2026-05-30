// Netlify Function - Proxies LLM API calls (OpenAI or DeepSeek)
// No Express server needed - runs serverless on Netlify

// Choose your provider: "openai" (default) or "deepseek"
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';
const LLM_API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

const PROVIDERS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    supportsJsonMode: true,
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    supportsJsonMode: false, // DeepSeek doesn't support structured output yet
  },
};

function buildPrompt(userData) {
  const { age, gender, weight, height, activityLevel, goalWeightLoss, macros,
          dietaryPreferences, allergies } = userData;

  const prefs = dietaryPreferences?.length
    ? `\n- Preferences: ${dietaryPreferences.join(', ')}` : '';
  const allerg = allergies?.length
    ? `\n- Avoid: ${allergies.join(', ')}` : '';

  return `You are a professional keto dietitian. Generate a 7-day ketogenic diet meal plan.

USER PROFILE:
- Age: ${age}, Gender: ${gender}, Weight: ${weight}kg, Height: ${height}cm
- Activity: ${activityLevel}, Weight loss goal: ${goalWeightLoss} lbs/week${prefs}${allerg}

DAILY MACROS: ${macros.calories} cal, ${macros.fat}g fat, ${macros.protein}g protein, ${macros.carbs}g carbs

RULES: Strictly keto (<5g net carbs per meal), no repeated meals across 7 days, realistic amounts in grams.

Respond ONLY with valid JSON, no markdown, no explanation:
{ "mealPlan": [
  { "day": 1, "dayName": "Monday",
    "breakfast": { "name": "...", "ingredients": [{"name":"...","amount":number,"unit":"g"}], "instructions":"...", "prepTime":number, "calories":number, "fat":number, "protein":number, "carbs":number, "fiber":number },
    "lunch": {...}, "dinner": {...}, "snack": {...},
    "totalCalories": number, "totalFat": number, "totalProtein": number, "totalCarbs": number
  },
  ...days 2-7
]}`;
}

function parseJSON(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gm, '').trim();
  return JSON.parse(cleaned);
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  if (!LLM_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: 'No API key configured. Add LLM_API_KEY (or OPENAI_API_KEY) in Netlify env vars.',
      }),
    };
  }

  const provider = PROVIDERS[LLM_PROVIDER];
  if (!provider) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Unknown provider: ${LLM_PROVIDER}. Use "openai" or "deepseek".` }),
    };
  }

  try {
    const userData = JSON.parse(event.body);
    const prompt = buildPrompt(userData);

    const requestBody = {
      model: provider.model,
      messages: [
        { role: 'system', content: 'You are a professional keto dietitian and chef. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    };

    // OpenAI supports native JSON mode, DeepSeek doesn't
    if (provider.supportsJsonMode) {
      requestBody.response_format = { type: 'json_object' };
    } else {
      // For DeepSeek, add stronger instruction
      requestBody.messages[0].content += ' No markdown, no code fences.';
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from LLM');

    // For providers without JSON mode, parse the text response
    const result = provider.supportsJsonMode ? JSON.parse(content) : parseJSON(content);

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Failed to generate meal plan' }),
    };
  }
};
