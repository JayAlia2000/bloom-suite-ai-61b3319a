import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, Calendar, ArrowLeft, Loader2, Download, Copy } from "lucide-react";

interface ContentDay {
  day: number;
  postIdea: string;
  caption: string;
  platform: "Instagram" | "TikTok";
}

const niches = [
  { value: "hair", label: "Hair (Wigs, Extensions, Natural Hair)" },
  { value: "lashes", label: "Lashes (Mink, Magnetic, Strips)" },
  { value: "nails", label: "Nails (Press-ons, Acrylics, Nail Art)" },
  { value: "makeup", label: "Makeup (Foundations, Lips, Eyes)" },
];

const tones = [
  { value: "luxury", label: "Luxury (Elegant, High-End)" },
  { value: "fun", label: "Fun (Playful, Energetic)" },
  { value: "professional", label: "Professional (Educational, Expert)" },
  { value: "bold", label: "Bold (Edgy, Statement-Making)" },
];

export default function ContentPlanner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("");

  const [calendar, setCalendar] = useState<ContentDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signup");
    }
  }, [user, loading, navigate]);

  const handleGenerate = async () => {
    if (!niche || !tone) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both your beauty niche and brand tone.",
      });
      return;
    }

    setIsGenerating(true);
    setCalendar([]);

    try {
      const response = await supabase.functions.invoke("generate-content-calendar", {
        body: {
          niche,
          tone,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const generatedCalendar = response.data.calendar;
      setCalendar(generatedCalendar);
      
      // Auto-save to history if user is logged in
      if (user) {
        const nicheLabel = niches.find(n => n.value === niche)?.label || niche;
        const toneLabel = tones.find(t => t.value === tone)?.label || tone;
        
        try {
          await supabase.from("tool_history").insert([{
            user_id: user.id,
            tool_type: "content_planner" as const,
            title: `${nicheLabel} - ${toneLabel} 30-Day Plan`,
            input_data: {
              niche,
              tone,
            } as any,
            output_data: { calendar: generatedCalendar } as any,
          }]);
        } catch (saveError) {
          console.error("Auto-save failed:", saveError);
        }
      }
      
      toast({
        title: "Calendar generated!",
        description: user ? "Saved to your history automatically." : "Your 30-day content calendar is ready.",
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate calendar. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    const text = calendar.map(day => 
      `Day ${day.day} (${day.platform}):\n${day.postIdea}\n\nCaption:\n${day.caption}`
    ).join("\n\n---\n\n");
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Full calendar copied to clipboard.",
    });
  };

  const handleCopyDay = (day: ContentDay) => {
    const text = `Day ${day.day} (${day.platform}):\n${day.postIdea}\n\nCaption:\n${day.caption}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `Day ${day.day} copied to clipboard.`,
    });
  };

  const handleDownload = () => {
    const csvContent = [
      ["Day", "Platform", "Post Idea", "Caption"].join(","),
      ...calendar.map((day) =>
        [
          day.day,
          day.platform,
          `"${day.postIdea.replace(/"/g, '""')}"`,
          `"${day.caption.replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${niche}-${tone}-content-calendar.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Calendar exported as CSV.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="h-10 w-10 gradient-hero rounded-xl flex items-center justify-center shadow-soft">
                <Flower2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-semibold text-foreground">
                Bloom Suite AI
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-300 to-amber-300 flex items-center justify-center shadow-soft">
              <Calendar className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground">
                30-Day Content Planner
              </h1>
              <p className="text-muted-foreground">
                Get a full month of Instagram & TikTok ideas tailored to your beauty niche
              </p>
            </div>
          </div>

          {/* Input Form */}
          <Card variant="elevated" className="mb-8 animate-fade-in-up">
            <CardHeader>
              <CardTitle>Your Brand</CardTitle>
              <CardDescription>
                Select your niche and brand tone to generate personalized content ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="niche">Beauty Niche *</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {niches.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the main category of products you sell
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Brand Tone *</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your brand tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This sets the voice and style of your captions
                  </p>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="mt-6"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating 30-Day Calendar...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Generate 30-Day Content Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Results */}
          {calendar.length > 0 && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  Your 30-Day Content Calendar
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="default" onClick={handleCopyAll}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {calendar.map((day, index) => (
                  <Card
                    key={day.day}
                    variant="soft"
                    className="p-4 animate-fade-in-up group relative"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <button
                      onClick={() => handleCopyDay(day)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      title="Copy this day"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Day {day.day}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        day.platform === "Instagram" 
                          ? "bg-pink-100 text-pink-700" 
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {day.platform}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm leading-snug">
                      {day.postIdea}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {day.caption}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!calendar.length && !isGenerating && (
            <Card variant="elevated" className="p-12 animate-fade-in-up">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Calendar className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No calendar generated yet</p>
                <p className="text-sm text-center">
                  Select your beauty niche and brand tone to generate your personalized 30-day content calendar
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
