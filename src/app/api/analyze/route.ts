import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    const { image, type } = formData;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `
      You are an elite Medical Analysis Agent. Analyze the provided ${type} (Blood Test/Medical Report/Medication).
      
      CRITICAL: You must return a valid JSON object with the following structure:
      {
        "title": "A strong professional title",
        "summary": "2-sentence executive summary",
        "metrics": [
          {"label": "Metric Name", "value": "Number/Value", "unit": "Unit", "status": "Normal" | "Attention"}
        ],
        "improvements": ["List of things the user needs to work on or improve based on these results"],
        "risks": ["Potential issues or health risks identified in the report"],
        "positives": ["Good points or healthy indicators found"],
        "interpretation": "Detailed clinical interpretation for a fitness/gym enthusiast"
      }

      Focus on precision. If a value is 0.1, show 0.1. 
      Ensure for every metric you define if it is 'Normal' or 'Attention'.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content || '{}');

    // Ensure metrics exists
    if (!parsed.metrics) parsed.metrics = [];
    if (!parsed.improvements) parsed.improvements = [];
    if (!parsed.risks) parsed.risks = [];
    if (!parsed.positives) parsed.positives = [];

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze: " + error.message }, { status: 500 });
  }
}
