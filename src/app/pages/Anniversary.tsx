import { useState, useEffect } from "react";
import {
  Calendar, Plus, Gift, Heart, Cake, Clock, ChevronRight,
  X, RefreshCw, Star, Coffee, Music, Camera, Smile, Sun,
  Edit2, Trash2, AlertTriangle, Check,
} from "lucide-react";
import { anniversariesService, Anniversary as AnniversaryType } from "../../lib/services";

// ─── Types ────────────────────────────────────────────────────────────────────

type RepeatMode = false | "monthly" | "yearly";
type IconKey = "heart" | "cake" | "gift" | "calendar" | "star" | "coffee" | "music" | "camera" | "smile" | "sun";

interface AnniversaryItem {
  id: number | string;
  title: string;
  rawDate: string;       // "YYYY-MM-DD" (original date, for repeat calc)
  dateDisplay: string;   // displayed date (may be advanced if repeat)
  daysLeft: number;      // computed (may be advanced)
  iconKey: IconKey;
  color: string;
  description: string;
  isPast: boolean;
  repeat: RepeatMode;
  supabaseId?: string;  // 保存原始 Supabase ID
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<IconKey, React.ElementType> = {
  heart: Heart, cake: Cake, gift: Gift, calendar: Calendar,
  star: Star, coffee: Coffee, music: Music, camera: Camera,
  smile: Smile, sun: Sun,
};

const ICON_OPTIONS: { key: IconKey; label: string }[] = [
  { key: "heart",    label: "爱心" },
  { key: "cake",     label: "蛋糕" },
  { key: "gift",     label: "礼物" },
  { key: "calendar", label: "日历" },
  { key: "star",     label: "星星" },
  { key: "coffee",   label: "咖啡" },
  { key: "music",    label: "音乐" },
  { key: "camera",   label: "相机" },
  { key: "smile",    label: "笑脸" },
  { key: "sun",      label: "太阳" },
];

// ─── Color Palette ────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  "#FF8A5B", // 暖橙
  "#F4A261", // 橙黄
  "#FFD54F", // 亮黄
  "#FFB6C1", // 浅粉
  "#F4C2C2", // 粉红
  "#CE93D8", // 薰衣草
  "#A8D8EA", // 天蓝
  "#A8DADC", // 薄荷
  "#80CBC4", // 青绿
  "#A5D6A7", // 嫩绿
];

// ─── Tab Options ──────────────────────────────────────────────────────────────

