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

TASK:
1. Extract all lab test values from the report.
2. For each test:
   - Identify "Result" (first numeric value)
   - Identify "Bio. Ref. Interval"
   - Classify as:
     - "low" (below range)
     - "normal" (within range)
     - "high" (above range)

3. Compute overall health score based on average deviation:
   - Start from 100
   - Subtract:
     - 5-10 points for each mild abnormality
     - 10-20 points for each significant abnormality
   - Prioritize critical markers (lipids, glucose, liver, etc.)

4. Estimate life expectancy:
   - Base: 70
   - Reduce if multiple abnormalities exist
   - Increase slightly if mostly normal

5. Generate structured insights:
   - lifestyle → actionable improvements
   - current_health → factual interpretation
   - anomalies → only abnormal findings (low/high)

6. Medicine rules:
   - Prefer vitamins/supplements first
   - Only suggest mild/common medications
   - Avoid strong prescriptions
   - If multiple abnormalities → imply doctor consultation

STRICT OUTPUT FORMAT (JSON ONLY):

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

IMPORTANT:
- Base decisions ONLY on comparison of Result vs Bio. Ref. Interval
- Do NOT guess missing values
- Do NOT hallucinate tests not present
- Be conservative and medically safe
- Output ONLY valid JSON (no text, no explanation)
`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
}

export async function analyzeHealthHistory(history) {
  const completion = await openai.chat.completions.create({
    model: "deepseek-reasoner",
    messages: [
      {
        role: "system",
        content: `
You are a senior doctor analyzing a patient's LONGITUDINAL health data.

You will be given multiple past health analyses over time.

Your job:
- Detect trends (improving / worsening)
- Identify persistent risks
- Recommend vitamins and medications ONLY if needed
- Suggest lifestyle changes based on patterns
- Be conservative and safe

Return STRICT JSON:

{
  "trend": "improving | worsening | stable",
  "risk_level": "low | medium | high",
  "key_issues": string[],
  "recommendations": {
    "lifestyle": string[],
    "vitamins": string[],
    "medications": string[]
  }
}

Rules:
- Focus on patterns across reports, not single values
- Do NOT over-prescribe
- Prefer lifestyle + vitamins over drugs
- If high risk → suggest consulting real doctor

Only return JSON.
        `
      },
      {
        role: "user",
        content: JSON.stringify(history).slice(0, 12000)
      }
    ],
    temperature: 0.2
  });

  return completion.choices[0].message.content;
}