export const DecorativeBlobs = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {/* Top left blob */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-lavender/20 to-soft-blue/20 morph-blob animate-glow-pulse"
        style={{ filter: "blur(60px)" }}
      />
      
      {/* Top right blob */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-bl from-mint/20 to-lavender/15 morph-blob animate-glow-pulse"
        style={{ filter: "blur(50px)", animationDelay: "2s" }}
      />
      
      {/* Center blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-lavender/10 via-mint/10 to-peach/10 morph-blob"
        style={{ filter: "blur(80px)", animationDelay: "1s" }}
      />
      
      {/* Bottom left blob */}
      <div
        className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-peach/15 to-soft-blue/15 morph-blob animate-glow-pulse"
        style={{ filter: "blur(70px)", animationDelay: "3s" }}
      />
      
      {/* Bottom right blob */}
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-soft-blue/20 to-mint/20 morph-blob animate-glow-pulse"
        style={{ filter: "blur(60px)", animationDelay: "4s" }}
      />
    </div>
  );
};
