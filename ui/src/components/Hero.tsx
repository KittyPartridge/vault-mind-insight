import { Lock, Shield, Users, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

export const Hero = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { toast } = useToast();

  const handleConnectWallet = () => {
    // Simulate wallet connection
    setIsWalletConnected(true);
    toast({
      title: "Wallet Connected",
      description: "Rainbow Wallet successfully connected.",
    });
  };

  const handleLearnMore = () => {
    const howItWorksSection = document.getElementById("how-it-works");
    howItWorksSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartAssessment = () => {
    window.location.href = "/assessment";
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-32">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>

      <div className="absolute top-8 right-8">
        {isWalletConnected ? (
          <Button
            variant="outline"
            className="border-mint text-foreground bg-mint-light/50 hover:bg-mint-light transition-all duration-300"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connected
          </Button>
        ) : (
          <Button
            onClick={handleConnectWallet}
            className="bg-gradient-to-r from-lavender to-soft-blue text-white hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </div>

      <div className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 bg-lavender-light/50 px-4 py-2 rounded-full border border-lavender/30 animate-bounce-in">
          <Lock className="w-4 h-4 text-lavender" />
          <span className="text-sm font-medium text-foreground">End-to-End Encrypted Testing</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight animate-fade-in">
          Understand Yourself,{" "}
          <span className="text-shimmer">
            Privately
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Complete encrypted psychological assessments. Your results remain yours alone, while
          contributing to anonymized global insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button
            size="lg"
            onClick={handleStartAssessment}
            className="bg-gradient-to-r from-lavender to-soft-blue text-white hover:opacity-90 transition-all px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 pulse-glow"
          >
            Start Your Assessment
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleLearnMore}
            className="border-lavender text-foreground hover:bg-lavender-light/20 px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
          >
            Learn More
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-16 stagger-children">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-lavender/30 group">
            <div className="p-3 rounded-full bg-lavender-light group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-lavender" />
            </div>
            <h3 className="font-semibold text-foreground">Fully Encrypted</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your responses are encrypted. Only you hold the key.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-mint/30 group">
            <div className="p-3 rounded-full bg-mint-light group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-6 h-6 text-mint" />
            </div>
            <h3 className="font-semibold text-foreground">Private Results</h3>
            <p className="text-sm text-muted-foreground text-center">
              Results revealed only to you via secure wallet unlock.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-peach/30 group">
            <div className="p-3 rounded-full bg-peach-light group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-peach" />
            </div>
            <h3 className="font-semibold text-foreground">Global Insights</h3>
            <p className="text-sm text-muted-foreground text-center">
              Contribute anonymized data to advance psychological research.
            </p>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-lavender/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-lavender/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
