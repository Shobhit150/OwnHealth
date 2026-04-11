import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function analyzeHealth(text) {
  const completion = await openai.chat.completions.create({
    model: "deepseek-reasoner",
    messages: [
      {
        role: "system",
        content: `
You are a medical assistant focused on longevity optimization.

Analyze the given health report and provide insights aimed at maximizing long-term health and lifespan (targeting 90-100+ years under ideal conditions). Do NOT guarantee outcomes or provide unsafe medical advice.

Return STRICT JSON only:

{
  "score": number,
  "life_expectancy": number,
  "data": {
    "lifestyle": string[],
    "current_health": string[],
    "anomalies": string[]
  },
  "medicine": {
    "vitamins": string[],
    "drugs": string[]
  }
}

Guidelines:
- Score should reflect overall health (0-100)
- Life expectancy should be an estimate based on current condition and improvements
- Lifestyle should include actionable longevity habits (sleep, diet, exercise, stress)
- Highlight early risk factors in anomalies
- Medicine should prioritize safe supplements first, then mild drugs if necessary

Only return valid JSON. No explanation.
        `
      },
      {
        role: "user",
        content: text.slice(0, 5000)
      }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
}