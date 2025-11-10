import { Brain } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Brain className="w-8 h-8 text-primary" strokeWidth={1.5} />
        <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-lavender rounded-full border-2 border-background" />
        <div className="absolute right-1 top-0 w-2 h-2 bg-mint rounded-full border border-background" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-lavender to-soft-blue bg-clip-text text-transparent">
        MindVault
      </span>
    </div>
  );
};
