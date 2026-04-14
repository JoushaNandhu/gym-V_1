import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function executeAgent(name: string, prompt: string, image: string) {
  console.log(`[AGENT_${name}] INITIALIZING ANALYSIS...`);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const result = response.choices[0].message.content;
    console.log(`[AGENT_${name}] ANALYSIS COMPLETE. DATA INGESTED.`);
    return JSON.parse(result || '{}');
  } catch (error: any) {
    console.error(`[AGENT_${name}] CRITICAL FAILURE:`, error.message);
    throw new Error(`Agent ${name} failed: ${error.message}`);
  }
}
