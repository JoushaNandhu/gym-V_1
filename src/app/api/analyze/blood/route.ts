import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/agents';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided to Blood Agent" }, { status: 400 });

    const prompt = `
      You are the ULTIMATE BLOOD ANALYSIS AGENT. 
      Your task is to perform an EXHAUSTIVE EXTRACTION of every single data point in this blood test report.
      
      DO NOT summarized. DO NOT skip any markers.
      
      COMMANDS:
      1. Extract EVERY marker (e.g., Hemoglobin, RBC, WBC, MCV, MCH, Platelets, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils).
      2. Extract EVERY Metabolic Marker (Glucose, Urea, Creatinine, Sodium, Potassium, Chloride, Calcium).
      3. Extract EVERY Lipid Marker (Total Cholesterol, HDL, LDL, Triglycerides).
      4. Extract EVERY Liver/Thyroid function test if present.
      5. For each marker, you MUST provide the Exact Value and the Unit found in the report.
      
      Return JSON:
      {
        "title": "Comprehensive Blood Decompilation",
        "summary": "High-level summary of the overall status (3-4 sentences)",
        "metrics": [
          {
            "label": "Full Name of Marker", 
            "value": "Exact Number", 
            "unit": "Exact Unit (e.g. mg/dL)", 
            "status": "Normal" | "Attention" | "Critical"
          }
        ],
        "positives": ["Every healthy marker or trend identified"],
        "improvements": ["Every marker needing focus or change"],
        "risks": ["Potential clinical risks or flags"],
        "interpretation": "Extremely detailed interpretation linking these results to fitness, fatigue, and recovery."
      }
    `;

    const result = await executeAgent("BLOOD_DEEP_SCAN", prompt, image);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