const TAB_OPTIONS = [
  { key: "all",      label: "全部" },
  { key: "upcoming", label: "即将到来" },
  { key: "past",     label: "已过去" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date();

function calcDaysLeft(rawDate: string): number {
  const t = new Date(rawDate);
  return Math.ceil((t.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

function toDisplay(raw: string): string {
  const [y, m, d] = raw.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** Given repeat mode, advance rawDate until daysLeft >= 0 */
function resolveDate(rawDate: string, repeat: RepeatMode): { date: string; daysLeft: number } {
  if (!repeat) {
    return { date: rawDate, daysLeft: calcDaysLeft(rawDate) };
  }
  let [y, m, d] = rawDate.split("-").map(Number);
  let dl = calcDaysLeft(rawDate);
  let safety = 0;
  while (dl < 0 && safety < 200) {
    if (repeat === "yearly")  y += 1;
    if (repeat === "monthly") { m += 1; if (m > 12) { m = 1; y += 1; } }
    const next = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dl = calcDaysLeft(next);
    rawDate = next;
    safety++;
  }
  return { date: rawDate, daysLeft: dl };
}

function buildItem(
  fields: {
    title: string; rawDate: string; iconKey: IconKey; color: string;
    description: string; repeat: RepeatMode;
  },
  id: number | string
): AnniversaryItem {
  const { date, daysLeft } = resolveDate(fields.rawDate, fields.repeat);
  return {
    id,
    title: fields.title,
    rawDate: fields.rawDate,
    dateDisplay: toDisplay(date),
    daysLeft,
    iconKey: fields.iconKey,
    color: fields.color,
    description: fields.description,
    isPast: daysLeft < 0,
    repeat: fields.repeat,
  };
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-xs p-6 flex flex-col items-center gap-5" style={{ background: "#FFF8F0" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "#FCF0F0", border: "2.5px solid #F4C2C2" }}>
          <AlertTriangle className="w-7 h-7" style={{ color: "#E25C7C" }} />
        </div>
        <div className="text-center">
          <h3 className="text-xl mb-1" style={{ color: "#5D4037" }}>确认删除？</h3>
          <p className="text-sm" style={{ color: "#B0A090" }}>「{title}」删除后无法恢复哦～</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>再想想</button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-all"
            style={{ background: "#F4C2C2", color: "#5D4037" }}>确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function AnniversaryModal({
  editItem,
  onClose,
  onSave,
}: {
  editItem?: AnniversaryItem;
  onClose: () => void;
  onSave: (fields: { title: string; rawDate: string; iconKey: IconKey; color: string; description: string; repeat: RepeatMode }) => void;
}) {
  const [title,      setTitle]      = useState(editItem?.title       ?? "");
  const [rawDate,    setRawDate]    = useState(editItem?.rawDate      ?? new Date().toISOString().split("T")[0]);
  const [iconKey,    setIconKey]    = useState<IconKey>(editItem?.iconKey ?? "heart");
  const [color,      setColor]      = useState(editItem?.color        ?? "#FF8A5B");
  const [description,setDesc]       = useState(editItem?.description  ?? "");
  const [repeatOn,   setRepeatOn]   = useState<boolean>(!!editItem?.repeat);
  const [repeatMode, setRepeatMode] = useState<"monthly" | "yearly">(
    editItem?.repeat ? editItem.repeat as "monthly" | "yearly" : "yearly"
  );

  const isEdit = !!editItem;
  const PreviewIcon = ICON_MAP[iconKey];
  const { daysLeft: previewDays } = resolveDate(rawDate, repeatOn ? repeatMode : false);

  const handleSave = () => {
    if (!title.trim() || !rawDate) return;
    onSave({ title: title.trim(), rawDate, iconKey, color, description: description.trim(), repeat: repeatOn ? repeatMode : false });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-sm flex flex-col" style={{ background: "#FFF8F0", maxHeight: "93vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>
            {isEdit ? "✏️ 编辑纪念日" : "🗓️ 添加纪念日"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">

          {/* 名称 */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>📝 纪念日名称</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="给这个纪念日起个名字…"
              className="w-full px-4 py-2.5 rounded-2xl border-2 bg-white outline-none text-sm"
              style={{ borderColor: "rgba(244,162,97,0.55)", color: "#5D4037" }} />
          </div>

          {/* 日期 */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>📅 日期</label>
            <div className="flex items-center rounded-2xl border-2 bg-white overflow-hidden"
              style={{ borderColor: "rgba(244,162,97,0.55)" }}>
              <div className="flex items-center justify-center w-10 h-10 flex-shrink-0"
                style={{ background: "rgba(244,162,97,0.1)" }}>
                <Calendar className="w-4 h-4" style={{ color: "#F4A261" }} />
              </div>
              <input type="date" value={rawDate} onChange={(e) => setRawDate(e.target.value)}
                className="flex-1 pr-4 py-2.5 bg-transparent outline-none text-sm"
                style={{ color: "#5D4037", colorScheme: "light", fontFamily: "var(--font-body,'Ma Shan Zheng',cursive)" }} />
            </div>
          </div>

          {/* 图标选择 */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>🎨 图标</label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const Icon = ICON_MAP[opt.key];
                const isActive = iconKey === opt.key;
                return (
                  <button key={opt.key} onClick={() => setIconKey(opt.key)}
                    title={opt.label}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: isActive ? "#4A3728" : "#E0D0C0",
                      background: isActive ? color + "30" : "white",
                      boxShadow: isActive ? "2px 2px 0 #4A3728" : "none",
                      transform: isActive ? "translate(-1px,-1px)" : "none",
                    }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: isActive ? color : "#F0EDE8" }}>
                      <Icon className="w-4 h-4" style={{ color: isActive ? "white" : "#B0A090" }} />
                    </div>
                    <span style={{ fontSize: "9px", color: isActive ? "#5D4037" : "#C0B0A0" }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>🎨 颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isActive = color === c;
                return (
                  <button key={c} onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: c,
                      border: isActive ? "2.5px solid #4A3728" : "2px solid transparent",
                      boxShadow: isActive ? "2px 2px 0 #4A3728" : "none",
                      transform: isActive ? "scale(1.15)" : "scale(1)",
                      outline: isActive ? "none" : "none",
                    }}>
                    {isActive && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>
              💬 描述 <span style={{ color: "#C0B0A0" }}>（可选）</span>
            </label>
            <input value={description} onChange={(e) => setDesc(e.target.value)}
              placeholder="写点什么来描述这个日子…"
              className="w-full px-4 py-2.5 rounded-2xl border-2 bg-white outline-none text-sm"
              style={{ borderColor: "rgba(244,162,97,0.55)", color: "#5D4037" }} />
          </div>

          {/* 重复 */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" style={{ color: "#F4A261" }} />
                <span className="text-sm" style={{ color: "#5D4037" }}>重复提醒</span>
              </div>
              <button onClick={() => setRepeatOn((v) => !v)}
                className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: repeatOn ? "#F4A261" : "#E0D0C0", border: "2px solid #4A3728" }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                  style={{
                    background: "white",
                    border: "1.5px solid #4A3728",
                    left: repeatOn ? "calc(100% - 1.25rem - 2px)" : "2px",
                    boxShadow: "1px 1px 0 rgba(74,55,40,0.2)",
                  }} />
              </button>
            </div>
            <p className="text-xs mt-1 ml-6" style={{ color: "#C0B0A0" }}>
              {repeatOn ? "过了日期后自动跳到下一次" : "开启后日期过去会自动续期"}
            </p>
            {repeatOn && (
              <div className="mt-3 rounded-2xl p-3 flex items-center gap-3"
                style={{ background: "#FFF3E8", border: "1.5px solid rgba(244,162,97,0.4)" }}>
                <span className="text-sm flex-shrink-0" style={{ color: "#8B6F47" }}>方式</span>
                <div className="flex gap-2 flex-1">
                  {(["monthly", "yearly"] as const).map((mode) => {
                    const isA = repeatMode === mode;
                    return (
                      <button key={mode} onClick={() => setRepeatMode(mode)}
                        className="flex-1 py-1.5 rounded-xl border-2 text-xs transition-all"
                        style={{
                          borderColor: isA ? "#4A3728" : "#E0D0C0",
                          background: isA ? "#F4A261" : "white",
                          color: isA ? "white" : "#8B6F47",
                          boxShadow: isA ? "2px 2px 0 #4A3728" : "none",
                          transform: isA ? "translate(-1px,-1px)" : "none",
                        }}>
                        {mode === "monthly" ? "按月重复" : "按年重复"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 预览 */}
          {title && rawDate && (
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: color + "18", border: `1.5px solid ${color}55` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: color, border: "2px solid #4A3728" }}>
                <PreviewIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "#5D4037", fontWeight: "600" }}>{title}</p>
                <p className="text-xs" style={{ color: "#8B6F47" }}>
                  {toDisplay(resolveDate(rawDate, repeatOn ? repeatMode : false).date)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {previewDays >= 0 ? (
                  <>
                    <span className="text-lg" style={{ color, fontWeight: "700" }}>{previewDays}</span>
                    <span className="text-xs block" style={{ color: "#B0A090" }}>天后</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg" style={{ color: "#C0B0A0", fontWeight: "700" }}>{Math.abs(previewDays)}</span>
                    <span className="text-xs block" style={{ color: "#C0B0A0" }}>天前</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !rawDate}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#FF8A5B", color: "white" }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Anniversary() {
  const [items, setItems] = useState<AnniversaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<AnniversaryItem | undefined>();
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  // 从 Supabase 加载纪念日
  useEffect(() => {
    async function loadAnniversaries() {
      try {
        const data = await anniversariesService.getAll();
        if (data.length > 0) {
          const builtItems = data.map((item) => {
            const builtItem = buildItem({
              title: item.title,
              rawDate: item.date,
              iconKey: (item.icon_key as IconKey) || "heart",
              color: item.color || "#FF8A5B",
              description: item.description || "",
              repeat: item.is_annual ? "yearly" : false,
            }, item.id);
            // 保存原始 Supabase ID
            return { ...builtItem, supabaseId: item.id };
          });
          setItems(builtItems);
        }
      } catch (error) {
        console.error('Failed to load anniversaries:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAnniversaries();
  }, []);

  const openAdd = () => { setEditItem(undefined); setShowModal(true); };
  const openEdit = (item: AnniversaryItem) => { setEditItem(item); setShowModal(true); };

  const handleSave = async (fields: Parameters<typeof buildItem>[0]) => {
    try {
      if (editItem && editItem.supabaseId) {
        await anniversariesService.update(editItem.supabaseId, {
          title: fields.title,
          date: fields.rawDate,
          description: fields.description,
          is_annual: fields.repeat === "yearly",
          icon_key: fields.iconKey,
          color: fields.color,
        });
        setItems((prev) => prev.map((it) => it.id === editItem.id ? { ...buildItem(fields, it.id), supabaseId: editItem.supabaseId } : it));
      } else {
        const created = await anniversariesService.create({
          title: fields.title,
          date: fields.rawDate,
          description: fields.description,
          is_annual: fields.repeat === "yearly",
          icon_key: fields.iconKey,
          color: fields.color,
        });
        if (created) {
          setItems((prev) => [...prev, { ...buildItem(fields, created.id), supabaseId: created.id }]);
        }
      }
    } catch (error) {
      console.error('Failed to save anniversary:', error);
    }
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        const itemToDelete = items.find(it => it.id === deleteId);
        if (itemToDelete?.supabaseId) {
          await anniversariesService.delete(itemToDelete.supabaseId);
        }
        setItems((prev) => prev.filter((it) => it.id !== deleteId));
      } catch (error) {
        console.error('Failed to delete anniversary:', error);
      }
      setDeleteId(null);
    }
  };

  const sorted = [...items].sort((a, b) => {
    if (a.isPast && !b.isPast) return 1;
    if (!a.isPast && b.isPast) return -1;
    if (a.isPast) return b.daysLeft - a.daysLeft;
    return a.daysLeft - b.daysLeft;
  });
  const nextAnniversary = sorted.find((a) => !a.isPast && a.daysLeft >= 0);

  const filtered = sorted.filter((a) => {
    if (activeTab === "upcoming") return !a.isPast;
    if (activeTab === "past")     return a.isPast;
    return true;
  });

  const deletingItem = items.find((it) => it.id === deleteId);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" style={{ color: "#FF8A5B" }} />
            <h1 className="text-4xl" style={{ color: "#5D4037", fontWeight: "700" }}>纪念日</h1>
          </div>
          <button onClick={openAdd}
            className="sketch-button px-5 py-2.5 flex items-center gap-2"
            style={{ background: "#FF8A5B", color: "white" }}>
            <Plus className="w-4 h-4" /><span>添加纪念日</span>
          </button>
        </div>
        <p className="text-base mb-2" style={{ color: "#B0A090" }}>纪念那些重要时刻</p>
      </div>

      {/* 大看板 */}
      {nextAnniversary && (() => {
        const Icon = ICON_MAP[nextAnniversary.iconKey];
        return (
          <div className="sketch-card overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #FFF0E8 0%, #FFE6F0 60%, #E8F4F5 100%)" }}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
              style={{ background: nextAnniversary.color }} />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15"
              style={{ background: "#A8DADC" }} />
            <div className="relative z-10 p-8 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: nextAnniversary.color, border: "3px solid #4A3728", boxShadow: "4px 4px 0 #4A3728" }}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" style={{ color: "#FF8A5B" }} />
                  <span className="text-sm" style={{ color: "#B0A090" }}>下一个纪念日</span>
                </div>
                <h2 className="text-2xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>
                  {nextAnniversary.title}
                </h2>
                <p className="text-sm mb-3" style={{ color: "#8B6F47" }}>
                  {nextAnniversary.dateDisplay}
                  {nextAnniversary.description && ` · ${nextAnniversary.description}`}
                </p>
                <span className="px-4 py-1.5 rounded-full text-sm border-2 border-[#4A3728]"
                  style={{ background: "white", color: "#FF8A5B", fontWeight: "600" }}>
                  🎉 还有 {nextAnniversary.daysLeft} 天
                </span>
              </div>
              <div className="flex-shrink-0 text-right">
                <div style={{
                  fontSize: "clamp(4rem,8vw,6rem)", color: nextAnniversary.color,
                  fontWeight: "700", lineHeight: 1, opacity: 0.9,
                  textShadow: "3px 3px 0 rgba(74,55,40,0.15)",
                }}>
                  {nextAnniversary.daysLeft}
                </div>
                <div className="text-base mt-1" style={{ color: "#B0A090" }}>天</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tabs — no count badge */}
      <div className="flex flex-wrap gap-2">
        {TAB_OPTIONS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-2 sm:px-4 py-1 rounded-full border-2 text-xs sm:text-sm transition-all"
              style={{
                borderColor: isActive ? "#4A3728" : "#E0D0C0",
                background:  isActive ? "#FF8A5B" : "white",
                color:       isActive ? "white" : "#8B6F47",
                boxShadow:   isActive ? "2px 2px 0 #4A3728" : "none",
                transform:   isActive ? "translate(-1px,-1px)" : "none",
              }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="sketch-card p-12 text-center" style={{ background: "white" }}>
            <div className="text-4xl mb-3">📅</div>
            <p className="text-base" style={{ color: "#8B6F47" }}>暂无纪念日记录</p>
          </div>
        )}
        {filtered.map((item) => {
          const Icon   = ICON_MAP[item.iconKey];
          const isPast = item.isPast;
          return (
            <div key={item.id}
              className="sketch-card p-5 hover:scale-[1.02] transition-transform group"
              style={{ background: "white", opacity: isPast ? 0.85 : 1 }}>
              <div className="flex items-center gap-4">
                {/* 图标 */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: item.color,
                    border: "2.5px solid #4A3728",
                    boxShadow: "2px 2px 0 #4A3728",
                    filter: isPast ? "grayscale(20%)" : "none",
                  }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-lg" style={{ color: "#5D4037", fontWeight: "600" }}>{item.title}</h3>
                    {isPast && (
                      <span className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ borderColor: "#E0D0C0", color: "#B0A090", background: "#F9F5F0" }}>
                        已过去
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Calendar className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
                    <span className="text-sm" style={{ color: "#8B6F47" }}>{item.dateDisplay}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm" style={{ color: "#B0A090" }}>{item.description}</p>
                  )}
                </div>

                {/* 天数 */}
                <div className="flex-shrink-0 text-right mr-3">
                  {isPast ? (
                    <>
                      <div className="text-2xl" style={{ color: "#C0B0A0", fontWeight: "700", lineHeight: 1 }}>
                        {Math.abs(item.daysLeft)}
                      </div>
                      <div className="text-xs" style={{ color: "#C0B0A0" }}>天前</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl" style={{ color: item.color, fontWeight: "700", lineHeight: 1 }}>
                        {item.daysLeft}
                      </div>
                      <div className="text-xs" style={{ color: "#B0A090" }}>天后</div>
                    </>
                  )}
                </div>

                {/* 编辑/删除 按钮 */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(item)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4A261]/20 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
                  </button>
                  <button onClick={() => setDeleteId(item.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部装饰 */}
      <div className="sketch-card p-8 text-center"
        style={{ background: "linear-gradient(135deg, #FFE6F0 0%, #E8F4F5 100%)" }}>
        <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: "#FF8A5B" }} fill="#FF8A5B" />
        <h3 className="text-2xl mb-2" style={{ color: "#5D4037", fontWeight: "600" }}>珍藏每一次心动</h3>
        <p className="text-base" style={{ color: "#8B6F47" }}>
          记录每一个值得纪念的日子，让美好永不褪色 ✨
        </p>
      </div>

      {/* Modals */}
      {showModal && (
        <AnniversaryModal
          editItem={editItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {deleteId !== null && deletingItem && (
        <DeleteModal
          title={deletingItem.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}