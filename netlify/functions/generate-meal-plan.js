// Netlify Function - Proxies LLM API calls
// No Express server needed - runs serverless on Netlify

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildPrompt(userData) {
  const { age, gender, weight, height, activityLevel, goalWeightLoss, macros } = userData;
  
  return `You are a professional keto dietitian. Generate a 7-day ketogenic diet meal plan.

USER PROFILE:
- Age: ${age}, Gender: ${gender}, Weight: ${weight}kg, Height: ${height}cm
- Activity: ${activityLevel}, Weight loss goal: ${goalWeightLoss} lbs/week

DAILY MACROS: ${macros.calories} cal, ${macros.fat}g fat, ${macros.protein}g protein, ${macros.carbs}g carbs

RULES: Strictly keto (<5g net carbs per meal), no repeats across 7 days, realistic ingredients + amounts.

Respond with JSON only: { "mealPlan": [{ "day": 1, "dayName": "Monday", "breakfast": { "name": "...", "ingredients": [{ "name": "...", "amount": number, "unit": "g" }], "instructions": "...", "prepTime": number, "calories": number, "fat": number, "protein": number, "carbs": number, "fiber": number }, "lunch": {...}, "dinner": {...}, "snack": {...}, "totalCalories": number, "totalFat": number, "totalProtein": number, "totalCarbs": number }, ...days 2-7] }`;
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

  if (!OPENAI_API_KEY) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'No API key configured. Add OPENAI_API_KEY in Netlify env vars.' }) };
  }

  try {
    const userData = JSON.parse(event.body);
    const prompt = buildPrompt(userData);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a keto dietitian. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from LLM');
    
    return { statusCode: 200, headers, body: content };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
