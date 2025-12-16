import { Shield, Lock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useState } from "react";

const sampleQuestions = [
  {
    id: 1,
    question: "How often do you feel overwhelmed by daily tasks?",
    encrypted: true,
  },
  {
    id: 2,
    question: "Do you find it easy to express your emotions to others?",
    encrypted: true,
  },
  {
    id: 3,
    question: "How would you rate your overall life satisfaction?",
    encrypted: true,
  },
];

export const TestPreview = () => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-lavender-light/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-20 w-24 h-24 bg-soft-blue/10 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-lavender/10 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/3 left-10 w-4 h-4 bg-mint rounded-full opacity-30 animate-drift" />
      <div className="absolute bottom-1/3 right-10 w-3 h-3 bg-peach rounded-full opacity-40 animate-drift" style={{ animationDelay: "2s" }} />
      
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-mint-light/50 px-4 py-2 rounded-full border border-mint/30 mb-6 animate-bounce-in">
            <Shield className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium text-foreground">Encrypted Assessment Preview</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Sample Assessment
          </h2>
          <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Each response is encrypted before storage. Your privacy is guaranteed.
          </p>
        </div>

        <Card className="p-8 space-y-6 backdrop-blur-sm bg-card/80 border-lavender/20 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
          {sampleQuestions.map((q, index) => (
            <div
              key={q.id}
              className="p-6 rounded-xl bg-background/50 border border-border space-y-4 hover:shadow-lg transition-all duration-300 hover:border-lavender/30 group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lavender-light flex items-center justify-center text-lavender font-semibold group-hover:scale-110 transition-transform duration-300">
                  {q.id}
                </div>
                <div className="flex-grow">
                  <p className="text-foreground font-medium mb-4">{q.question}</p>

                  <div className="flex flex-wrap gap-2">
                    {["Never", "Rarely", "Sometimes", "Often", "Always"].map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className={`rounded-full transition-all duration-300 ${
                          hoveredOption === `${q.id}-${option}`
                            ? "bg-gradient-to-r from-lavender to-soft-blue text-white border-transparent scale-105 shadow-lg"
                            : "hover:bg-lavender-light hover:border-lavender"
                        }`}
                        onMouseEnter={() => setHoveredOption(`${q.id}-${option}`)}
                        onMouseLeave={() => setHoveredOption(null)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
                {q.encrypted && (
                  <Lock className="w-5 h-5 text-lavender flex-shrink-0 group-hover:animate-pulse" />
                )}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-mint-light/30 group hover:bg-mint-light/50 transition-colors duration-300">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-mint" />
                <span className="text-sm text-foreground font-medium">
                  All responses are encrypted end-to-end
                </span>
              </div>
              <Button 
                onClick={() => window.location.href = "/assessment"}
                className="bg-gradient-to-r from-lavender to-soft-blue text-white rounded-full hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Continue Assessment
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
