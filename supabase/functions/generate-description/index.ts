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
    const { 
      productName, 
      productType, 
      keyFeatures, 
      targetAudience, 
      benefits,
      shippingTime,
      careInstructions,
      tone 
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map tone values to descriptive styles
    const toneDescriptions: Record<string, string> = {
      luxury: "Luxurious, elegant, and sophisticated - emphasize premium quality and exclusivity",
      cute: "Cute, playful, and fun - use friendly language and emojis sparingly",
      bold: "Bold, edgy, and confident - empowering language that makes a statement",
      professional: "Professional and informative - focus on quality and expertise",
    };

    const toneStyle = tone ? toneDescriptions[tone] || tone : "Luxurious and elegant";

    const prompt = `Create a compelling product description for a beauty product with these details:

**Product Information:**
- Product Name: ${productName}
- Product Type: ${productType}
${keyFeatures ? `- Key Features: ${keyFeatures}` : ''}
${benefits ? `- Benefits: ${benefits}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${shippingTime ? `- Shipping Time: ${shippingTime}` : ''}
${careInstructions ? `- Care Instructions: ${careInstructions}` : ''}

**Tone & Style:** ${toneStyle}

Write a 2-3 paragraph product description that:
1. Opens with an evocative hook that captures the essence of the product
2. Highlights the key features and benefits naturally
3. Speaks directly to the target audience's desires and pain points
4. If shipping time is provided, mention it as a selling point
5. If care instructions are provided, include a brief care tip
6. Ends with a compelling call to action

Keep it authentic, engaging, and focused on the transformative experience. This is for a beauty brand selling wigs, lashes, hair products, or skincare.`;

    console.log("Generating description for:", productName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert beauty copywriter who creates compelling product descriptions for wigs, lashes, hair extensions, and skincare products. You understand the beauty industry and write copy that converts browsers into buyers." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const error = await response.text();
      console.error("AI gateway error:", error);
      throw new Error("Failed to generate description");
    }

    const data = await response.json();
    const description = data.choices[0].message.content;

    console.log("Description generated successfully");

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
