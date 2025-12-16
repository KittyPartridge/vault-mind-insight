import { useState, useEffect } from "react";
import { Shield, Lock, CheckCircle2, ArrowLeft, Wallet, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { useMoodScoreTest } from "@/hooks/useMoodScoreTest";
import { getContractAddress } from "@/config/contract";
import { FloatingParticles } from "@/components/FloatingParticles";
import { DecorativeBlobs } from "@/components/DecorativeBlobs";

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

// Map option text to score (1-5) based on position in options array
const optionToScore = (option: string, questionOptions: string[]): number => {
  const optionIndex = questionOptions.findIndex(opt => opt === option);
  if (optionIndex === -1) {
    return 1; // default to 1 if not found
  }
  return optionIndex + 1; // 1-5 based on position
};

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [moodScore, setMoodScore] = useState<{ totalScore: number; answerCount: number; averageScore: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const { hasSubmitted, isLoading, message, submitMoodTest, decryptMoodScore } = useMoodScoreTest(contractAddress);

  // Debug log
  useEffect(() => {
    console.log("[Assessment] Component state:", {
      isConnected,
      address,
      chainId,
      contractAddress,
      hasSubmitted,
      isLoading,
      showResults,
    });
  }, [isConnected, address, chainId, contractAddress, hasSubmitted, isLoading, showResults]);

  const progress = (Object.keys(answers).length / assessmentQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [assessmentQuestions[currentQuestion].id]: answer,
    }));

    if (currentQuestion < assessmentQuestions.length - 1) {
      setSlideDirection("left");
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit the assessment.",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(answers).length !== assessmentQuestions.length) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Convert answers to scores (1-5)
    const answerScores = assessmentQuestions.map(q => {
      const answer = answers[q.id];
      return optionToScore(answer, q.options);
    });

    try {
      await submitMoodTest(answerScores);
      toast({
        title: "Assessment Submitted Successfully",
        description: "Your responses have been encrypted and securely stored on-chain.",
      });
      setShowResults(true);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDecrypt = async () => {
    console.log("[handleDecrypt] Button clicked!", {
      isConnected,
      contractAddress,
      isLoading,
      hasSubmitted,
    });

    if (!isConnected) {
      console.warn("[handleDecrypt] Wallet not connected");
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to decrypt results.",
        variant: "destructive",
      });
      return;
    }

    if (!contractAddress) {
      console.warn("[handleDecrypt] Contract address not set", { chainId });
      toast({
        title: "Contract Not Configured",
        description: "Contract address is not set. Please check your configuration.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[handleDecrypt] Starting decryption...", {
        contractAddress,
        address,
        hasDecryptFunction: typeof decryptMoodScore === "function",
      });
      const result = await decryptMoodScore();
      console.log("[handleDecrypt] Decrypt result:", result);
      if (result) {
        console.log("[handleDecrypt] Decryption successful:", result);
        setMoodScore(result);
        toast({
          title: "Results Decrypted",
          description: `Your average mood score is ${result.averageScore.toFixed(2)}/5.00`,
        });
      } else {
        console.warn("[handleDecrypt] Decryption returned undefined");
        toast({
          title: "Decryption Failed",
          description: message || "Failed to decrypt results. Please check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("[handleDecrypt] Decryption error:", error);
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setSlideDirection("right");
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const question = assessmentQuestions[currentQuestion];
  
  if (!question) {
    return null;
  }
  
  const isAnswered = answers[question.id] !== undefined;
  const allAnswered = Object.keys(answers).length === assessmentQuestions.length;

  // Show results view if submitted
  if (showResults || hasSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-lavender-light/10 to-background relative overflow-hidden">
        <DecorativeBlobs />
        <FloatingParticles />
        
        <div className="absolute top-8 left-8 z-20">
          <Logo />
        </div>

        <div className="absolute top-8 right-8 z-20">
          <ConnectButton />
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-32 pb-16 relative z-10">
          <Card className="p-8 md:p-12 backdrop-blur-sm bg-card/80 border-lavender/20 shadow-2xl animate-scale-in">
            <div className="space-y-8 text-center">
              <div className="inline-flex items-center gap-2 bg-mint-light/50 px-4 py-2 rounded-full border border-mint/30 animate-bounce-in">
                <Shield className="w-4 h-4 text-mint" />
                <span className="text-sm font-medium text-foreground">
                  Assessment Submitted
                </span>
              </div>

              <h2 className="text-3xl font-bold text-foreground animate-fade-in">
                Your Mood Score Results
              </h2>

              {moodScore ? (
                <div className="space-y-4 animate-scale-in">
                  <div className="text-6xl font-bold text-shimmer">
                    {moodScore.averageScore.toFixed(2)}
                  </div>
                  <div className="text-muted-foreground">
                    Average Score out of 5.00
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <Card className="p-4 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                      <div className="text-sm text-muted-foreground">Total Score</div>
                      <div className="text-2xl font-bold text-lavender">{moodScore.totalScore}</div>
                    </Card>
                    <Card className="p-4 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                      <div className="text-2xl font-bold text-mint">{moodScore.answerCount}</div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-muted-foreground">
                    Your assessment has been encrypted and stored on-chain. Click below to decrypt and view your results.
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={(e) => {
                        console.log("[Button] onClick triggered", {
                          isLoading,
                          isConnected,
                          contractAddress,
                          disabled: isLoading || !isConnected || !contractAddress,
                        });
                        e.preventDefault();
                        handleDecrypt();
                      }}
                      disabled={isLoading || !isConnected || !contractAddress}
                      className="bg-gradient-to-r from-lavender to-soft-blue text-white hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-300 pulse-glow"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      {isLoading ? "Decrypting..." : "Decrypt Results"}
                    </Button>
                    {(!isConnected || !contractAddress) && (
                      <p className="text-xs text-muted-foreground">
                        {!isConnected && "⚠️ Wallet not connected. "}
                        {!contractAddress && `⚠️ Contract not configured (Chain ID: ${chainId}). `}
                        {!contractAddress && "Please set VITE_CONTRACT_ADDRESS in .env.local"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {message && (
                <div className="p-4 rounded-xl bg-mint-light/20 border border-mint/30 animate-fade-in">
                  <p className="text-sm text-foreground">{message}</p>
                </div>
              )}

              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="border-lavender text-foreground hover:bg-lavender-light/20 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-lavender-light/10 to-background relative overflow-hidden">
      <DecorativeBlobs />
      <FloatingParticles />
      
      <div className="absolute top-8 left-8 z-20">
        <Logo />
      </div>

      <div className="absolute top-8 right-8 z-20">
        <ConnectButton />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-mint-light/50 px-4 py-2 rounded-full border border-mint/30 animate-bounce-in">
              <Shield className="w-4 h-4 text-mint" />
              <span className="text-sm font-medium text-foreground">
                Encrypted Assessment
              </span>
            </div>
            <span className="text-sm text-muted-foreground animate-fade-in">
              Question {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
          </div>

          <div className="relative">
            <Progress value={progress} className="h-2" />
            {/* Progress glow effect */}
            <div 
              className="absolute top-0 h-2 bg-gradient-to-r from-lavender to-soft-blue rounded-full blur-sm opacity-50 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className={`p-8 md:p-12 backdrop-blur-sm bg-card/80 border-lavender/20 shadow-2xl transition-all duration-300 ${
          isTransitioning 
            ? slideDirection === "left" 
              ? "opacity-0 translate-x-8" 
              : "opacity-0 -translate-x-8"
            : "opacity-100 translate-x-0"
        }`}>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-lavender to-soft-blue flex items-center justify-center text-white font-bold text-lg shadow-lg animate-scale-in">
                {question.id}
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 animate-fade-in">
                  {question.question}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <Lock className="w-4 h-4 text-lavender" />
                  <span>Your response will be encrypted</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 stagger-children">
              {question.options.map((option, index) => (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  variant={answers[question.id] === option ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 px-6 text-base transition-all duration-300 ${
                    answers[question.id] === option
                      ? "bg-gradient-to-r from-lavender to-soft-blue text-white border-none shadow-lg scale-[1.02]"
                      : "hover:bg-lavender-light/20 hover:border-lavender hover:scale-[1.01] hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {answers[question.id] === option && (
                    <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 animate-scale-in" />
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
                className="border-lavender text-foreground hover:bg-lavender-light/20 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === assessmentQuestions.length - 1 && allAnswered && (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !isConnected}
                  className="flex-grow bg-gradient-to-r from-lavender to-soft-blue text-white hover:opacity-90 shadow-lg hover:scale-[1.02] transition-all duration-300 pulse-glow"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isLoading ? "Submitting..." : "Submit Assessment"}
                </Button>
              )}
            </div>

            {!isConnected && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 animate-fade-in">
                <Wallet className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  Please connect your wallet to submit the assessment.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 p-4 rounded-xl bg-mint-light/20 border border-mint/30 animate-fade-in">
              <Shield className="w-5 h-5 text-mint flex-shrink-0" />
              <p className="text-sm text-foreground">
                All your responses are being encrypted end-to-end. Only you can decrypt and view your results using your wallet.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Question indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {assessmentQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentQuestion
                  ? "w-6 bg-gradient-to-r from-lavender to-soft-blue"
                  : index < currentQuestion || answers[assessmentQuestions[index].id]
                  ? "bg-lavender/60"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
