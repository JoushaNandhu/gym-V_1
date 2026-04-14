import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/agents';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided to Blood Agent" }, { status: 400 });

    const prompt = `
      You are the BLOOD SPECIALIST AGENT. Analyze this blood test report.
      Extract metrics like Hemoglobin, RBC, WBC, Glucose, Vitamin D, etc.
      
      Return JSON:
      {
        "title": "Blood Analysis Results",
        "summary": "Clear 2-sentence summary",
        "metrics": [{"label": "string", "value": "string", "unit": "string", "status": "Normal" | "Attention"}],
        "positives": ["Good point"],
        "improvements": ["Needs work"],
        "risks": ["Risk point"],
        "interpretation": "Detailed doctor-style advice"
      }
    `;

    const result = await executeAgent("BLOOD", prompt, image);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
