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
    <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-background via-mint-light/10 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How MindVault Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, secure process that puts your privacy first
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-lavender to-soft-blue flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>

              <div
                className={`p-4 rounded-full mb-4 bg-${step.color}-light group-hover:scale-110 transition-transform`}
              >
                <step.icon className={`w-8 h-8 text-${step.color}`} />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
