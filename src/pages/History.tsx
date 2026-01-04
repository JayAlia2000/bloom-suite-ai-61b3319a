import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, History, ArrowLeft, Sparkles, Calculator, Calendar, Trash2, Eye, LogOut, User } from "lucide-react";
import { format } from "date-fns";
import { Json } from "@/integrations/supabase/types";

interface HistoryItem {
  id: string;
  tool_type: string;
  title: string;
  input_data: Json;
  output_data: Json;
  created_at: string;
}

export default function HistoryPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("tool_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load history",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("tool_history").delete().eq("id", id);
      if (error) throw error;

      setHistory(history.filter((item) => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);

      toast({
        title: "Deleted!",
        description: "Item removed from history.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case "product_description":
        return Sparkles;
      case "price_calculator":
        return Calculator;
      case "content_planner":
        return Calendar;
      default:
        return Sparkles;
    }
  };

  const getToolLabel = (toolType: string) => {
    switch (toolType) {
      case "product_description":
        return "Product Description";
      case "price_calculator":
        return "Price Calculator";
      case "content_planner":
        return "Content Planner";
      default:
        return toolType;
    }
  };

  const getToolColor = (toolType: string) => {
    switch (toolType) {
      case "product_description":
        return "from-pink-500 to-rose-400";
      case "price_calculator":
        return "from-rose-400 to-orange-300";
      case "content_planner":
        return "from-orange-300 to-amber-300";
      default:
        return "from-pink-500 to-rose-400";
    }
  };

  if (loading || isLoading) {
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

            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user?.email}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
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
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground">
                Your History
              </h1>
              <p className="text-muted-foreground">
                View and manage your saved tool outputs
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <Card variant="elevated" className="p-12 animate-fade-in-up">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <History className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No history yet</p>
                <p className="text-sm text-center mb-6">
                  Start using the tools and save your outputs to see them here
                </p>
                <Link to="/dashboard">
                  <Button variant="default">Go to Dashboard</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* History List */}
              <div className="lg:col-span-1 space-y-4">
                {history.map((item, index) => {
                  const Icon = getToolIcon(item.tool_type);
                  return (
                    <Card
                      key={item.id}
                      variant={selectedItem?.id === item.id ? "feature" : "default"}
                      className="cursor-pointer animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getToolColor(
                              item.tool_type
                            )} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getToolLabel(item.tool_type)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detail View */}
              <div className="lg:col-span-2">
                {selectedItem ? (
                  <Card variant="elevated" className="animate-fade-in-up">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = getToolIcon(selectedItem.tool_type);
                            return (
                              <div
                                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getToolColor(
                                  selectedItem.tool_type
                                )} flex items-center justify-center`}
                              >
                                <Icon className="h-6 w-6 text-primary-foreground" />
                              </div>
                            );
                          })()}
                          <div>
                            <CardTitle>{selectedItem.title}</CardTitle>
                            <CardDescription>
                              {getToolLabel(selectedItem.tool_type)} •{" "}
                              {format(new Date(selectedItem.created_at), "MMMM d, yyyy")}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(selectedItem.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Input Summary */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Input Details
                        </h4>
                        <div className="p-4 rounded-lg bg-secondary/30 text-sm space-y-1">
                          {Object.entries(selectedItem.input_data as Record<string, any>).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium capitalize w-40 flex-shrink-0">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span className="text-muted-foreground">
                                {String(value) || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Output */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Generated Output
                        </h4>
                        <div className="p-4 rounded-lg bg-secondary/30">
                          {selectedItem.tool_type === "product_description" && (
                            <p className="whitespace-pre-wrap">
                              {(selectedItem.output_data as any).description}
                            </p>
                          )}
                          {selectedItem.tool_type === "price_calculator" && (
                            <div className="space-y-2">
                              <p>
                                <span className="font-medium">Suggested Price:</span> $
                                {(selectedItem.output_data as any).suggestedPrice}
                              </p>
                              <p>
                                <span className="font-medium">Total Cost:</span> $
                                {(selectedItem.output_data as any).totalCost}
                              </p>
                              <p>
                                <span className="font-medium">Profit per Unit:</span> $
                                {(selectedItem.output_data as any).profitPerUnit}
                              </p>
                              <p>
                                <span className="font-medium">Margin:</span>{" "}
                                {(selectedItem.output_data as any).marginPercentage}%
                              </p>
                              {(selectedItem.output_data as any).breakEvenUnits > 0 && (
                                <p>
                                  <span className="font-medium">Break-even:</span>{" "}
                                  {(selectedItem.output_data as any).breakEvenUnits} units/month
                                </p>
                              )}
                            </div>
                          )}
                          {selectedItem.tool_type === "content_planner" && (
                            <div className="max-h-96 overflow-y-auto space-y-3">
                              {(selectedItem.output_data as any).calendar?.slice(0, 5).map(
                                (day: any) => (
                                  <div
                                    key={day.day}
                                    className="p-3 rounded bg-background"
                                  >
                                    <div className="flex justify-between mb-1">
                                      <span className="font-medium">
                                        Day {day.day}: {day.theme}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {day.postType}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {day.caption}
                                    </p>
                                  </div>
                                )
                              )}
                              {(selectedItem.output_data as any).calendar?.length > 5 && (
                                <p className="text-sm text-muted-foreground text-center">
                                  ... and {(selectedItem.output_data as any).calendar.length - 5} more
                                  days
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="soft" className="p-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Eye className="h-12 w-12 mb-4 opacity-30" />
                      <p className="text-lg font-medium">Select an item to view</p>
                      <p className="text-sm">
                        Click on any item from the list to see details
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
