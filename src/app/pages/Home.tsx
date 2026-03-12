import { Camera, Gift, Heart, Calendar, Star, Clock, Edit2, X, Check, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import dogHeart from "../../assets/23f7802cc558024af925d42d5d80ec5a5970de84.png";
import dogPicnic from "../../assets/c656db48b318fa361eda00dcadf756021e89f2b9.png";
import dogPhoto from "../../assets/ba1c71918f036c1de2c94bcc180ec878a5eeb252.png";
import dogPlane from "../../assets/b1c707f290d49b178d8e73b1fde1a19cffed70d3.png";
import dogWalk from "../../assets/b1f2c0b8c54ec36a46d8f4c4ca505c04886fb659.png";
import dogNight from "../../assets/090b153aa64984de67654c19ebdfab1eff06ffcd.png";
import sceneryImg from "../../assets/8e15011c8641acf499cd0834219dccf286565bb6.png";
import scooterImg from "../../assets/00405c95656197ce93ce31fd00f70e7e81acffbe.png";
import ctaImg from "../../assets/xiaogou_xiezi.jpg";
import avatarZhang from "../../assets/8df6557d8aaf5727d6487be620c9c969138f0c4d.png";
import avatarBao from "../../assets/d036288232f16826f2b90f31903f5a86b0a77e38.png";

// 计算两个日期之间的天数（纪念日倒计时）
function calcDays(start: Date, end: Date) {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

// 格式化显示用日期
function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${m}月${d}日`;
}

export default function Home() {
  const today = new Date();
  const [startDateStr, setStartDateStr] = useState("2025-03-24");
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(startDateStr);
  const [displayDays, setDisplayDays] = useState(0);
  const [dogHover, setDogHover] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const targetDays = calcDays(new Date(startDateStr), today);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 数字滚动动画
  useEffect(() => {
    let start = 0;
    const end = targetDays;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayDays(end);
        clearInterval(animRef.current!);
      } else {
        setDisplayDays(start);
      }
    }, 16);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [targetDays]);

  // 心跳动画触发
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBeat(true);
      setTimeout(() => setHeartBeat(false), 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveDate = () => {
    setStartDateStr(tempDate);
    setEditingDate(false);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 2000);
  };

  const handleCancelEdit = () => {
    setTempDate(startDateStr);
    setEditingDate(false);
  };

  const daysToAnniversary = calcDays(today, new Date("2026-03-24"));

  return (
    <div className="space-y-12">

      {/* 1. 主视觉区域 (Hero Section) */}
      <div className="p-4 sm:p-10 relative overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FFF0E6 50%, #FFF8F0 100%)" }}>

        {/* 背景装饰小星星 */}
        <div className="absolute top-4 left-8 text-2xl opacity-30" style={{ animation: "spin-slow 8s linear infinite" }}>✦</div>
        <div className="absolute bottom-6 right-10 text-xl opacity-20" style={{ animation: "spin-slow 6s linear infinite reverse" }}>✦</div>
        <div className="absolute top-8 right-1/4 text-base opacity-20" style={{ animation: "spin-slow 10s linear infinite" }}>✦</div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2 relative">
          
          {/* 绝对定位的心电图连线，横跨两侧，不覆盖中间文字 */}
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none" style={{ zIndex: 0, top: "25%" }}>
            {/* 左半边心电图 */}
            <svg width="35%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none" className="ml-10 hidden sm:block">
              <path d="M0,30 L100,30 L120,5 L140,55 L160,20 L180,30 L200,30" fill="none" stroke="#F4C2C2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* 右半边心电图 */}
            <svg width="35%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none" className="mr-10 hidden sm:block">
              <path d="M0,30 L20,30 L40,15 L60,45 L80,10 L100,30 L200,30" fill="none" stroke="#F4C2C2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* ── 左侧头像：Zhang ── */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0 relative z-10 order-2 sm:order-1">
            <div
              className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
              style={{
                borderRadius: "50%",
                border: "4px solid #4A3728",
                boxShadow: "4px 4px 0 #4A3728",
                overflow: "hidden",
                background: "#FFF8F0",
              }}
            >
              <img src={avatarZhang} alt="Zhang" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg sm:text-xl font-bold" style={{ color: "#8B6F47" }}>Zhang</span>
          </div>

          {/* ── 中间：天数 + 信息 ── */}
          <div className="flex flex-col items-center gap-3 sm:gap-5 flex-1 min-w-0 relative z-10 bg-transparent px-2 sm:px-4 mt-4 sm:mt-8 order-1 sm:order-2" style={{ transform: "scale(1)" }}>
            <p className="text-lg sm:text-xl" style={{ color: "#B0A090", fontWeight: "600" }}>我们已相爱</p>

            {/* 核心大数字 */}
            <div className="flex items-baseline gap-2">
              <span
                className="leading-none"
                style={{
                  fontSize: "clamp(3rem, 10vw, 6rem)",
                  color: "#F4A261",
                  fontWeight: "700",
                  textShadow: "4px 4px 0 rgba(244,162,97,0.18)",
                  display: "inline-block",
                  transition: "transform 0.2s",
                }}
              >
                {displayDays}
              </span>
              <span className="text-3xl sm:text-5xl" style={{ color: "#B0A090", fontWeight: "600" }}>天</span>
            </div>

            {/* 大爱心 */}
            <Heart
              className="w-8 h-8 sm:w-10 sm:h-10"
              fill="#F4C2C2"
              style={{
                color: "#F4C2C2",
                transform: heartBeat ? "scale(1.4)" : "scale(1)",
                transition: "transform 0.2s ease",
                filter: "drop-shadow(0 2px 4px rgba(244,194,194,0.5))",
              }}
            />

            {/* 起始日期 */}
            <div className="flex items-center gap-2 mt-2" style={{ color: "#B0A090" }}>
              <span className="text-sm sm:text-base font-medium">从 {formatDisplayDate(startDateStr)} 开始</span>
              {/* 手绘风格铅笔图标按钮 - 无圆圈 */}
              <button
                className="p-1 transition-all hover:opacity-70"
                onClick={() => { setTempDate(startDateStr); setEditingDate(true); }}
                title="修改恋爱开始日期"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B0A090"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sketch-pencil"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" strokeDasharray="3,2" />
                  <path d="M14.37 3.63l3.75 3.75 2.63-2.63a1.5 1.5 0 0 0-2.12-2.12l-2.63 2.63z" strokeDasharray="2,3" />
                </svg>
              </button>
            </div>

            {/* sparkle 提示 */}
            {showSparkle && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm absolute -bottom-12"
                style={{
                  background: "#FFF0E0",
                  border: "2px solid #F4A261",
                  color: "#5D4037",
                  animation: "fade-in-out 2s ease",
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#F4A261" }} />
                纪念日已更新 ✨
              </div>
            )}
          </div>

          {/* ── 右侧头像：Bao ── */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0 relative z-10 order-3">
            <div
              className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
              style={{
                borderRadius: "50%",
                border: "4px solid #4A3728",
                boxShadow: "4px 4px 0 #4A3728",
                overflow: "hidden",
                background: "#FFF8F0",
              }}
            >
              <img src={avatarBao} alt="Bao" className="w-full h-full object-cover" />
            </div>
            <span className="text-base sm:text-lg font-bold" style={{ color: "#8B6F47" }}>Bao</span>
          </div>

        </div>
      </div>

      {/* 编辑日期弹窗 */}
      {editingDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(74,55,40,0.35)", backdropFilter: "blur(4px)" }}
          onClick={handleCancelEdit}
        >
          <div
            className="sketch-border p-8 flex flex-col gap-6 w-80"
            style={{ background: "#FFF8F0", maxWidth: "90vw" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl" style={{ color: "#5D4037", fontWeight: "600" }}>
                💑 修改恋爱纪念日
              </h3>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ border: "2px solid #4A3728" }}
                onClick={handleCancelEdit}
                onMouseEnter={e => (e.currentTarget.style.background = "#FCF0F0")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <X className="w-4 h-4" style={{ color: "#5D4037" }} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm" style={{ color: "#999" }}>选择开始恋爱的日期</label>
              <input
                type="date"
                value={tempDate}
                max={formatDate(today)}
                onChange={e => setTempDate(e.target.value)}
                className="px-4 py-2 rounded-2xl outline-none text-center"
                style={{
                  border: "3px solid #4A3728",
                  color: "#5D4037",
                  background: "white",
                  fontFamily: "var(--font-body, 'Ma Shan Zheng', cursive)",
                  fontSize: "1rem",
                }}
              />
            </div>

            {tempDate && (
              <div className="text-center text-sm" style={{ color: "#F4A261" }}>
                🐾 将计算为相爱 {calcDays(new Date(tempDate), today)} 天
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="sketch-button flex-1 py-2 flex items-center justify-center gap-2"
                style={{ background: "white", color: "#5D4037" }}
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4" /> 取消
              </button>
              <button
                className="sketch-button flex-1 py-2 flex items-center justify-center gap-2"
                style={{ background: "#F4A261", color: "white" }}
                onClick={handleSaveDate}
              >
                <Check className="w-4 h-4" /> 确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 即将到来的纪念日 (Upcoming Events) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-7 h-7" style={{ color: "#F4A261" }} />
          <h2 className="text-2xl" style={{ color: "#5D4037", fontWeight: "600" }}>即将到来的纪念日</h2>
        </div>

        <Link
          to="/anniversary"
          className="sketch-card p-6 flex items-center gap-6 group cursor-pointer"
          style={{ background: "white" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center circle-icon transition-transform"
            style={{ background: "#F4A261" }}
          >
            <Gift className="w-10 h-10 text-white transition-transform group-hover:scale-110" />
          </div>
          <div className="flex-1">
            <div className="text-xl sm:text-2xl mb-1" style={{ color: "#5D4037", fontWeight: "600" }}>一周年 <span className="hidden sm:inline">🎉</span></div>
            <div className="text-base" style={{ color: "#999" }}>还有 {daysToAnniversary} 天</div>
          </div>
          {/* 进度条 */}
          <div className="w-32">
            <div className="text-xs mb-1 text-right" style={{ color: "#999" }}>倒计时进度</div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: "#F4C2C2", border: "2px solid #4A3728" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  background: "#F4A261",
                  width: `${Math.max(5, Math.min(100, ((365 - daysToAnniversary) / 365) * 100))}%`,
                }}
              />
            </div>
          </div>
        </Link>
      </div>

      {/* 4. 快速入口 (Quick Access) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-7 h-7" style={{ color: "#F4A261" }} fill="#F4A261" />
          <h2 className="text-2xl" style={{ color: "#5D4037", fontWeight: "600" }}>快速入口</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {/* 日常记录 */}
          <Link
            to="/daily"
            className="sketch-card p-6 flex flex-col items-center gap-4"
            style={{ background: "white" }}
          >
            {/* 圆形填满图片 */}
            <div
              className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden"
              style={{ border: "3px solid #4A3728" }}
            >
              <img
                src={dogPhoto}
                alt="日常记录"
                className="w-full h-full"
                style={{ objectFit: "cover", objectPosition: "center", transform: "scale(1.15)" }}
              />
            </div>
            <div className="text-xl text-center" style={{ color: "#5D4037", fontWeight: "600" }}>日常记录</div>
            <div className="text-sm text-center" style={{ color: "#999" }}>记录美好瞬间</div>
          </Link>

          {/* 纪念日 */}
          <Link
            to="/anniversary"
            className="sketch-card p-6 flex flex-col items-center gap-4"
            style={{ background: "white" }}
          >
            <div
              className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden"
              style={{ border: "3px solid #4A3728" }}
            >
              <img
                src={dogWalk}
                alt="纪念日"
                className="w-full h-full"
                style={{ objectFit: "cover", objectPosition: "center", transform: "scale(1.1)" }}
              />
            </div>
            <div className="text-xl text-center" style={{ color: "#5D4037", fontWeight: "600" }}>纪念日</div>
            <div className="text-sm text-center" style={{ color: "#999" }}>重要的日子</div>
          </Link>

          {/* 心愿清单 */}
          <Link
            to="/wishes"
            className="sketch-card p-6 flex flex-col items-center gap-4"
            style={{ background: "white" }}
          >
            <div
              className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden"
              style={{ border: "3px solid #4A3728" }}
            >
              <img
                src={dogPlane}
                alt="心愿清单"
                className="w-full h-full"
                style={{ objectFit: "cover", objectPosition: "center", transform: "scale(1.1)" }}
              />
            </div>
            <div className="text-xl text-center" style={{ color: "#5D4037", fontWeight: "600" }}>心愿清单</div>
            <div className="text-sm text-center" style={{ color: "#999" }}>未来的计划</div>
          </Link>

          {/* 回忆库 */}
          <Link
            to="/memories"
            className="sketch-card p-6 flex flex-col items-center gap-4"
            style={{ background: "white" }}
          >
            <div
              className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden"
              style={{ border: "3px solid #4A3728" }}
            >
              <img
                src={dogNight}
                alt="回忆库"
                className="w-full h-full"
                style={{ objectFit: "cover", objectPosition: "center", transform: "scale(1.1)" }}
              />
            </div>
            <div className="text-xl text-center" style={{ color: "#5D4037", fontWeight: "600" }}>回忆库</div>
            <div className="text-sm text-center" style={{ color: "#999" }}>珍藏的时光</div>
          </Link>
        </div>
      </div>

      {/* 5. 回忆展示画廊 (Memory Gallery) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* 画廊卡片1 - 田野风景图 */}
        <div
          className="sketch-card overflow-hidden group cursor-pointer"
          style={{ background: "white" }}
          onClick={() => {}}
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={sceneryImg}
              alt="田野散步"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-6">
            <p className="text-lg text-center leading-relaxed" style={{ color: "#5D4037" }}>
              "和你一起看过的风景，都是最美的画面"
            </p>
          </div>
        </div>

        {/* 画廊卡片2 - 摩托车骑行图 */}
        <div
          className="sketch-card overflow-hidden group cursor-pointer"
          style={{ background: "white" }}
          onClick={() => {}}
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={scooterImg}
              alt="骑车出行"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-6">
            <p className="text-lg text-center leading-relaxed" style={{ color: "#5D4037" }}>
              "只要有你在身边，每一天都是好天气"
            </p>
          </div>
        </div>
      </div>

      {/* 6. CTA行动召唤区域 */}
      <div className="sketch-border overflow-hidden" style={{ background: "white" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* 左侧大图 - PC端像照片贴在卡片上，移动端在上半部分 */}
          <div className="p-4 md:p-6 flex items-center justify-center bg-[#FFF8F0]">
            {/* PC端版本 - 带晃动动画 */}
            <div 
              className="relative group cursor-pointer cta-image-sway hidden md:block"
              style={{
                boxShadow: "4px 4px 0 #4A3728",
                border: "3px solid #4A3728",
                marginLeft: "20px",
              }}
            >
              <img
                src={ctaImg}
                alt="野餐场景"
                className="w-full h-auto object-cover block"
                style={{ maxHeight: "300px", display: "block" }}
              />
            </div>
            {/* 移动端版本 - 带晃动动画 */}
            <div 
              className="relative group cursor-pointer cta-image-sway md:hidden"
              style={{
                boxShadow: "4px 4px 0 #4A3728",
                border: "3px solid #4A3728",
              }}
            >
              <img
                src={ctaImg}
                alt="野餐场景"
                className="w-full h-auto object-cover block"
                style={{ maxHeight: "150px", display: "block" }}
              />
            </div>
          </div>

          {/* 右侧文案 */}
          <div className="flex flex-col justify-center items-center p-6 md:p-12 gap-4 md:gap-6" style={{ background: "#FFF8F0" }}>
            <h2
              className="text-2xl md:text-4xl text-center leading-relaxed"
              style={{ color: "#5D4037", fontWeight: "600" }}
            >
              继续创造<br className="hidden md:inline" /><span className="md:hidden"> </span>属于我们的故事
            </h2>
            <p
              className="text-base md:text-lg text-center leading-relaxed"
              style={{ color: "#999" }}
            >
              每一天都是新的开始<br />每一刻都值得被记录
            </p>
            <Link
              to="/daily"
              className="sketch-button px-8 py-3 md:px-10 md:py-4 flex items-center gap-3 mt-2 md:mt-4"
              style={{
                background: "#F4A261",
                color: "white",
                boxShadow: "0 4px 8px rgba(244, 162, 97, 0.3)",
              }}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xl">去记录</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-up {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -60px); }
        }
        @keyframes fade-in-out {
          0% { opacity: 0; transform: scale(0.9); }
          15% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .cta-image-sway {
          animation: sway 3s ease-in-out infinite;
        }
        .sketch-pencil path {
          stroke-dasharray: 3, 2;
        }
      `}</style>
    </div>
  );
}