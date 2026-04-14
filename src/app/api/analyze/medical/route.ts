import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const prompt = `
      You are a Senior Clinical Physician analyzing a general MEDICAL REPORT / DOCTOR CONSULTATION / SCAN.
      Decompile the findings into actionable health data.
      
      Look for: Heart rate, Body Temp, Blood Pressure, Physician notes, Diagnoses.
      
      Return JSON:
      {
        "title": "Clinical Dossier Analysis",
        "summary": "2-sentence clinical overview",
        "metrics": [
          {"label": "Heart Rate", "value": "72", "unit": "BPM", "status": "Normal"},
          {"label": "Body Temp", "value": "98.6", "unit": "F", "status": "Normal"}
        ],
        "positives": ["Positive health signal 1", "Positive health signal 2"],
        "improvements": ["Areas to strengthen 1", "Areas to strengthen 2"],
        "risks": ["Clinical risk 1", "Clinical risk 2"],
        "interpretation": "Detailed doctor-style interpretation for gym performance."
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
