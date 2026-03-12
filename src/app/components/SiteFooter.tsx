import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <div className="py-3 mt-2">
      {/* 手绘波浪分隔线 */}
      <svg
        viewBox="0 0 800 24"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full mb-3"
        style={{ height: "24px" }}
        preserveAspectRatio="none"
      >
        <path
          d="M0,12 C20,4 40,20 60,12 C80,4 100,18 120,10 C140,3 160,19 180,11 C200,3 220,18 240,12 C260,6 280,18 300,10 C320,3 340,20 360,12 C380,4 400,19 420,11 C440,4 460,19 480,12 C500,5 520,18 540,11 C560,5 580,19 600,12 C620,5 640,18 660,11 C680,4 700,19 720,12 C740,5 760,18 780,11 C790,8 795,10 800,10"
          stroke="#4A3728"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />
        <circle cx="120" cy="11" r="1.8" fill="#F4A261" opacity="0.7" />
        <circle cx="320" cy="11" r="1.8" fill="#F4C2C2" opacity="0.7" />
        <circle cx="500" cy="12" r="1.8" fill="#A8DADC" opacity="0.7" />
        <circle cx="680" cy="11" r="1.8" fill="#F4A261" opacity="0.7" />
      </svg>

      <div className="text-center flex flex-col items-center gap-1.5">
        <Heart className="w-5 h-5" style={{ color: "#F4C2C2" }} fill="#F4C2C2" />
        <p className="text-base" style={{ color: "#5D4037" }}>Bao & Zhang 的恋爱小窝</p>
        <p className="text-sm" style={{ color: "#C0B0A0" }}>
          🐾 每一天都是礼物 · {new Date().getFullYear()}年{new Date().getMonth() + 1}月{new Date().getDate()}日
        </p>
      </div>
    </div>
  );
}
