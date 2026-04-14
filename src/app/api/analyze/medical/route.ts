import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/agents';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided to Medical Agent" }, { status: 400 });

    const prompt = `
      You are the MEDICAL REPORT AGENT. Analyze this clinical documentation.
      Extract metrics like Heart Rate, BP, Temperature, and Scan results.
      
      Return JSON:
      {
        "title": "Medical Report Analysis",
        "summary": "Clear 2-sentence summary",
        "metrics": [{"label": "string", "value": "string", "unit": "string", "status": "Normal" | "Attention"}],
        "positives": ["Good point"],
        "improvements": ["Needs work"],
        "risks": ["Risk point"],
        "interpretation": "Detailed clinical interpretation"
      }
    `;

    const result = await executeAgent("MEDICAL", prompt, image);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
