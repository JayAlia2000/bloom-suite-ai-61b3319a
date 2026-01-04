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
    const { brandName, brandNiche, targetAudience, contentGoals, startDate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Create a 30-day social media content calendar for a beauty brand with these details:
- Brand Name: ${brandName}
- Niche: ${brandNiche}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${contentGoals ? `- Content Goals: ${contentGoals}` : ''}
- Start Date: ${startDate}

Return a JSON array with exactly 30 objects, each containing:
- day: number (1-30)
- date: string (formatted as "Mon, Jan 1")
- theme: string (content theme for the day)
- caption: string (engaging caption, 2-3 sentences)
- hashtags: string (5-7 relevant hashtags)
- postType: string (one of: "Photo", "Reel", "Carousel", "Story", "Live")

Include a mix of content types: product showcases, behind-the-scenes, tutorials, user testimonials, educational content, and engagement posts.

Return ONLY the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a social media marketing expert specializing in beauty brands. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI gateway error:", error);
      throw new Error("Failed to generate calendar");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up the response to extract JSON
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const calendar = JSON.parse(content);

    return new Response(JSON.stringify({ calendar }), {
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
