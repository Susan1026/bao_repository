import { useLocation } from "react-router";

// Full-page scattered hand-drawn doodles, fixed behind all content
// pointer-events-none so they never block interaction

// ─── Shared tiny shapes ────────────────────────────────────────────────────────
// Each icon is a small self-contained SVG group rendered at an absolute position
// within a fixed full-screen container.

interface Doodle {
  x: string; // left %
  y: string; // top %
  size: number;
  rotate?: number;
  opacity?: number;
  icon: "heart" | "star" | "paw" | "sparkle" | "circle-dot" | "cross-star"
      | "flower" | "cloud" | "camera" | "speech" | "ribbon" | "balloon"
      | "rocket" | "moon" | "comet" | "polaroid" | "butterfly" | "leaf"
      | "film" | "lollipop" | "music-note" | "diamond";
  color: string;
}

function Heart({ size, color }: { size: number; color: string }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12,21 C12,21 3,14 3,8 C3,5 5.5,3 8,4.5 C10,5.5 12,8 12,8 C12,8 14,5.5 16,4.5 C18.5,3 21,5 21,8 C21,14 12,21 12,21Z"
        fill={color} stroke="#4A3728" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12,3 L14.2,9.3 L21,9.3 L15.5,13.4 L17.6,19.8 L12,15.8 L6.4,19.8 L8.5,13.4 L3,9.3 L9.8,9.3Z"
        fill={color} stroke="#4A3728" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Paw({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="20" rx="8" ry="9" fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <ellipse cx="7"  cy="13" rx="4"  ry="5" fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <ellipse cx="25" cy="13" rx="4"  ry="5" fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <ellipse cx="11" cy="8"  rx="3.5" ry="4.5" fill={color} stroke="#4A3728" strokeWidth="1.4" />
      <ellipse cx="21" cy="8"  rx="3.5" ry="4.5" fill={color} stroke="#4A3728" strokeWidth="1.4" />
    </svg>
  );
}

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12,2 L13.2,10.8 L12,20 L10.8,10.8Z" fill={color} stroke="#4A3728" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2,12 L10.8,13.2 L20,12 L10.8,10.8Z" fill={color} stroke="#4A3728" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5,5 L11,11" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M19,5 L13,11" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function CircleDot({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="3" fill="#4A3728" fillOpacity="0.25" />
    </svg>
  );
}

function CrossStar({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12,2 L14,10 L12,12 L10,10Z" fill={color} stroke="#4A3728" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M22,12 L14,14 L12,12 L14,10Z" fill={color} stroke="#4A3728" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12,22 L10,14 L12,12 L14,14Z" fill={color} stroke="#4A3728" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2,12 L10,10 L12,12 L10,14Z"  fill={color} stroke="#4A3728" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Flower({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <ellipse cx="18" cy="8"  rx="5" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <ellipse cx="28" cy="13" rx="5" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" transform="rotate(60 28 13)" />
      <ellipse cx="28" cy="23" rx="5" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" transform="rotate(120 28 23)" />
      <ellipse cx="18" cy="28" rx="5" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" transform="rotate(180 18 28)" />
      <ellipse cx="8"  cy="23" rx="5" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" transform="rotate(240 8 23)" />
      <ellipse cx="8"  cy="13" rx="5" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" transform="rotate(300 8 13)" />
      <circle cx="18" cy="18" r="6" fill="#FFD54F" stroke="#4A3728" strokeWidth="1.5" />
    </svg>
  );
}

function Cloud({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 28" fill="none">
      <ellipse cx="22" cy="20" rx="18" ry="9"  fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <ellipse cx="14" cy="17" rx="9"  ry="7"  fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <ellipse cx="30" cy="15" rx="11" ry="8"  fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <ellipse cx="22" cy="13" rx="9"  ry="8"  fill={color} />
    </svg>
  );
}

function Camera({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 32" fill="none">
      <rect x="2" y="8" width="36" height="22" rx="6" fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <circle cx="20" cy="19" r="7"  fill="white" fillOpacity="0.7" stroke="#4A3728" strokeWidth="1.6" />
      <circle cx="20" cy="19" r="3.5" fill="#A8DADC" fillOpacity="0.7" />
      <rect x="14" y="3" width="12" height="8" rx="3" fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <circle cx="32" cy="13" r="2.5" fill="#FFD54F" />
    </svg>
  );
}

