import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, Calculator, ArrowLeft, Save, Loader2, TrendingUp, DollarSign, Target } from "lucide-react";

export default function PriceCalculator() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [productionCost, setProductionCost] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [overheadCost, setOverheadCost] = useState("");
  const [desiredMargin, setDesiredMargin] = useState("50");
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState("");

  const [results, setResults] = useState<{
    totalCost: number;
    suggestedPrice: number;
    profitPerUnit: number;
    breakEvenUnits: number;
    marginPercentage: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleCalculate = () => {
    const production = parseFloat(productionCost) || 0;
    const packaging = parseFloat(packagingCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const overhead = parseFloat(overheadCost) || 0;
    const margin = parseFloat(desiredMargin) || 50;
    const fixedCosts = parseFloat(monthlyFixedCosts) || 0;

    const totalCost = production + packaging + labor + overhead;
    const suggestedPrice = totalCost / (1 - margin / 100);
    const profitPerUnit = suggestedPrice - totalCost;
    const breakEvenUnits = fixedCosts > 0 ? Math.ceil(fixedCosts / profitPerUnit) : 0;

    setResults({
      totalCost: Math.round(totalCost * 100) / 100,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      profitPerUnit: Math.round(profitPerUnit * 100) / 100,
      breakEvenUnits,
      marginPercentage: margin,
    });

    toast({
      title: "Calculation complete!",
      description: "Your pricing analysis is ready.",
    });
  };

  const handleSave = async () => {
    if (!results || !user || !productName) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a product name and calculate first.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("tool_history").insert([{
        user_id: user.id,
        tool_type: "price_calculator" as const,
        title: productName,
        input_data: {
          productName,
          productionCost,
          packagingCost,
          laborCost,
          overheadCost,
          desiredMargin,
          monthlyFixedCosts,
        } as any,
        output_data: results as any,
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Pricing calculation saved to your history.",
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
        <div className="max-w-5xl mx-auto">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center shadow-soft">
              <Calculator className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground">
                Beauty Price Calculator
              </h1>
              <p className="text-muted-foreground">
                Calculate optimal pricing with profit margins and break-even analysis
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card variant="elevated" className="animate-fade-in-up">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>
                  Enter your product costs to calculate pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Radiant Glow Foundation"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productionCost">Production Cost ($)</Label>
                    <Input
                      id="productionCost"
                      type="number"
                      placeholder="0.00"
                      value={productionCost}
                      onChange={(e) => setProductionCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packagingCost">Packaging Cost ($)</Label>
                    <Input
                      id="packagingCost"
                      type="number"
                      placeholder="0.00"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="laborCost">Labor Cost ($)</Label>
                    <Input
                      id="laborCost"
                      type="number"
                      placeholder="0.00"
                      value={laborCost}
                      onChange={(e) => setLaborCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overheadCost">Overhead Cost ($)</Label>
                    <Input
                      id="overheadCost"
                      type="number"
                      placeholder="0.00"
                      value={overheadCost}
                      onChange={(e) => setOverheadCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredMargin">Desired Profit Margin (%)</Label>
                  <Input
                    id="desiredMargin"
                    type="number"
                    placeholder="50"
                    value={desiredMargin}
                    onChange={(e) => setDesiredMargin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyFixedCosts">Monthly Fixed Costs ($)</Label>
                  <Input
                    id="monthlyFixedCosts"
                    type="number"
                    placeholder="0.00"
                    value={monthlyFixedCosts}
                    onChange={(e) => setMonthlyFixedCosts(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For break-even calculation (rent, salaries, etc.)
                  </p>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleCalculate}
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Pricing
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {results ? (
                <>
                  <Card variant="feature" className="p-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Suggested Retail Price</p>
                        <p className="text-3xl font-display font-bold text-foreground">
                          ${results.suggestedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card variant="soft" className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Profit per Unit</p>
                      </div>
                      <p className="text-2xl font-display font-semibold text-foreground">
                        ${results.profitPerUnit.toFixed(2)}
                      </p>
                    </Card>

                    <Card variant="soft" className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-5 w-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                      </div>
                      <p className="text-2xl font-display font-semibold text-foreground">
                        {results.marginPercentage}%
                      </p>
                    </Card>
                  </div>

                  <Card variant="elevated" className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-4">
                      Cost Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost per Unit</span>
                        <span className="font-medium">${results.totalCost.toFixed(2)}</span>
                      </div>
                      {results.breakEvenUnits > 0 && (
                        <div className="flex justify-between pt-3 border-t border-border">
                          <span className="text-muted-foreground">Break-even Point</span>
                          <span className="font-medium">{results.breakEvenUnits} units/month</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={handleSave}
                    disabled={isSaving || !productName}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save to History
                  </Button>
                </>
              ) : (
                <Card variant="elevated" className="p-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Calculator className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No calculation yet</p>
                    <p className="text-sm text-center">
                      Enter your costs and click calculate to see your pricing analysis
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
