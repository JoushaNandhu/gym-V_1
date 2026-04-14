import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/agents';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided to Medication Agent" }, { status: 400 });

    const prompt = `
      You are the PHARMACOLOGIST AGENT. Analyze this drug prescription or medication sheet.
      Extract drug names, dosages, and schedules.
      
      Return JSON:
      {
        "title": "Medication Analysis",
        "summary": "Clear 2-sentence summary",
        "metrics": [{"label": "Agent", "value": "Detected", "unit": "Dose", "status": "Normal"}],
        "positives": ["Good point"],
        "improvements": ["Needs work"],
        "risks": ["Risk point"],
        "interpretation": "Detailed pill-sync and exercise advice"
      }
    `;

    const result = await executeAgent("PHARMA", prompt, image);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
