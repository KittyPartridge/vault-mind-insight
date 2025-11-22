import { WaveBackground } from "@/components/WaveBackground";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TestPreview } from "@/components/TestPreview";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <WaveBackground />
      
      <main className="relative z-10">
        <Hero />
        <HowItWorks />
        <TestPreview />
      </main>
    </div>
  );
};

export default Index;
