import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flower2, Sparkles, Calculator, Calendar, ArrowRight, Check } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: "Create Your First Product Description",
    description: "Generate high-converting descriptions for wigs, lashes, skincare, and more with our AI-powered tool.",
    action: "Try Product Description",
    path: "/product-description",
  },
  {
    icon: Calculator,
    title: "Calculate Your Pricing",
    description: "Enter your costs and instantly see your perfect retail price, profit margin, and break-even point.",
    action: "Try Price Calculator",
    path: "/price-calculator",
  },
  {
    icon: Calendar,
    title: "Generate Your 30-Day Content Plan",
    description: "Get a full month of Instagram & TikTok ideas tailored to your beauty niche.",
    action: "Try Content Planner",
    path: "/content-planner",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    onComplete();
    navigate("/dashboard");
  };

  const handleFinish = () => {
    onComplete();
    navigate("/dashboard");
  };

  const handleTryTool = (path: string) => {
    onComplete();
    navigate(path);
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <Flower2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-semibold text-foreground">
              Bloom Suite AI
            </span>
          </div>
          <h1 className="text-3xl font-display font-semibold text-foreground mb-2">
            Welcome to Your Beauty Toolkit
          </h1>
          <p className="text-muted-foreground font-body">
            Let's get you started with our powerful AI tools
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all duration-300 ${
                index < currentStep
                  ? "bg-primary border-primary"
                  : index === currentStep
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/30 bg-transparent"
              }`}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4 text-primary-foreground" />
              ) : (
                <span className={`text-sm font-medium ${
                  index === currentStep ? "text-primary" : "text-muted-foreground"
                }`}>
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-8 text-center">
            <div className="h-20 w-20 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <step.icon className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <p className="text-sm text-primary font-medium mb-2">
              Step {currentStep + 1} of {steps.length}
            </p>
            
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              {step.title}
            </h2>
            
            <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
              {step.description}
            </p>

            <div className="space-y-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full group"
                onClick={() => handleTryTool(step.path)}
              >
                {step.action}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleNext}
                >
                  {isLastStep ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          You can access all tools anytime from your dashboard
        </p>
      </div>
    </div>
  );
}
