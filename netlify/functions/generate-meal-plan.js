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
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Find the first { and last } to extract just the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Fix single quotes (DeepSeek sometimes uses them)
  cleaned = cleaned.replace(/'/g, '"');

  // Try parsing directly first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // If that fails, try to fix trailing commas (common LLM issue)
    try {
      const fixed = cleaned
        .replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixed);
    } catch (e2) {
      // Last resort: extract just the mealPlan array
      const match = cleaned.match(/\{"mealPlan":\s*\[[\s\S]*?\]\}/);
      if (match) {
        return JSON.parse(match[0].replace(/,\s*([}\]])/g, '$1'));
      }
      throw e2;
    }
  }
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
      max_tokens: 8192,
      temperature: 0.7,
    };

      // OpenAI supports native JSON mode, DeepSeek doesn't
    if (provider.supportsJsonMode) {
      requestBody.response_format = { type: 'json_object' };
    } else {
      // For DeepSeek: add stronger JSON instruction
      requestBody.messages[0].content = 'You are a professional keto dietitian and chef. You output ONLY valid JSON. No markdown, no code fences, no explanation. Your entire response must be parseable by JSON.parse(). Start with { and end with }.';
      requestBody.messages[1].content += '\n\nIMPORTANT: Output ONLY valid JSON that can be parsed. No markdown formatting. No code blocks. Just raw JSON.';
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

    // Check for DeepSeek API errors
    if (data.error) {
      throw new Error(`DeepSeek API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from LLM');

    // Debug: log response length for troubleshooting
    console.log(`LLM response length: ${content.length} chars`);

    // For providers without JSON mode, parse the text response
    let result;
    try {
      result = provider.supportsJsonMode ? JSON.parse(content) : parseJSON(content);
    } catch (parseError) {
      // Return the raw content so we can see what DeepSeek returns
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          debug: true,
          rawResponse: content,
          parseError: parseError.message,
          contentLength: content.length,
        }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Function error:', error.message);
    // Include raw response in debug for DeepSeek issues
    const debug = error.rawContent
      ? ` | Raw preview: ${JSON.stringify(error.rawContent.slice(0, 300))}`
      : '';
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message + debug,
      }),
    };
  }
};
