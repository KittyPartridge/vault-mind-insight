import { Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const WalletSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="relative overflow-hidden p-12 bg-gradient-to-br from-lavender-light via-mint-light to-peach-light border-none shadow-2xl">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                <Wallet className="w-5 h-5 text-lavender" />
                <span className="text-sm font-semibold text-foreground">
                  Rainbow Wallet Required
                </span>
              </div>

              <h2 className="text-4xl font-bold text-foreground">
                Unlock Your Results Securely
              </h2>

              <p className="text-lg text-foreground/80">
                Connect your Rainbow Wallet to decrypt and access your personalized psychological
                assessment results. Your privacy key, your data.
              </p>

              <div className="space-y-3">
                {[
                  "End-to-end encrypted results",
                  "Only you can access your data",
                  "Secure blockchain verification",
                  "Anonymous contribution to research",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-mint flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-lavender to-soft-blue text-white hover:opacity-90 transition-all px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl mt-6"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Rainbow Wallet
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-white/60 backdrop-blur-sm p-8 shadow-2xl border border-white/40 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lavender to-soft-blue flex items-center justify-center animate-float shadow-lg">
                  <Wallet className="w-12 h-12 text-white" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Your Results</h3>
                  <p className="text-muted-foreground">Waiting to be unlocked</p>
                </div>

                <div className="w-full space-y-2">
                  <div className="h-2 rounded-full bg-lavender-light animate-pulse" />
                  <div className="h-2 rounded-full bg-mint-light animate-pulse delay-75" />
                  <div className="h-2 rounded-full bg-peach-light animate-pulse delay-150" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
