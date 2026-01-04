import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, Calendar, ArrowLeft, Save, Loader2, Download } from "lucide-react";

interface ContentDay {
  day: number;
  date: string;
  theme: string;
  caption: string;
  hashtags: string;
  postType: string;
}

export default function ContentPlanner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [brandName, setBrandName] = useState("");
  const [brandNiche, setBrandNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentGoals, setContentGoals] = useState("");
  const [startDate, setStartDate] = useState("");

  const [calendar, setCalendar] = useState<ContentDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleGenerate = async () => {
    if (!brandName || !brandNiche) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter at least your brand name and niche.",
      });
      return;
    }

    setIsGenerating(true);
    setCalendar([]);

    try {
      const response = await supabase.functions.invoke("generate-content-calendar", {
        body: {
          brandName,
          brandNiche,
          targetAudience,
          contentGoals,
          startDate: startDate || new Date().toISOString().split("T")[0],
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setCalendar(response.data.calendar);
      toast({
        title: "Calendar generated!",
        description: "Your 30-day content calendar is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate calendar. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!calendar.length || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("tool_history").insert([{
        user_id: user.id,
        tool_type: "content_planner" as const,
        title: `${brandName} - 30 Day Plan`,
        input_data: {
          brandName,
          brandNiche,
          targetAudience,
          contentGoals,
          startDate,
        } as any,
        output_data: { calendar } as any,
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Content calendar saved to your history.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const csvContent = [
      ["Day", "Date", "Theme", "Post Type", "Caption", "Hashtags"].join(","),
      ...calendar.map((day) =>
        [
          day.day,
          day.date,
          `"${day.theme}"`,
          day.postType,
          `"${day.caption.replace(/"/g, '""')}"`,
          `"${day.hashtags}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.replace(/\s+/g, "-")}-content-calendar.csv`;
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
                Social Media Content Planner
              </h1>
              <p className="text-muted-foreground">
                Generate a 30-day content calendar for your beauty brand
              </p>
            </div>
          </div>

          {/* Input Form */}
          <Card variant="elevated" className="mb-8 animate-fade-in-up">
            <CardHeader>
              <CardTitle>Brand Details</CardTitle>
              <CardDescription>
                Tell us about your brand to create a personalized content calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    placeholder="e.g., Glow Beauty Co"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandNiche">Brand Niche *</Label>
                  <Input
                    id="brandNiche"
                    placeholder="e.g., Organic skincare, Luxury makeup"
                    value={brandNiche}
                    onChange={(e) => setBrandNiche(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Women 25-40, beauty enthusiasts"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contentGoals">Content Goals</Label>
                  <Input
                    id="contentGoals"
                    placeholder="e.g., Increase engagement, promote new product launch"
                    value={contentGoals}
                    onChange={(e) => setContentGoals(e.target.value)}
                  />
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
                    Generate Content Calendar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Results */}
          {calendar.length > 0 && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  Your 30-Day Content Calendar
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save to History
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {calendar.map((day, index) => (
                  <Card
                    key={day.day}
                    variant="soft"
                    className="p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Day {day.day}
                      </span>
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground">
                        {day.postType}
                      </span>
                    </div>
                    <h4 className="font-medium text-foreground mb-2">{day.theme}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {day.caption}
                    </p>
                    <p className="text-xs text-primary">{day.hashtags}</p>
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
                  Fill in your brand details and generate your personalized 30-day content calendar
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
