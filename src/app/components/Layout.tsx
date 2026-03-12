import { Outlet, Link, useLocation } from "react-router";
import { Home, Camera, Calendar, Star, Heart } from "lucide-react";
import { SiteFooter } from "./SiteFooter";
import { PageDecorations } from "./PageDecorations";
import { useState, useEffect, useRef } from "react";

type UserRole = "B" | "Z";

export default function Layout() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>("B");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 读取角色
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole;
    if (savedRole && (savedRole === "B" || savedRole === "Z")) {
      setUserRole(savedRole);
    }
  }, []);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 切换角色
  const switchRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
    setShowRoleDropdown(false);
  };

  const navItems = [
    { path: "/",            label: "首页",  icon: Home     },
    { path: "/daily",       label: "日常",  icon: Camera   },
    { path: "/anniversary", label: "纪念日", icon: Calendar },
    { path: "/wishes",      label: "心愿",  icon: Star     },
    { path: "/memories",    label: "回忆",  icon: Heart    },
  ];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 py-4 px-4" style={{ background: "#FFF8F0", borderBottom: "3px solid #4A3728" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center circle-icon"
              style={{ background: "#F4C2C2" }}
            >
              <Heart className="w-6 h-6" style={{ color: "#5D4037" }} fill="#5D4037" />
            </div>
            <span className="text-3xl hidden md:inline" style={{ color: "#5D4037", fontWeight: "700", fontFamily: "var(--font-title, 'ZCOOL KuaiLe', cursive)" }}>Bao & Zhang</span>
          </Link>

          {/* 导航按钮 */}
          <nav className="flex items-center gap-2 md:gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`pill-button flex items-center justify-center rounded-${isMobile ? 'full' : 'lg'}`}
                  style={{
                    background: isActive ? "#F4A261" : "white",
                    color:      isActive ? "white"   : "#5D4037",
                    border: "2px solid #4A3728",
                    boxShadow: isActive ? "2px 2px 0 #4A3728" : "none",
                    width: isMobile ? "36px" : "auto",
                    height: isMobile ? "36px" : "auto",
                    padding: isMobile ? "6px" : "6px 12px",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {!isMobile && <span className="text-base ml-1">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* 右侧头像 */}
          <div className="flex items-center justify-end relative" ref={dropdownRef}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="w-10 h-10 flex items-center justify-center circle-icon transition-transform hover:scale-110"
              style={{ background: userRole === "B" ? "#F4A261" : "#F4C2C2" }}
              title="点击切换身份"
            >
              <span className="text-white text-sm" style={{ fontWeight: "600" }}>{userRole}</span>
            </button>

            {/* 角色切换下拉框 */}
            {showRoleDropdown && (
              <div
                className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "white",
                  border: "2px solid #4A3728",
                  boxShadow: "3px 3px 0 #4A3728",
                  minWidth: "80px",
                }}
              >
                <button
                  onClick={() => switchRole("B")}
                  className="w-full px-4 py-2 text-sm text-left transition-colors hover:bg-[#FFF8F0] flex items-center gap-2"
                  style={{ color: userRole === "B" ? "#F4A261" : "#5D4037", fontWeight: userRole === "B" ? "600" : "400" }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ background: "#F4A261" }}>B</span>
                  Bao
                </button>
                <button
                  onClick={() => switchRole("Z")}
                  className="w-full px-4 py-2 text-sm text-left transition-colors hover:bg-[#FFF8F0] flex items-center gap-2"
                  style={{ color: userRole === "Z" ? "#F4A261" : "#5D4037", fontWeight: userRole === "Z" ? "600" : "400" }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ background: "#F4C2C2" }}>Z</span>
                  Zhang
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 侧边手绘装饰（各页不同）*/}
      <PageDecorations />

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
        {/* 统一页脚 */}
        <SiteFooter />
      </main>
    </div>
  );
}
