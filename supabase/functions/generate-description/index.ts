import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productType, keyIngredients, targetAudience, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Create a compelling, luxurious product description for a beauty product with these details:
- Product Name: ${productName}
- Product Type: ${productType}
${keyIngredients ? `- Key Ingredients: ${keyIngredients}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${tone ? `- Tone & Style: ${tone}` : '- Tone: Luxurious and elegant'}

Write a 2-3 paragraph product description that:
1. Opens with an evocative hook that captures the essence of the product
2. Highlights the key benefits and ingredients
3. Ends with a call to action

Keep it elegant, sophisticated, and focused on the transformative experience.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert beauty copywriter who creates elegant, luxurious product descriptions that captivate and convert." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI gateway error:", error);
      throw new Error("Failed to generate description");
    }

    const data = await response.json();
    const description = data.choices[0].message.content;

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
