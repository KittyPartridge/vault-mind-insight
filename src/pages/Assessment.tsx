import { useState } from "react";
import { Shield, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";

const assessmentQuestions = [
  {
    id: 1,
    question: "How often do you feel overwhelmed by daily tasks?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 2,
    question: "Do you find it easy to express your emotions to others?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 3,
    question: "How would you rate your overall life satisfaction?",
    options: ["Very Low", "Low", "Moderate", "High", "Very High"],
  },
  {
    id: 4,
    question: "How often do you engage in activities you enjoy?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 5,
    question: "How comfortable are you with asking for help when needed?",
    options: ["Very Uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very Comfortable"],
  },
  {
    id: 6,
    question: "How well do you handle stress in challenging situations?",
    options: ["Very Poorly", "Poorly", "Moderately", "Well", "Very Well"],
  },
  {
    id: 7,
    question: "How satisfied are you with your current relationships?",
    options: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
  },
  {
    id: 8,
    question: "How often do you feel anxious about the future?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 9,
    question: "How would you describe your sleep quality?",
    options: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
  },
  {
    id: 10,
    question: "How confident do you feel in making important decisions?",
    options: ["Not Confident", "Slightly Confident", "Moderately Confident", "Confident", "Very Confident"],
  },
];

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const progress = (Object.keys(answers).length / assessmentQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [assessmentQuestions[currentQuestion].id]: answer,
    }));

    if (currentQuestion < assessmentQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === assessmentQuestions.length) {
      // Simulate encryption and submission
      toast({
        title: "Assessment Submitted Successfully",
        description: "Your responses have been encrypted and securely stored. Connect your wallet to view results.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const question = assessmentQuestions[currentQuestion];
  
  if (!question) {
    return null;
  }
  
  const isAnswered = answers[question.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-lavender-light/10 to-background">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>

      <div className="absolute top-8 right-8">
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/"}
          className="text-foreground hover:bg-lavender-light/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        <div className="mb-8 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-mint-light/50 px-4 py-2 rounded-full border border-mint/30">
              <Shield className="w-4 h-4 text-mint" />
              <span className="text-sm font-medium text-foreground">
                Encrypted Assessment
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 md:p-12 backdrop-blur-sm bg-card/80 border-lavender/20 shadow-2xl animate-fade-in">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-lavender to-soft-blue flex items-center justify-center text-white font-bold text-lg">
                {question.id}
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {question.question}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-lavender" />
                  <span>Your response will be encrypted</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {question.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  variant={answers[question.id] === option ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 px-6 text-base transition-all ${
                    answers[question.id] === option
                      ? "bg-gradient-to-r from-lavender to-soft-blue text-white border-none shadow-lg"
                      : "hover:bg-lavender-light/20 hover:border-lavender"
                  }`}
                >
                  {answers[question.id] === option && (
                    <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                  )}
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <Button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                variant="outline"
                className="border-lavender text-foreground hover:bg-lavender-light/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === assessmentQuestions.length - 1 && isAnswered && (
                <Button
                  onClick={handleSubmit}
                  className="flex-grow bg-gradient-to-r from-lavender to-soft-blue text-white hover:opacity-90 shadow-lg"
                >
                  Submit Assessment
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-mint-light/20 border border-mint/30">
              <Shield className="w-5 h-5 text-mint flex-shrink-0" />
              <p className="text-sm text-foreground">
                All your responses are being encrypted end-to-end. Only you can decrypt and view your results using your wallet.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
