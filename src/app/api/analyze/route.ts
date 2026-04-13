import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    const { image, type } = formData; // image is base64 string

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `
      You are a specialized medical report analyzer. 
      Analyze the provided ${type} and extract the key metrics.
      Provide a highly precise JSON response.
      The user specifically wants to see exact values to the decimal point (e.g., Temperature: 98.6).
      
      Return a JSON object with:
      - title: A relevant title for the analysis
      - summary: A brief 2-sentence summary of the report
      - metrics: An array of objects { label: string, value: string, unit: string, status: "Normal" | "Attention" }
      - interpretation: A detailed clinical interpretation of what these numbers mean for someone tracking gym/health.
      
      Look for values like Body Temperature, Heart Rate, Blood Sugar, Cholesterol, etc., depending on the report type.
      If no specific value is found, indicate "Not found in report".
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
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return NextResponse.json(JSON.parse(content || '{}'));
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze report: " + error.message }, { status: 500 });
  }
}
