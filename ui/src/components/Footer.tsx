import { Logo } from "./Logo";
import { Shield, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative py-16 px-4 bg-gradient-to-t from-lavender-light/30 to-transparent">
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lavender/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <Logo />
          
          {/* Tagline */}
          <p className="text-muted-foreground max-w-md">
            Empowering mental health research through privacy-preserving technology. 
            Your mind, your data, your control.
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-mint" />
              <span>Privacy First</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-peach" />
              <span>Built with Care</span>
            </div>
          </div>
          
          {/* Decorative divider */}
          <div className="w-32 h-1 rounded-full bg-gradient-to-r from-lavender via-mint to-soft-blue opacity-50" />
          
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MindVault. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-lavender/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-mint/10 rounded-full blur-3xl" />
    </footer>
  );
};
