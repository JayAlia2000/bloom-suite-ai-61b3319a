import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Onboarding from "@/components/Onboarding";

type AuthMode = "login" | "signup" | "forgot-password" | "verify-email";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in (skip if showing onboarding)
  useEffect(() => {
    if (user && !showOnboarding) {
      navigate("/dashboard");
    }
  }, [user, navigate, showOnboarding]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const getErrorMessage = (error: any): string => {
    const message = error?.message?.toLowerCase() || "";
    
    // Handle specific error cases
    if (message.includes("invalid login credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("email not confirmed")) {
      return "Please verify your email before signing in.";
    }
    if (message.includes("user not found")) {
      return "No account found with this email. Please sign up first.";
    }
    if (message.includes("already registered") || message.includes("user already registered")) {
      return "This email is already registered. Please sign in instead.";
    }
    if (message.includes("password")) {
      return "Password must be at least 6 characters long.";
    }
    if (message.includes("rate limit") || message.includes("too many requests")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (message.includes("token has expired") || message.includes("otp expired")) {
      return "Verification code has expired. Please request a new one.";
    }
    if (message.includes("invalid") && message.includes("otp")) {
      return "Invalid verification code. Please check and try again.";
    }
    if (message.includes("email link is invalid or has expired")) {
      return "Verification link has expired. Please request a new one.";
    }
    
    return error?.message || "An unexpected error occurred. Please try again.";
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to resend",
          description: getErrorMessage(error),
        });
      } else {
        toast({
          title: "Verification email sent!",
          description: "Please check your inbox for the new code.",
        });
        setResendCooldown(60); // 60 second cooldown
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: "signup",
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: getErrorMessage(error),
        });
        setOtp("");
      } else if (data.user) {
        toast({
          title: "Email verified — welcome to Bloom Suite AI!",
          description: "Your account is now active.",
        });
        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${data.user.id}`);
        if (!hasCompletedOnboarding && isNewUser) {
          setShowOnboarding(true);
        } else {
          navigate("/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          const errorMessage = error.message?.toLowerCase() || "";
          
          // Check if email is not confirmed
          if (errorMessage.includes("email not confirmed")) {
            toast({
              variant: "destructive",
              title: "Email not verified",
              description: "Please verify your email to continue. We'll send you a new verification code.",
            });
            // Resend verification email and switch to verify mode
            await supabase.auth.resend({
              type: "signup",
              email: email,
            });
            setMode("verify-email");
            setResendCooldown(60);
          } else {
            toast({
              variant: "destructive",
              title: "Sign in failed",
              description: getErrorMessage(error),
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: getErrorMessage(error),
          });
        } else {
          toast({
            title: "Check your email!",
            description: "We've sent you a verification code.",
          });
          setIsNewUser(true);
          setMode("verify-email");
          setResendCooldown(60);
        }
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast({
            variant: "destructive",
            title: "Reset failed",
            description: getErrorMessage(error),
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setMode("login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Welcome Back";
      case "signup":
        return "Join Bloom Suite AI";
      case "forgot-password":
        return "Reset Password";
      case "verify-email":
        return "Verify Your Email";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "login":
        return "Sign in to access your beauty tools";
      case "signup":
        return "Create your account to get started";
      case "forgot-password":
        return "Enter your email to receive a reset link";
      case "verify-email":
        return `Enter the 6-digit code sent to ${email}`;
    }
  };

  const getButtonText = () => {
    if (loading) return "Please wait...";
    switch (mode) {
      case "login":
        return "Sign In";
      case "signup":
        return "Create Account";
      case "forgot-password":
        return "Send Reset Link";
      case "verify-email":
        return "Verify Email";
    }
  };

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  // Show onboarding for new users
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Verify Email Screen
  if (mode === "verify-email") {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-8 animate-fade-in-up">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-12 w-12 gradient-hero rounded-xl flex items-center justify-center shadow-glow">
                <Flower2 className="h-7 w-7 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              {getTitle()}
            </h1>
            <p className="text-muted-foreground mt-2 font-body">
              {getDescription()}
            </p>
          </div>

          <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Check Your Inbox</CardTitle>
              <CardDescription>
                We sent a 6-digit verification code to <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-primary hover:text-primary/80"
                >
                  {resendLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend Code"}
                </Button>
              </div>

              <div className="text-center pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setOtp("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Check your spam folder if you don't see the email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <Flower2 className="h-7 w-7 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mt-2 font-body">
            {getDescription()}
          </p>
        </div>

        <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Forgot Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "forgot-password" 
                ? "We'll send you a link to reset your password"
                : "Enter your details below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {mode !== "forgot-password" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot-password")}
                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {mode === "signup" && (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>
              )}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {getButtonText()}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === "forgot-password" ? (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                >
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
