import { WaveBackground } from "@/components/WaveBackground";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TestPreview } from "@/components/TestPreview";
import { FloatingParticles } from "@/components/FloatingParticles";
import { DecorativeBlobs } from "@/components/DecorativeBlobs";
import { StatsShowcase } from "@/components/StatsShowcase";
import { TrustBadges } from "@/components/TrustBadges";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <Header />
      <DecorativeBlobs />
      <WaveBackground />
      <FloatingParticles />
      
      <main className="relative z-10">
        <PageTransition>
          <Hero />
        </PageTransition>
        <PageTransition>
          <TrustBadges />
        </PageTransition>
        <PageTransition>
          <HowItWorks />
        </PageTransition>
        <PageTransition>
          <StatsShowcase />
        </PageTransition>
        <PageTransition>
          <TestPreview />
        </PageTransition>
        <Footer />
      </main>
    </div>
  );
};

export default Index;
