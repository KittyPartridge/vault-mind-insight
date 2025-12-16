import { KeyRound, FileCheck, BarChart3, Wallet } from "lucide-react";

const steps = [
  {
    icon: FileCheck,
    title: "Complete Assessment",
    description:
      "Answer psychological assessment questions in our secure, encrypted environment.",
    color: "lavender",
  },
  {
    icon: KeyRound,
    title: "Encrypted Processing",
    description:
      "Your responses are encrypted end-to-end. Your data remains completely private.",
    color: "mint",
  },
  {
    icon: Wallet,
    title: "Unlock with Wallet",
    description:
      "Connect your Rainbow Wallet to securely unlock and view your personal results.",
    color: "peach",
  },
  {
    icon: BarChart3,
    title: "Contribute Insights",
    description:
      "Anonymized data contributes to global psychological research and insights.",
    color: "soft-blue",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-background via-mint-light/10 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-lavender/10 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-mint/10 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-peach/10 rounded-full blur-xl animate-drift" />
      
      {/* Connection line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lavender/20 to-transparent hidden lg:block" style={{ transform: "translateY(-50%)" }} />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-mint-light/50 text-sm font-medium text-foreground border border-mint/20 mb-4 animate-bounce-in">
            Simple & Secure
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            How MindVault Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A simple, secure process that puts your privacy first
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border hover:shadow-2xl transition-all duration-500 group hover:-translate-y-3 hover:border-lavender/30"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Step number with glow */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-lavender to-soft-blue flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>

              {/* Icon container with animation */}
              <div
                className={`p-4 rounded-full mb-4 bg-${step.color}-light group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg`}
              >
                <step.icon className={`w-8 h-8 text-${step.color}`} />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-lavender transition-colors duration-300">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${step.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
