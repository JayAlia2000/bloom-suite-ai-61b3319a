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
    const { niche, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating content calendar for:", { niche, tone });

    const nicheDescriptions: Record<string, string> = {
      hair: "wigs, hair extensions, natural hair care, protective styles",
      lashes: "mink lashes, magnetic lashes, lash strips, lash care",
      nails: "press-on nails, acrylic sets, nail art, nail care",
      makeup: "foundations, lip products, eyeshadow, makeup tutorials",
    };

    const toneDescriptions: Record<string, string> = {
      luxury: "elegant, sophisticated, high-end, exclusive",
      fun: "playful, energetic, relatable, emoji-friendly",
      professional: "educational, expert, informative, trustworthy",
      bold: "edgy, statement-making, confident, unapologetic",
    };

    const nicheDesc = nicheDescriptions[niche] || niche;
    const toneDesc = toneDescriptions[tone] || tone;

    const prompt = `Create a 30-day social media content calendar for a beauty brand specializing in ${nicheDesc}.

The brand tone is ${toneDesc}.

Generate exactly 30 days of content with a good mix of Instagram and TikTok posts.

For each day, provide:
1. A specific post idea (be creative and specific, not generic)
2. A ready-to-use caption (2-3 sentences, matching the ${tone} tone, include a call-to-action)
3. The platform (alternate between "Instagram" and "TikTok" throughout the month)

Content types to include across the 30 days:
- Product showcases and new arrivals
- Tutorials and how-to content
- Behind-the-scenes of the business
- Customer testimonials and reviews
- Tips and educational content
- Trending sounds/challenges (for TikTok)
- Carousel posts with tips (for Instagram)
- Engagement posts (polls, questions)
- Promotional content and sales
- User-generated content reposts

Return ONLY a valid JSON array with exactly 30 objects, each with these exact keys:
- "day": number (1-30)
- "postIdea": string (the content idea)
- "caption": string (ready-to-post caption)
- "platform": string ("Instagram" or "TikTok")

No markdown, no explanation, just the JSON array.`;

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
            content: "You are a social media marketing expert for beauty brands. You create engaging, platform-specific content calendars. Always return valid JSON only, no markdown formatting." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error("Failed to generate calendar");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    console.log("Raw AI response length:", content.length);
    
    // Clean up the response to extract JSON
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON array in the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    const calendar = JSON.parse(content);
    
    console.log("Successfully parsed calendar with", calendar.length, "days");

    return new Response(JSON.stringify({ calendar }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error generating calendar:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate calendar" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