function Speech({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 36" fill="none">
      <rect x="2" y="2" width="40" height="26" rx="10" fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <polygon points="10,28 6,38 20,30" fill={color} stroke="#4A3728" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="13" cy="15" r="2.5" fill="#4A3728" fillOpacity="0.3" />
      <circle cx="22" cy="15" r="2.5" fill="#4A3728" fillOpacity="0.3" />
      <circle cx="31" cy="15" r="2.5" fill="#4A3728" fillOpacity="0.3" />
    </svg>
  );
}

function Ribbon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path d="M18,18 C8,8 2,2 6,12 C10,20 18,18 18,18Z"    fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <path d="M18,18 C28,8 34,2 30,12 C26,20 18,18 18,18Z"   fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <path d="M18,18 C8,28 2,34 6,24 C10,16 18,18 18,18Z"   fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <path d="M18,18 C28,28 34,34 30,24 C26,16 18,18 18,18Z" fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="4.5" fill="#FF8A5B" stroke="#4A3728" strokeWidth="1.5" />
    </svg>
  );
}

function Balloon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 50" fill="none">
      <ellipse cx="16" cy="18" rx="13" ry="16" fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <ellipse cx="10" cy="12" rx="4" ry="6" fill="white" fillOpacity="0.25" />
      <path d="M13,34 C11,40 14,46 16,50 C18,46 21,40 19,34" stroke="#4A3728" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M12,50 C14,48 18,48 20,50" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Rocket({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 48" fill="none">
      <path d="M16,2 C16,2 6,14 5,30 L5,42 L16,38 L27,42 L27,30 C26,14 16,2 16,2Z"
        fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <ellipse cx="16" cy="2" rx="6" ry="4" fill="#A8DADC" stroke="#4A3728" strokeWidth="1.5" />
      <circle cx="16" cy="22" r="5" fill="white" fillOpacity="0.6" stroke="#4A3728" strokeWidth="1.4" />
      <path d="M5,38 L0,46 L5,42Z" fill="#F4C2C2" stroke="#4A3728" strokeWidth="1.4" />
      <path d="M27,38 L32,46 L27,42Z" fill="#F4C2C2" stroke="#4A3728" strokeWidth="1.4" />
    </svg>
  );
}

function Moon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M22,4 C12,8 8,16 11,24 C14,30 22,34 30,28 C18,28 12,22 13,14 C14,8 18,4 22,4Z"
        fill={color} stroke="#4A3728" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function Comet({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 32" fill="none">
      <line x1="44" y1="4" x2="6" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <line x1="44" y1="4" x2="4" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="44" cy="4" r="5" fill={color} stroke="#4A3728" strokeWidth="1.6" />
    </svg>
  );
}

function Polaroid({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 46" fill="none">
      <rect x="2" y="2" width="34" height="42" rx="4" fill="white" fillOpacity="0.85" stroke="#4A3728" strokeWidth="1.8" />
      <rect x="6" y="6" width="26" height="24" rx="3" fill={color} stroke="#4A3728" strokeWidth="1.4" />
      <line x1="13" y1="38" x2="25" y2="38" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3" />
    </svg>
  );
}

