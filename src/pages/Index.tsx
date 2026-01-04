import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Flower2, Sparkles, Calculator, Calendar, ArrowRight } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Sparkles,
      title: "Product Descriptions",
      description: "AI-powered descriptions that captivate and convert",
    },
    {
      icon: Calculator,
      title: "Price Calculator",
      description: "Smart pricing with profit margins and break-even analysis",
    },
    {
      icon: Calendar,
      title: "Content Planner",
      description: "30-day social media calendars tailored for beauty brands",
    },
  ];

  return (
    <div className="min-h-screen gradient-soft">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <Flower2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-semibold text-foreground">
              Bloom Suite AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/10 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Beauty Tools</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold leading-tight mb-6">
              Elevate Your{" "}
              <span className="text-gradient">Beauty Brand</span>{" "}
              with AI
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body">
              Create compelling product descriptions, calculate perfect pricing, 
              and plan your social media content — all powered by intelligent AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/auth")}
                className="group"
              >
                Start Free Today
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="glass" size="xl" onClick={() => navigate("/auth")}>
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 pb-32">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-full p-8 rounded-2xl gradient-card border border-primary/10 shadow-soft transition-all duration-300 hover:shadow-glow hover:scale-[1.02]">
                  <div className="h-14 w-14 gradient-hero rounded-xl flex items-center justify-center mb-6 shadow-soft group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-body">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl gradient-hero shadow-glow animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary-foreground mb-4">
              Ready to Transform Your Beauty Business?
            </h2>
            <p className="text-primary-foreground/80 mb-8 font-body text-lg">
              Join thousands of beauty entrepreneurs using Bloom Suite AI
            </p>
            <Button
              variant="glass"
              size="xl"
              onClick={() => navigate("/auth")}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Flower2 className="h-4 w-4" />
          <span className="text-sm font-body">© 2024 Bloom Suite AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
