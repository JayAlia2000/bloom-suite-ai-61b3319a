import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, Sparkles, ArrowLeft, Copy, Save, Loader2 } from "lucide-react";

export default function ProductDescription() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [keyIngredients, setKeyIngredients] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleGenerate = async () => {
    if (!productName || !productType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter at least a product name and type.",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedDescription("");

    try {
      const response = await supabase.functions.invoke("generate-description", {
        body: {
          productName,
          productType,
          keyIngredients,
          targetAudience,
          tone,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setGeneratedDescription(response.data.description);
      toast({
        title: "Description generated!",
        description: "Your product description is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate description. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast({
      title: "Copied!",
      description: "Description copied to clipboard.",
    });
  };

  const handleSave = async () => {
    if (!generatedDescription || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("tool_history").insert([{
        user_id: user.id,
        tool_type: "product_description" as const,
        title: productName,
        input_data: {
          productName,
          productType,
          keyIngredients,
          targetAudience,
          tone,
        } as any,
        output_data: { description: generatedDescription } as any,
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Description saved to your history.",
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
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-soft">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground">
                Product Description Generator
              </h1>
              <p className="text-muted-foreground">
                Create compelling descriptions for your beauty products
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card variant="elevated" className="animate-fade-in-up">
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Enter information about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Rose Petal Glow Serum"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type *</Label>
                  <Input
                    id="productType"
                    placeholder="e.g., Facial serum, Moisturizer, Lipstick"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyIngredients">Key Ingredients</Label>
                  <Input
                    id="keyIngredients"
                    placeholder="e.g., Hyaluronic acid, Vitamin C, Rose extract"
                    value={keyIngredients}
                    onChange={(e) => setKeyIngredients(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Women 25-45, sensitive skin"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone & Style</Label>
                  <Input
                    id="tone"
                    placeholder="e.g., Luxurious, playful, clinical"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  />
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Description
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle>Generated Description</CardTitle>
                <CardDescription>
                  Your AI-crafted product description
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedDescription ? (
                  <>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border min-h-[200px] mb-4">
                      <p className="text-foreground whitespace-pre-wrap font-body leading-relaxed">
                        {generatedDescription}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                    <Sparkles className="h-12 w-12 mb-4 opacity-30" />
                    <p>Your description will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
