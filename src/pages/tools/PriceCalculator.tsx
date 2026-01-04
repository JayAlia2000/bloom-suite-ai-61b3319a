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
  const [productCost, setProductCost] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [desiredProfit, setDesiredProfit] = useState("50");

  const [results, setResults] = useState<{
    suggestedRetailPrice: number;
    profitPerUnit: number;
    breakEvenQuantity: number;
    totalCost: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signup");
    }
  }, [user, loading, navigate]);

  const handleCalculate = () => {
    const product = parseFloat(productCost) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const packaging = parseFloat(packagingCost) || 0;
    const profitPercent = parseFloat(desiredProfit) || 50;

    const totalCost = product + shipping + packaging;
    const suggestedRetailPrice = totalCost / (1 - profitPercent / 100);
    const profitPerUnit = suggestedRetailPrice - totalCost;
    // Break-even: assuming $500 monthly fixed costs as baseline for beauty businesses
    const monthlyFixedCosts = 500;
    const breakEvenQuantity = profitPerUnit > 0 ? Math.ceil(monthlyFixedCosts / profitPerUnit) : 0;

    setResults({
      suggestedRetailPrice: Math.round(suggestedRetailPrice * 100) / 100,
      profitPerUnit: Math.round(profitPerUnit * 100) / 100,
      breakEvenQuantity,
      totalCost: Math.round(totalCost * 100) / 100,
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
          productCost,
          shippingCost,
          packagingCost,
          desiredProfit,
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
                    placeholder="e.g., Mink Lash Set"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCost">Product Cost ($)</Label>
                  <Input
                    id="productCost"
                    type="number"
                    placeholder="0.00"
                    value={productCost}
                    onChange={(e) => setProductCost(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cost to manufacture or purchase the product
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    placeholder="0.00"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cost to ship product to you or your customer
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Boxes, tissue paper, labels, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredProfit">Desired Profit Percentage (%)</Label>
                  <Input
                    id="desiredProfit"
                    type="number"
                    placeholder="50"
                    value={desiredProfit}
                    onChange={(e) => setDesiredProfit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    How much profit margin you want (e.g., 50 for 50%)
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
                          ${results.suggestedRetailPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card variant="soft" className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Profit Per Unit</p>
                      </div>
                      <p className="text-2xl font-display font-semibold text-foreground">
                        ${results.profitPerUnit.toFixed(2)}
                      </p>
                    </Card>

                    <Card variant="soft" className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-5 w-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Break-even Quantity</p>
                      </div>
                      <p className="text-2xl font-display font-semibold text-foreground">
                        {results.breakEvenQuantity} units
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">per month</p>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Profit Margin</span>
                        <span className="font-medium">{desiredProfit}%</span>
                      </div>
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