function Butterfly({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 30" fill="none">
      <path d="M20,15 C10,5 0,7 3,16 C6,23 20,18 20,18Z"  fill={color}      stroke="#4A3728" strokeWidth="1.5" />
      <path d="M20,15 C30,5 40,7 37,16 C34,23 20,18 20,18Z" fill="#A8DADC"  stroke="#4A3728" strokeWidth="1.5" />
      <path d="M20,15 C10,20 4,28 8,24 C12,20 20,18 20,18Z" fill={color}    stroke="#4A3728" strokeWidth="1.3" />
      <path d="M20,15 C30,20 36,28 32,24 C28,20 20,18 20,18Z" fill="#A8DADC" stroke="#4A3728" strokeWidth="1.3" />
      <path d="M20,10 C19,14 19,18 20,22 C21,18 21,14 20,10Z" stroke="#4A3728" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

function Leaf({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 36" fill="none">
      <path d="M14,2 C14,2 2,8 4,22 C6,34 14,34 14,34 C14,34 26,28 24,14 C22,2 14,2 14,2Z"
        fill={color} stroke="#4A3728" strokeWidth="1.6" />
      <line x1="14" y1="2" x2="14" y2="34" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <line x1="14" y1="12" x2="8"  y2="18" stroke="#4A3728" strokeWidth="1"   strokeLinecap="round" opacity="0.3" />
      <line x1="14" y1="18" x2="20" y2="24" stroke="#4A3728" strokeWidth="1"   strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function Film({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <circle cx="20" cy="20" r="7"  fill="white" fillOpacity="0.7" stroke="#4A3728" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="2.5" fill="#4A3728" fillOpacity="0.35" />
      <rect x="2"  y="6"  width="5" height="9" rx="2" fill="white" fillOpacity="0.8" stroke="#4A3728" strokeWidth="1.2" />
      <rect x="33" y="6"  width="5" height="9" rx="2" fill="white" fillOpacity="0.8" stroke="#4A3728" strokeWidth="1.2" />
      <rect x="2"  y="25" width="5" height="9" rx="2" fill="white" fillOpacity="0.8" stroke="#4A3728" strokeWidth="1.2" />
      <rect x="33" y="25" width="5" height="9" rx="2" fill="white" fillOpacity="0.8" stroke="#4A3728" strokeWidth="1.2" />
    </svg>
  );
}

function Lollipop({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 44" fill="none">
      <circle cx="14" cy="13" r="12" fill={color} stroke="#4A3728" strokeWidth="1.8" />
      <path d="M14,5 C8,5 4,9 4,13" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="14" y1="25" x2="14" y2="44" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MusicNote({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 36" fill="none">
      <path d="M10,28 C10,31 6,33 4,31 C2,29 4,25 8,26 C9,26 10,27 10,28Z"
        fill={color} stroke="#4A3728" strokeWidth="1.5" />
      <line x1="10" y1="28" x2="10" y2="6" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="6"  x2="24" y2="3" stroke="#4A3728" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="3"  x2="24" y2="20" stroke="#4A3728" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24,26 C24,29 20,31 18,29 C16,27 18,23 22,24 C23,24 24,25 24,26Z"
        fill={color} stroke="#4A3728" strokeWidth="1.5" />
    </svg>
  );
}

function Diamond({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 30" fill="none">
      <polygon points="16,2 30,12 16,28 2,12" fill={color} stroke="#4A3728" strokeWidth="1.7" strokeLinejoin="round" />
      <polygon points="16,2 30,12 16,14 2,12" fill="white" fillOpacity="0.25" />
      <line x1="2" y1="12" x2="30" y2="12" stroke="#4A3728" strokeWidth="1.2" strokeOpacity="0.3" />
    </svg>
  );
}

function renderIcon(icon: Doodle["icon"], size: number, color: string) {
  switch (icon) {
    case "heart":       return <Heart size={size} color={color} />;
    case "star":        return <Star size={size} color={color} />;
    case "paw":         return <Paw size={size} color={color} />;
    case "sparkle":     return <Sparkle size={size} color={color} />;
    case "circle-dot":  return <CircleDot size={size} color={color} />;
    case "cross-star":  return <CrossStar size={size} color={color} />;
    case "flower":      return <Flower size={size} color={color} />;
    case "cloud":       return <Cloud size={size} color={color} />;
    case "camera":      return <Camera size={size} color={color} />;
    case "speech":      return <Speech size={size} color={color} />;
    case "ribbon":      return <Ribbon size={size} color={color} />;
    case "balloon":     return <Balloon size={size} color={color} />;
    case "rocket":      return <Rocket size={size} color={color} />;
    case "moon":        return <Moon size={size} color={color} />;
    case "comet":       return <Comet size={size} color={color} />;
    case "polaroid":    return <Polaroid size={size} color={color} />;
    case "butterfly":   return <Butterfly size={size} color={color} />;
    case "leaf":        return <Leaf size={size} color={color} />;
    case "film":        return <Film size={size} color={color} />;
    case "lollipop":    return <Lollipop size={size} color={color} />;
    case "music-note":  return <MusicNote size={size} color={color} />;
    case "diamond":     return <Diamond size={size} color={color} />;
    default:            return null;
  }
}

function DoodleLayer({ doodles }: { doodles: Doodle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {doodles.map((d, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: d.x,
            top: d.y,
            opacity: d.opacity ?? 0.28,
            transform: `rotate(${d.rotate ?? 0}deg)`,
          }}
        >
          {renderIcon(d.icon, d.size, d.color)}
        </div>
      ))}
    </div>
  );
}

// ─── Per-page doodle configs ───────────────────────────────────────────────────

const HOME_DOODLES: Doodle[] = [
  { x: "2%",   y: "10%", icon: "heart",      size: 32, color: "#FF8A5B", rotate: -15, opacity: 0.25 },
  { x: "88%",  y: "8%",  icon: "star",       size: 28, color: "#FFD54F", rotate: 20,  opacity: 0.28 },
  { x: "5%",   y: "32%", icon: "sparkle",    size: 24, color: "#F4A261", rotate: 10,  opacity: 0.22 },
  { x: "92%",  y: "25%", icon: "circle-dot", size: 20, color: "#A8DADC", rotate: 0,   opacity: 0.30 },
  { x: "1%",   y: "55%", icon: "paw",        size: 36, color: "#F4C2C2", rotate: -20, opacity: 0.22 },
  { x: "90%",  y: "48%", icon: "heart",      size: 22, color: "#F4C2C2", rotate: 15,  opacity: 0.30 },
  { x: "6%",   y: "75%", icon: "cross-star", size: 20, color: "#FFD54F", rotate: 30,  opacity: 0.25 },
  { x: "86%",  y: "70%", icon: "flower",     size: 34, color: "#F4C2C2", rotate: -10, opacity: 0.22 },
  { x: "3%",   y: "90%", icon: "sparkle",    size: 18, color: "#A8DADC", rotate: -5,  opacity: 0.28 },
  { x: "93%",  y: "88%", icon: "paw",        size: 28, color: "#F4A261", rotate: 25,  opacity: 0.22 },
  { x: "18%",  y: "5%",  icon: "circle-dot", size: 14, color: "#F4C2C2", rotate: 0,   opacity: 0.22 },
  { x: "72%",  y: "4%",  icon: "heart",      size: 18, color: "#FFD54F", rotate: 10,  opacity: 0.22 },
  { x: "46%",  y: "3%",  icon: "cross-star", size: 16, color: "#F4A261", rotate: 20,  opacity: 0.20 },
  { x: "55%",  y: "92%", icon: "star",       size: 20, color: "#FF8A5B", rotate: -15, opacity: 0.22 },
  { x: "30%",  y: "95%", icon: "sparkle",    size: 16, color: "#F4C2C2", rotate: 5,   opacity: 0.20 },
];

const DAILY_DOODLES: Doodle[] = [
  { x: "2%",   y: "8%",  icon: "camera",     size: 38, color: "#F4A261", rotate: -12, opacity: 0.25 },
  { x: "89%",  y: "6%",  icon: "heart",      size: 26, color: "#F4C2C2", rotate: 15,  opacity: 0.28 },
  { x: "4%",   y: "30%", icon: "paw",        size: 32, color: "#F4C2C2", rotate: 8,   opacity: 0.22 },
  { x: "91%",  y: "28%", icon: "speech",     size: 40, color: "#A8DADC", rotate: -8,  opacity: 0.22 },
  { x: "1%",   y: "52%", icon: "sparkle",    size: 22, color: "#FFD54F", rotate: 20,  opacity: 0.25 },
  { x: "88%",  y: "50%", icon: "music-note", size: 28, color: "#F4A261", rotate: 10,  opacity: 0.25 },
  { x: "5%",   y: "72%", icon: "star",       size: 24, color: "#FFD54F", rotate: -18, opacity: 0.25 },
  { x: "92%",  y: "68%", icon: "flower",     size: 32, color: "#F4C2C2", rotate: 5,   opacity: 0.22 },
  { x: "2%",   y: "88%", icon: "circle-dot", size: 18, color: "#A8DADC", rotate: 0,   opacity: 0.28 },
  { x: "90%",  y: "86%", icon: "camera",     size: 30, color: "#F4C2C2", rotate: 20,  opacity: 0.20 },
  { x: "20%",  y: "4%",  icon: "heart",      size: 16, color: "#FF8A5B", rotate: -10, opacity: 0.22 },
  { x: "68%",  y: "3%",  icon: "paw",        size: 24, color: "#F4A261", rotate: 12,  opacity: 0.20 },
  { x: "44%",  y: "95%", icon: "sparkle",    size: 18, color: "#FFD54F", rotate: 5,   opacity: 0.22 },
  { x: "76%",  y: "93%", icon: "cross-star", size: 16, color: "#F4C2C2", rotate: -20, opacity: 0.20 },
  { x: "50%",  y: "2%",  icon: "circle-dot", size: 14, color: "#A8DADC", rotate: 0,   opacity: 0.22 },
];

const ANNIVERSARY_DOODLES: Doodle[] = [
  { x: "2%",   y: "7%",  icon: "ribbon",     size: 36, color: "#F4C2C2", rotate: -10, opacity: 0.25 },
  { x: "88%",  y: "5%",  icon: "balloon",    size: 30, color: "#FFB6C1", rotate: 8,   opacity: 0.25 },
  { x: "4%",   y: "28%", icon: "heart",      size: 30, color: "#FF8A5B", rotate: -15, opacity: 0.25 },
  { x: "90%",  y: "26%", icon: "sparkle",    size: 24, color: "#FFD54F", rotate: 18,  opacity: 0.28 },
  { x: "1%",   y: "50%", icon: "star",       size: 28, color: "#FFD54F", rotate: 22,  opacity: 0.25 },
  { x: "91%",  y: "48%", icon: "diamond",    size: 26, color: "#A8DADC", rotate: 10,  opacity: 0.25 },
  { x: "3%",   y: "70%", icon: "balloon",    size: 34, color: "#A8DADC", rotate: -5,  opacity: 0.22 },
  { x: "89%",  y: "68%", icon: "ribbon",     size: 28, color: "#FFD54F", rotate: 15,  opacity: 0.22 },
  { x: "2%",   y: "88%", icon: "cross-star", size: 20, color: "#F4A261", rotate: 30,  opacity: 0.25 },
  { x: "92%",  y: "86%", icon: "flower",     size: 30, color: "#F4C2C2", rotate: -8,  opacity: 0.22 },
  { x: "22%",  y: "3%",  icon: "heart",      size: 18, color: "#F4C2C2", rotate: 5,   opacity: 0.22 },
  { x: "70%",  y: "4%",  icon: "sparkle",    size: 18, color: "#FF8A5B", rotate: -12, opacity: 0.22 },
  { x: "45%",  y: "94%", icon: "diamond",    size: 20, color: "#FFD54F", rotate: 20,  opacity: 0.20 },
  { x: "78%",  y: "92%", icon: "star",       size: 16, color: "#A8DADC", rotate: -8,  opacity: 0.22 },
  { x: "48%",  y: "2%",  icon: "circle-dot", size: 14, color: "#F4C2C2", rotate: 0,   opacity: 0.22 },
];

const WISHES_DOODLES: Doodle[] = [
  { x: "2%",   y: "6%",  icon: "rocket",     size: 38, color: "#FF8A5B", rotate: 20,  opacity: 0.22 },
  { x: "88%",  y: "5%",  icon: "star",       size: 30, color: "#FFD54F", rotate: -12, opacity: 0.28 },
  { x: "4%",   y: "28%", icon: "moon",       size: 30, color: "#FFD54F", rotate: -20, opacity: 0.25 },
  { x: "91%",  y: "26%", icon: "comet",      size: 36, color: "#F4A261", rotate: 30,  opacity: 0.22 },
  { x: "1%",   y: "50%", icon: "cloud",      size: 40, color: "#A8DADC", rotate: 0,   opacity: 0.22 },
  { x: "89%",  y: "48%", icon: "sparkle",    size: 22, color: "#FFD54F", rotate: 15,  opacity: 0.28 },
  { x: "3%",   y: "70%", icon: "star",       size: 24, color: "#F4C2C2", rotate: 10,  opacity: 0.25 },
  { x: "90%",  y: "68%", icon: "heart",      size: 26, color: "#FF8A5B", rotate: -15, opacity: 0.25 },
  { x: "2%",   y: "88%", icon: "lollipop",   size: 30, color: "#F4C2C2", rotate: -10, opacity: 0.22 },
  { x: "92%",  y: "86%", icon: "cross-star", size: 22, color: "#FFD54F", rotate: 25,  opacity: 0.25 },
  { x: "20%",  y: "3%",  icon: "circle-dot", size: 14, color: "#A8DADC", rotate: 0,   opacity: 0.22 },
  { x: "68%",  y: "4%",  icon: "moon",       size: 22, color: "#F4C2C2", rotate: 10,  opacity: 0.22 },
  { x: "44%",  y: "93%", icon: "rocket",     size: 28, color: "#FF8A5B", rotate: 15,  opacity: 0.20 },
  { x: "76%",  y: "91%", icon: "sparkle",    size: 16, color: "#F4A261", rotate: -5,  opacity: 0.22 },
  { x: "50%",  y: "2%",  icon: "star",       size: 18, color: "#FFD54F", rotate: 20,  opacity: 0.22 },
];

const MEMORIES_DOODLES: Doodle[] = [
  { x: "2%",   y: "7%",  icon: "polaroid",   size: 36, color: "#FFE6F0", rotate: -12, opacity: 0.30 },
  { x: "88%",  y: "5%",  icon: "film",       size: 36, color: "#FFF9C4", rotate: 15,  opacity: 0.25 },
  { x: "4%",   y: "28%", icon: "flower",     size: 34, color: "#F4C2C2", rotate: 8,   opacity: 0.25 },
  { x: "91%",  y: "26%", icon: "butterfly",  size: 36, color: "#F4C2C2", rotate: -5,  opacity: 0.25 },
  { x: "1%",   y: "50%", icon: "heart",      size: 28, color: "#FF8A5B", rotate: -18, opacity: 0.25 },
  { x: "90%",  y: "48%", icon: "leaf",       size: 30, color: "#A5D6A7", rotate: 20,  opacity: 0.28 },
  { x: "3%",   y: "70%", icon: "music-note", size: 28, color: "#F4A261", rotate: 10,  opacity: 0.25 },
  { x: "89%",  y: "68%", icon: "polaroid",   size: 30, color: "#FFE6F0", rotate: -8,  opacity: 0.25 },
  { x: "2%",   y: "88%", icon: "butterfly",  size: 32, color: "#A8DADC", rotate: 5,   opacity: 0.22 },
  { x: "92%",  y: "86%", icon: "film",       size: 28, color: "#F4C2C2", rotate: 12,  opacity: 0.22 },
  { x: "22%",  y: "3%",  icon: "heart",      size: 16, color: "#F4C2C2", rotate: -8,  opacity: 0.22 },
  { x: "70%",  y: "4%",  icon: "sparkle",    size: 18, color: "#FFD54F", rotate: 15,  opacity: 0.22 },
  { x: "44%",  y: "94%", icon: "flower",     size: 24, color: "#FF8A5B", rotate: -10, opacity: 0.20 },
  { x: "78%",  y: "92%", icon: "leaf",       size: 22, color: "#A5D6A7", rotate: 30,  opacity: 0.22 },
  { x: "48%",  y: "2%",  icon: "circle-dot", size: 14, color: "#A8DADC", rotate: 0,   opacity: 0.22 },
];

export function PageDecorations() {
  const location = useLocation();
  const path = location.pathname;

  let doodles: Doodle[];
  if      (path === "/daily")       doodles = DAILY_DOODLES;
  else if (path === "/anniversary") doodles = ANNIVERSARY_DOODLES;
  else if (path === "/wishes")      doodles = WISHES_DOODLES;
  else if (path === "/memories")    doodles = MEMORIES_DOODLES;
  else                              doodles = HOME_DOODLES;

  return <DoodleLayer doodles={doodles} />;
}
