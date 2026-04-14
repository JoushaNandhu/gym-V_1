import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const prompt = `
      You are an Expert Pharmacologist. 
      Analyze this MEDICATION PRECRIPTION / DRUG SHEET.
      
      Identify: Drug names, Dosages, Frequencies, and potential side-effects related to gym/exercise.
      
      Return JSON:
      {
        "title": "Pharmacological Ledger",
        "summary": "Brief summary of the medication program",
        "metrics": [
          {"label": "Dosage Rank", "value": "Standard", "unit": "Daily", "status": "Normal"}
        ],
        "positives": ["Good point on this drug 1"],
        "improvements": ["Advice on synchronization with food 1"],
        "risks": ["Possible side effect during gym 1"],
        "interpretation": "Pharmacological advice for a fitness enthusiast."
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
