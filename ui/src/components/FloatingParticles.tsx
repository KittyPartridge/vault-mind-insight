import { useMemo } from "react";

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "hexagon";
}

const colors = [
  "bg-lavender/30",
  "bg-mint/30",
  "bg-peach/30",
  "bg-soft-blue/30",
  "bg-lavender-light/50",
  "bg-mint-light/50",
];

const shapes = ["circle", "square", "triangle", "hexagon"] as const;

export const FloatingParticles = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 20 + 8,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
  }, []);

  const renderShape = (particle: Particle) => {
    const baseStyle = {
      width: particle.size,
      height: particle.size,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      animationDelay: `${particle.delay}s`,
      animationDuration: `${particle.duration}s`,
    };

    switch (particle.shape) {
      case "triangle":
        return (
          <div
            key={particle.id}
            className="absolute animate-drift opacity-40"
            style={{
              ...baseStyle,
              width: 0,
              height: 0,
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid hsl(var(--lavender) / 0.3)`,
            }}
          />
        );
      case "hexagon":
        return (
          <div
            key={particle.id}
            className={`absolute animate-float-slow ${particle.color} opacity-50`}
            style={{
              ...baseStyle,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
        );
      case "square":
        return (
          <div
            key={particle.id}
            className={`absolute animate-drift ${particle.color} rounded-sm opacity-40`}
            style={{
              ...baseStyle,
              transform: "rotate(45deg)",
            }}
          />
        );
      default:
        return (
          <div
            key={particle.id}
            className={`absolute animate-float-slow ${particle.color} rounded-full opacity-50`}
            style={baseStyle}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(renderShape)}
    </div>
  );
};
