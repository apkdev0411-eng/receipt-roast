"use client";

export function FlameBackground() {
  const flames = [
    { left: "8%", top: "15%", delay: "0s", size: "20px" },
    { left: "22%", top: "65%", delay: "0.4s", size: "16px" },
    { left: "38%", top: "25%", delay: "0.8s", size: "24px" },
    { left: "52%", top: "75%", delay: "1.2s", size: "18px" },
    { left: "68%", top: "20%", delay: "0.6s", size: "22px" },
    { left: "82%", top: "55%", delay: "1s", size: "16px" },
    { left: "12%", top: "85%", delay: "0.2s", size: "18px" },
    { left: "45%", top: "10%", delay: "1.5s", size: "20px" },
    { left: "75%", top: "80%", delay: "0.9s", size: "16px" },
    { left: "30%", top: "45%", delay: "1.3s", size: "22px" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: "#07070a",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-20px); opacity: 0.85; }
        }
      `}</style>
      {flames.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: f.left,
            top: f.top,
            fontSize: f.size,
            animation: "floatUp 3s ease-in-out infinite",
            animationDelay: f.delay,
          }}
        >
          🔥
        </div>
      ))}
    </div>
  );
}