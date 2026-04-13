import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { goal, country, state, forbiddenFood } = await req.json();

    const prompt = `
      Act as a professional nutritionist. Generate a daily food diet plan for a user with the following details:
      - Goal: ${goal}
      - Location: ${state}, ${country}
      - Forbidden/Disliked Food: ${forbiddenFood || 'None'}

      Provide a structured JSON response with:
      - dietPlan (Array of objects with time, meal, description)
      - totalCalories (Number)
      - proteinSuggestion (String)
      - regionalNote (String about the region-based food choice)

      Ensure the food is common in ${state}, ${country}.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return NextResponse.json(JSON.parse(content || '{}'));
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate diet plan" }, { status: 500 });
  }
}
