import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/agents';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image/document provided" }, { status: 400 });

    const prompt = `
      YOU ARE A HIGH-PRECISION RAW DATA EXTRACTION ENGINE. 
      YOUR ONLY MISSION IS TO TRANSCRIPT EVERY PIECE OF INFORMATION FOUND IN THE PROVIDED BLOOD REPORT.

      CRITICAL RULES:
      1. ONLY EXTRACT DATA THAT IS VISIBLE IN THE DOCUMENT.
      2. ABSOLUTELY NO HALLUCINATIONS. DO NOT PROVIDE "EXAMPLE" DATA.
      3. IF YOU SEE A NUMBER, YOU MUST REPLICATE IT EXACTLY.
      4. IF A TEST IS NOT PRESENT IN THE REPORT, DO NOT INCLUDE IT IN THE LIST.
      5. EXTRACT THE "RESULT VALUE" AND THE "UNIT" AS WRITTEN.
      
      TASK DETAILS:
      - Read every table row.
      - Extract the test name (Parameter).
      - Extract the measured value.
      - Extract the unit (e.g., mg/dL, units/L, %).
      - Determine status based purely on the reference ranges provided in the report (if visible).

      Return JSON ONLY:
      {
        "title": "Exact Document Transcription",
        "summary": "High-level summary of only the findings in this specific report.",
        "metrics": [
          {
            "label": "EXACT PARAMETER NAME FROM REPORT", 
            "value": "EXACT VALUE FROM REPORT", 
            "unit": "EXACT UNIT FROM REPORT", 
            "status": "Normal" | "Attention" | "Critical"
          }
        ],
        "positives": ["List of good findings in THIS specific report"],
        "improvements": ["List of areas needing focus in THIS specific report"],
        "risks": ["List of specific risks found in THIS report"],
        "interpretation": "Detailed interpretation based EXCLUSIVELY on the data captured above."
      }
    `;

    const result = await executeAgent("RAW_TRANSCRIPTION_ENGINE", prompt, image);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
