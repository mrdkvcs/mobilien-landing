"use client";
import AIChatWidget from "@/components/AIChatWidget";

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
      <div className="absolute inset-0 animate-[pulse_8s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(5, 20, 37,1) 100%, rgba(4,12,25,1) 100%) 40%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 animate-[pulse_6s_ease-in-out_infinite_alternate-reverse]"
        style={{
          background:
            "radial-gradient(circle at 70% 80%, rgba(4,12,25,1) 100%, rgba(4,12,25,1) 100%, transparent 80%)",
        }}
      />

      {/* Flowing shapes */}
      <div
        className="absolute -top-48 -left-48 w-[800px] h-[800px] animate-[flow_12s_ease-in-out_infinite]"
        style={{
          borderRadius: "40% 60% 50% 30%",
          background:
            "linear-gradient(45deg, rgba(35,175,205,0.15), rgba(62,173,158,0.1))",
        }}
      />
      <div
        className="absolute -bottom-36 -right-36 w-[600px] h-[600px] animate-[flow-reverse_15s_ease-in-out_infinite]"
        style={{
          borderRadius: "60% 40% 30% 70%",
          background:
            "linear-gradient(-45deg, rgba(71,185,165,0.1), rgba(35,175,205,0.08))",
        }}
      />

      {/* Accent dots */}
      <div
        className="absolute top-[20%] right-[15%] w-[120px] h-[120px] rounded-full animate-[float_4s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        className="absolute bottom-[30%] left-[20%] w-[80px] h-[80px] rounded-full animate-[float_6s_ease-in-out_infinite_reverse]"
        style={{
          background:
            "linear-gradient(135deg, rgba(71,185,165,0.3), rgba(71,185,165,0.1))",
        }}
      />

      {/* Shimmer line */}
      <div className="absolute top-[10%] left-[10%] right-[10%] h-[2px] animate-[shimmer_3s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,157,167,0.8), transparent)",
        }}
      />

      {/* Foreground content spacing */}
      <div className="relative py-[45px] md:py-[70px]">
        <div className="w-[min(96%,1180px)] mx-auto">
          <AIChatWidget />
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes pulse { from { opacity: .5; transform: scale(1); } to { opacity: .8; transform: scale(1.1); } }
        @keyframes flow {
          0% { transform: rotate(0deg) translateX(0px) translateY(0px); }
          33% { transform: rotate(120deg) translateX(50px) translateY(-30px); }
          66% { transform: rotate(240deg) translateX(-20px) translateY(40px); }
          100% { transform: rotate(360deg) translateX(0px) translateY(0px); }
        }
        @keyframes flow-reverse {
          0% { transform: rotate(0deg) translateX(0px) translateY(0px); }
          33% { transform: rotate(-120deg) translateX(-40px) translateY(20px); }
          66% { transform: rotate(-240deg) translateX(30px) translateY(-50px); }
          100% { transform: rotate(-360deg) translateX(0px) translateY(0px); }
        }
        @keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      `}</style>
    </div>
  );
}


