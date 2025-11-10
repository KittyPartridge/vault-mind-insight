import { Shield, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

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
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-lavender-light/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-mint-light/50 px-4 py-2 rounded-full border border-mint/30 mb-6">
            <Shield className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium text-foreground">Encrypted Assessment Preview</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sample Assessment
          </h2>
          <p className="text-xl text-muted-foreground">
            Each response is encrypted before storage. Your privacy is guaranteed.
          </p>
        </div>

        <Card className="p-8 space-y-6 backdrop-blur-sm bg-card/80 border-lavender/20 shadow-xl">
          {sampleQuestions.map((q, index) => (
            <div
              key={q.id}
              className="p-6 rounded-xl bg-background/50 border border-border space-y-4 hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lavender-light flex items-center justify-center text-lavender font-semibold">
                  {q.id}
                </div>
                <div className="flex-grow">
                  <p className="text-foreground font-medium mb-4">{q.question}</p>

                  <div className="flex flex-wrap gap-2">
                    {["Never", "Rarely", "Sometimes", "Often", "Always"].map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className="rounded-full hover:bg-lavender-light hover:border-lavender transition-all"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
                {q.encrypted && (
                  <Lock className="w-5 h-5 text-lavender flex-shrink-0" />
                )}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-mint-light/30">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-mint" />
                <span className="text-sm text-foreground font-medium">
                  All responses are encrypted end-to-end
                </span>
              </div>
              <Button 
                onClick={() => window.location.href = "/assessment"}
                className="bg-gradient-to-r from-lavender to-soft-blue text-white rounded-full"
              >
                Continue Assessment
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
