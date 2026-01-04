import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower2, Sparkles, Calculator, Calendar, History, LogOut, User } from "lucide-react";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const tools = [
    {
      icon: Sparkles,
      title: "Product Description Generator",
      description: "Create compelling descriptions for your beauty products that captivate and convert customers.",
      path: "/tools/product-description",
      color: "from-pink-500 to-rose-400",
    },
    {
      icon: Calculator,
      title: "Beauty Price Calculator",
      description: "Calculate optimal pricing with profit margins, break-even analysis, and competitor insights.",
      path: "/tools/price-calculator",
      color: "from-rose-400 to-orange-300",
    },
    {
      icon: Calendar,
      title: "Social Media Content Planner",
      description: "Generate 30-day content calendars tailored specifically for beauty brands.",
      path: "/tools/content-planner",
      color: "from-orange-300 to-amber-300",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
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
              <Link to="/history">
                <Button
                  variant={location.pathname === "/history" ? "secondary" : "ghost"}
                  size="sm"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
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
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-display font-semibold text-foreground mb-3">
              Welcome to Your Dashboard
            </h1>
            <p className="text-lg text-muted-foreground font-body">
              Choose a tool below to get started with your beauty business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Link
                key={tool.title}
                to={tool.path}
                className="group animate-fade-in-up block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card variant="feature" className="h-full cursor-pointer">
                  <CardHeader>
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110`}>
                      <tool.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
              Quick Overview
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card variant="soft" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-semibold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">AI Tools Available</p>
                  </div>
                </div>
              </Card>
              <Card variant="soft" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-semibold text-foreground">∞</p>
                    <p className="text-sm text-muted-foreground">Unlimited Saves</p>
                  </div>
                </div>
              </Card>
              <Card variant="soft" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-semibold text-foreground">30</p>
                    <p className="text-sm text-muted-foreground">Day Content Plans</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
