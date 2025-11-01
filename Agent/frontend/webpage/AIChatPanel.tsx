"use client";
import AIChatWidget from "./AIChatWidget";

export default function AIChatPanel() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(4,12,25,1) 100%, rgba(4,73,111,1) 80%, rgba(17,78,88,1) 100%)",
        }}
      />

      {/* Animated overlays */}
      <div className="absolute inset-0 animate-pulse"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(5, 20, 37,1) 100%, rgba(4,12,25,1) 100%) 40%, transparent 100%)",
          animation: "pulse 8s ease-in-out infinite alternate",
        }}
      />
      <div className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 70% 80%, rgba(4,12,25,1) 100%, rgba(4,12,25,1) 100%, transparent 80%)",
          animation: "pulse 6s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Flowing shapes */}
      <div
        className="absolute -top-48 -left-48 w-[800px] h-[800px] animate-flow"
        style={{
          borderRadius: "40% 60% 50% 30%",
          background:
            "linear-gradient(45deg, rgba(35,175,205,0.15), rgba(62,173,158,0.1))",
        }}
      />
      <div
        className="absolute -bottom-36 -right-36 w-[600px] h-[600px] animate-flow-reverse"
        style={{
          borderRadius: "60% 40% 30% 70%",
          background:
            "linear-gradient(-45deg, rgba(71,185,165,0.1), rgba(35,175,205,0.08))",
        }}
      />

      {/* Accent dots */}
      <div
        className="absolute top-[20%] right-[15%] w-[120px] h-[120px] rounded-full animate-float"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        className="absolute bottom-[30%] left-[20%] w-[80px] h-[80px] rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(71,185,165,0.3), rgba(71,185,165,0.1))",
          animation: "float 6s ease-in-out infinite reverse",
        }}
      />

      {/* Shimmer line */}
      <div className="absolute top-[10%] left-[10%] right-[10%] h-[2px] animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,157,167,0.8), transparent)",
        }}
      />

      {/* Foreground content spacing */}
      <div className="relative py-[70px] md:py-[95px]">
        <div className="w-[min(96%,1180px)] mx-auto">
          <AIChatWidget />
        </div>
      </div>

    </div>
  );
}

