import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const prompt = `
      You are an Expert Hematologist and Blood Logic Analyst.
      Analyze this BLOOD TEST REPORT with extreme medical precision.
      
      Look for: Hemoglobin, WBC count, Platelets, Glucose, Cholesterol, Vitamin levels, etc.
      The user needs to see exact decimal values (e.g. 14.2 g/dL).
      
      Return JSON:
      {
        "title": "Blood Matrix Calibration",
        "summary": "2-sentence health summary",
        "metrics": [
          {"label": "Hemoglobin", "value": "14.2", "unit": "g/dL", "status": "Normal"},
          {"label": "Blood Sugar", "value": "95", "unit": "mg/dL", "status": "Normal"}
        ],
        "positives": ["Good point 1", "Good point 2"],
        "improvements": ["Needs work on 1", "Needs work on 2"],
        "risks": ["Potential risk 1", "Potential risk 2"],
        "interpretation": "Strong clinical interpretation for someone going to the gym."
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }] }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || '{}'));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
