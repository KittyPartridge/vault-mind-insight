import { Shield, Users, Lock, Brain } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Assessments Completed",
    color: "lavender",
  },
  {
    icon: Shield,
    value: "100%",
    label: "End-to-End Encrypted",
    color: "mint",
  },
  {
    icon: Lock,
    value: "Zero",
    label: "Data Breaches",
    color: "peach",
  },
  {
    icon: Brain,
    value: "50+",
    label: "Research Partners",
    color: "soft-blue",
  },
];

export const StatsShowcase = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-lavender-light/20 via-transparent to-mint-light/20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lavender/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-mint/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-lavender-light/50 text-sm font-medium text-foreground border border-lavender/20 mb-4">
            Trusted Worldwide
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Privacy-First Mental Health Platform
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-lavender/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-${stat.color}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-xl bg-${stat.color}-light group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-shimmer">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
