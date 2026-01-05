import { useState } from "react";
import { MessageSquarePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatYouLike, setWhatYouLike] = useState("");
  const [whatConfused, setWhatConfused] = useState("");
  const [featureRequest, setFeatureRequest] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatYouLike.trim() && !whatConfused.trim() && !featureRequest.trim()) {
      toast({
        variant: "destructive",
        title: "Please fill in at least one field",
        description: "We'd love to hear your thoughts!",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id || null,
        what_you_like: whatYouLike.trim() || null,
        what_confused_you: whatConfused.trim() || null,
        feature_request: featureRequest.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate you helping us improve.",
      });

      // Reset form and close
      setWhatYouLike("");
      setWhatConfused("");
      setFeatureRequest("");
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to submit feedback",
        description: error.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="hero"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-glow hover:scale-110 transition-transform"
          aria-label="Send Feedback"
        >
          <MessageSquarePlus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Send Feedback</DialogTitle>
          <DialogDescription className="font-body">
            Help us make Bloom Suite AI even better for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="what-you-like" className="text-sm font-medium">
              What do you like? 💖
            </Label>
            <Textarea
              id="what-you-like"
              placeholder="Tell us what's working well for you..."
              value={whatYouLike}
              onChange={(e) => setWhatYouLike(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="what-confused" className="text-sm font-medium">
              What confused you? 🤔
            </Label>
            <Textarea
              id="what-confused"
              placeholder="Let us know what was unclear or difficult..."
              value={whatConfused}
              onChange={(e) => setWhatConfused(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-request" className="text-sm font-medium">
              What feature do you want next? ✨
            </Label>
            <Textarea
              id="feature-request"
              placeholder="Share your ideas for new features..."
              value={featureRequest}
              onChange={(e) => setFeatureRequest(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
