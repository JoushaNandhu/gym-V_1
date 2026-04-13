import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `
      Analyze this image of food. Identify all the individual food items present.
      For each item, provide its estimated nutritional value per 100 units (grams or pieces).
      
      Return a JSON object with:
      - dishName: Name of the overall dish
      - totalEstimatedCalories: Total calories for the whole plate as shown
      - ingredients: Array of objects { 
          name: string, 
          baseQuantity: number (e.g. 100), 
          unit: string (e.g. "g" or "piece"),
          protein: number (grams per baseQuantity), 
          carbs: number (grams per baseQuantity),
          fat: number (grams per baseQuantity),
          vitamins: string[] (key vitamins present)
        }
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
    console.error("Food Analysis Error:", error);
    return NextResponse.json({ error: "Failed to identify food" }, { status: 500 });
  }
}
