import { ShieldCheck, Fingerprint, Eye, Server } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "FHE Encrypted",
    description: "Fully Homomorphic Encryption",
  },
  {
    icon: Fingerprint,
    title: "Zero Knowledge",
    description: "Privacy Preserving Proofs",
  },
  {
    icon: Eye,
    title: "Self-Sovereign",
    description: "You Own Your Data",
  },
  {
    icon: Server,
    title: "Decentralized",
    description: "On-Chain Storage",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border hover:border-lavender/40 transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-2 rounded-full bg-gradient-to-br from-lavender/20 to-soft-blue/20 group-hover:from-lavender/30 group-hover:to-soft-blue/30 transition-colors">
                <badge.icon className="w-4 h-4 text-lavender" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">{badge.title}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
