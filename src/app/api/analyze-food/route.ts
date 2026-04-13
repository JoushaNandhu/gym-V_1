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
      You are a World-Class Michelin Chef and Senior Clinical Nutritionist. 
      Analyze this image with extreme precision. 
      
      Tasks:
      1. Identify every single unique food item and ingredient on the plate.
      2. For each item, provide a detailed nutritional profile per 100g.
      
      Return a JSON object with:
      - dishName: A descriptive name of the meal.
      - totalEstimatedCalories: Total calories for the entire portion shown.
      - ingredients: Array of objects { 
          name: string, 
          baseQuantity: number (100), 
          unit: string (g),
          protein: number, 
          carbs: number,
          fat: number,
          calories: number,
          vitamins: {
            vitaminA: string (e.g. "12% DV"),
            vitaminB: string,
            vitaminC: string,
            vitaminD: string,
            iron: string,
            calcium: string,
            zinc: string,
            magnesium: string
          },
          summary: string (brief note on why this is healthy)
        }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o-mini as requested
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
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return NextResponse.json(JSON.parse(content || '{}'));
  } catch (error: any) {
    console.error("Advanced Food Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze meal" }, { status: 500 });
  }
}
