import { useState, useRef, useEffect } from "react";
import {
  Star, Plus, Check, Sparkles, X, Edit2, Trash2,
  LayoutGrid, List, Tag, AlertTriangle, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WishItem {
  id: number;
  title: string;
  category: string;
  description: string;
  status: "pending" | "completed";
  completedDate?: string;
}

// ─── Tag color palette ────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  旅行:  { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
  美食:  { bg: "#FFF9C4", text: "#F57F17", border: "#FFF176" },
  娱乐:  { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD0" },
  _default: { bg: "#F5F0EB", text: "#7B5E3A", border: "#E8D9C8" },
};

// cycle through a few extra colors for custom tags
const EXTRA_COLORS = [
  { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  { bg: "#F3E5F5", text: "#6A1B9A", border: "#E1BEE7" },
  { bg: "#FFE6F0", text: "#E25C7C", border: "#FFCDD2" },
  { bg: "#FFF3E0", text: "#E65100", border: "#FFE0B2" },
  { bg: "#E0F2F1", text: "#00695C", border: "#B2DFDB" },
];

function getTagStyle(cat: string, allTags: string[]) {
  if (TAG_COLORS[cat]) return TAG_COLORS[cat];
  // assign a stable color based on index among custom tags
  const customIdx = allTags.filter((t) => !TAG_COLORS[t]).indexOf(cat);
  return EXTRA_COLORS[Math.abs(customIdx) % EXTRA_COLORS.length];
}

// ─── Delete modal ─────────────────────────────────────────────────────────────

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

function WishModal({
  editItem,
  tags,
  onClose,
  onSave,
  onTagsChange,
}: {
  editItem?: WishItem;
  tags: string[];
  onClose: () => void;
  onSave: (fields: { title: string; category: string; description: string }) => void;
  onTagsChange: (tags: string[]) => void;
}) {
  const [title,       setTitle]       = useState(editItem?.title       ?? "");
  const [category,    setCategory]    = useState(editItem?.category    ?? "");
  const [description, setDescription] = useState(editItem?.description ?? "");
  const [tagInput,    setTagInput]    = useState("");

  const isEdit = !!editItem;

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) onTagsChange([...tags, t]);
    setCategory(t);
    setTagInput("");
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddTag(); }
  };

  const handleDeleteTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
    if (category === tag) setCategory("");
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, description: description.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-md flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>
            {isEdit ? "✏️ 编辑心愿" : "✨ 添加心愿"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">

          {/* 标题 */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>💫 心愿标题 <span style={{ color: "#E25C7C" }}>*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="许下一个心愿吧…"
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: title ? "#F4A261" : "rgba(244,162,97,0.4)", color: "#5D4037" }}
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>
              <Tag className="w-3 h-3 inline mr-1" />分类标签
              <span className="ml-1" style={{ color: "#C0B0A0" }}>(点击选择，× 删除标签)</span>
            </label>

            {/* Tag chips: click to select, × to delete from list */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => {
                const s = getTagStyle(tag, tags);
                const isSelected = category === tag;
                return (
                  <div key={tag} className="flex items-center rounded-full border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: isSelected ? "#4A3728" : s.border,
                      background: isSelected ? s.bg : "white",
                      boxShadow: isSelected ? "1.5px 1.5px 0 #4A3728" : "none",
                      transform: isSelected ? "translate(-1px,-1px)" : "none",
                    }}>
                    {/* Select area */}
                    <button
                      onClick={() => setCategory(isSelected ? "" : tag)}
                      className="pl-3 pr-2 py-1 text-sm transition-colors"
                      style={{ color: isSelected ? s.text : "#8B6F47", fontWeight: isSelected ? "700" : "400" }}>
                      {tag}
                    </button>
                    {/* Delete tag from list */}
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="pr-2 py-1 opacity-40 hover:opacity-80 transition-opacity text-sm leading-none"
                      style={{ color: isSelected ? s.text : "#8B6F47" }}
                      title="删除此标签">
                      ×
                    </button>
                  </div>
                );
              })}
              {tags.length === 0 && (
                <span className="text-sm" style={{ color: "#C0B0A0" }}>暂无标签，请在下方添加～</span>
              )}
            </div>

            {/* Add custom tag */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 bg-white"
              style={{ borderColor: "rgba(244,162,97,0.4)" }}>
              <Tag className="w-4 h-4 flex-shrink-0" style={{ color: "#B0A090" }} />
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder="输入新标签，回车添加…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "#5D4037" }}
              />
              {tagInput.trim() && (
                <button onClick={handleAddTag}
                  className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs border transition-all hover:-translate-y-0.5"
                  style={{ background: "#FFD54F", color: "#5D4037", borderColor: "#4A3728", fontWeight: "600" }}>
                  添加
                </button>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>
              📝 描述 <span style={{ color: "#C0B0A0" }}>(可选)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述一下这个心愿吧，越详细越好～"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base resize-none"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }}
            />
          </div>
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
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#FFD54F", color: "#5D4037", fontWeight: "600" }}
          >
            {isEdit ? "保存" : "许愿"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Board Card ───────────────────────────────────────────────────────────────

function BoardCard({
  wish,
  allTags,
  onToggle,
  onEdit,
  onDelete,
}: {
  wish: WishItem;
  allTags: string[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDone = wish.status === "completed";
  const tagStyle = getTagStyle(wish.category, allTags);

  return (
    <div className="sketch-card p-5 flex flex-col gap-3 transition-all hover:scale-[1.02] relative"
      style={{ background: isDone ? "#FDFCFA" : "white" }}>

      {/* Top: tag + edit/delete actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {wish.category && (
            <span className="px-2.5 py-0.5 rounded-full text-xs border"
              style={{ background: tagStyle.bg, color: tagStyle.text, borderColor: tagStyle.border, fontWeight: "600" }}>
              {wish.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4A261]/20 transition-colors">
            <Edit2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
          </button>
          <button onClick={onDelete}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <Trash2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
          </button>
        </div>
      </div>

      {/* Title — no strikethrough */}
      <h3 className="text-xl" style={{ color: "#5D4037", fontWeight: "600" }}>
        {wish.title}
      </h3>

      {/* Description */}
      {wish.description && (
        <p className="text-base flex-1" style={{ color: "#8B6F47" }}>
          {wish.description}
        </p>
      )}

      {/* Bottom row: spacer + check circle */}
      <div className="flex items-center justify-end mt-1">
        <button
          onClick={onToggle}
          title={isDone ? "撤销完成" : "标记为已实现"}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={isDone
            ? { background: "#4CAF50", border: "2.5px solid #388E3C", boxShadow: "0 2px 6px rgba(76,175,80,0.35)" }
            : { background: "white", border: "2.5px dashed #C8B8A8" }
          }>
          {isDone
            ? <Check className="w-5 h-5 text-white" strokeWidth={3} />
            : <Check className="w-5 h-5" style={{ color: "#D0C0B0" }} strokeWidth={2} />
          }
        </button>
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function ListRow({
  wish,
  allTags,
  onToggle,
  onEdit,
  onDelete,
}: {
  wish: WishItem;
  allTags: string[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDone = wish.status === "completed";
  const tagStyle = getTagStyle(wish.category, allTags);

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all hover:shadow-sm"
      style={{
        background: isDone ? "#FDFCFA" : "white",
        borderColor: isDone ? "#E0D8D0" : "#4A3728",
        boxShadow: isDone ? "none" : "2px 2px 0 #4A3728",
      }}>

      {/* Checkbox circle */}
      <button onClick={onToggle}
        title={isDone ? "撤销完成" : "标记为已实现"}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
        style={isDone
          ? { background: "#4CAF50", border: "2px solid #388E3C" }
          : { background: "white", border: "2px dashed #C8B8A8" }
        }>
        {isDone && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </button>

      {/* Title + description — no strikethrough */}
      <div className="flex-1 min-w-0">
        <p className="text-base" style={{ color: "#5D4037", fontWeight: "600" }}>
          {wish.title}
        </p>
        {wish.description && (
          <p className="text-sm mt-0.5 truncate" style={{ color: "#B0A090" }}>{wish.description}</p>
        )}
      </div>

      {/* Category */}
      <div className="flex-shrink-0">
        {wish.category ? (
          <span className="px-2.5 py-1 rounded-full text-xs border"
            style={{ background: tagStyle.bg, color: tagStyle.text, borderColor: tagStyle.border, fontWeight: "600" }}>
            {wish.category}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "#D0C0B0" }}>—</span>
        )}
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 w-16 text-center">
        <span className="text-xs px-2 py-1 rounded-full"
          style={isDone
            ? { background: "#E8F5E9", color: "#388E3C" }
            : { background: "#FFF9C4", color: "#F57F17" }
          }>
          {isDone ? "已实现" : "待实现"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onEdit}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4A261]/20 transition-colors">
          <Edit2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
          <Trash2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
        </button>
      </div>
    </div>
  );
}

// ─── Tag Dropdown ─────────────────────────────────────────────────────────────

function TagDropdown({
  value,
  tags,
  allTags,
  onChange,
}: {
  value: string;
  tags: string[];
  allTags: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeStyle = value ? getTagStyle(value, allTags) : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-2xl border-2 text-sm transition-all whitespace-nowrap"
        style={{
          borderColor: value ? "#4A3728" : "#E0D0C0",
          background:  value ? (activeStyle?.bg ?? "#FFF8F0") : "white",
          color:       value ? (activeStyle?.text ?? "#5D4037") : "#8B6F47",
          boxShadow:   value ? "2px 2px 0 #4A3728" : "none",
          transform:   value ? "translate(-1px,-1px)" : "none",
          fontWeight:  value ? "700" : "400",
        }}
      >
        <span>{value || "全部标签"}</span>
        <ChevronDown
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
          style={{ color: "#B0A090", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 rounded-2xl overflow-hidden z-30"
          style={{ background: "white", border: "2px solid #4A3728", boxShadow: "3px 3px 0 #4A3728", minWidth: "120px" }}
        >
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#FFF8F0]"
            style={{ color: !value ? "#F4A261" : "#8B6F47", fontWeight: !value ? "700" : "400" }}
          >
            全部标签
          </button>
          {tags.map((tag) => {
            const s = getTagStyle(tag, allTags);
            return (
              <button key={tag}
                onClick={() => { onChange(tag); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#FFF8F0] flex items-center gap-2"
                style={{ color: value === tag ? s.text : "#8B6F47", fontWeight: value === tag ? "700" : "400", background: value === tag ? s.bg : "transparent" }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.text }} />
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const INIT: WishItem[] = [
  { id: 1, title: "一起去看极光",    category: "旅行", description: "想和你在冰岛看一次绚丽的北极光，感受大自然的魔法", status: "pending" },
  { id: 2, title: "学会做你最爱的菜", category: "美食", description: "想亲手给你做一顿丰盛的晚餐",             status: "pending" },
  { id: 3, title: "养一只小狗",      category: "娱乐", description: "一起照顾一个小生命，给它取名叫布丁",      status: "pending" },
  { id: 4, title: "拍一套情侣写真",  category: "娱乐", description: "记录我们最美好的样子",                   status: "completed" },
  { id: 5, title: "去日本赏樱花",    category: "旅行", description: "三月的京都，和你一起漫步在樱花树下",      status: "pending" },
  { id: 6, title: "一起学烘焙",      category: "美食", description: "亲手做蛋糕庆祝我们的纪念日",             status: "completed" },
];

const INIT_TAGS = ["旅行", "美食", "娱乐"];

type ViewMode = "board" | "list";
type FilterTab = "all" | "pending" | "completed";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "全部"   },
  { key: "pending",   label: "待实现" },
  { key: "completed", label: "已实现" },
];

export default function Wishes() {
  const [wishes,      setWishes]      = useState<WishItem[]>(INIT);
  const [tags,        setTags]        = useState<string[]>(INIT_TAGS);
  const [viewMode,    setViewMode]    = useState<ViewMode>("board");
  const [filterTab,   setFilterTab]   = useState<FilterTab>("all");
  const [filterTag,   setFilterTag]   = useState<string>(""); // "" = 全部标签
  const [showModal,   setShowModal]   = useState(false);
  const [editItem,    setEditItem]    = useState<WishItem | undefined>();
  const [deleteId,    setDeleteId]    = useState<number | null>(null);

  const openAdd  = () => { setEditItem(undefined); setShowModal(true); };
  const openEdit = (w: WishItem) => { setEditItem(w); setShowModal(true); };

  const handleSave = (fields: { title: string; category: string; description: string }) => {
    if (editItem) {
      setWishes((prev) => prev.map((w) => w.id === editItem.id ? { ...w, ...fields } : w));
    } else {
      setWishes((prev) => [...prev, { id: Date.now(), ...fields, status: "pending" }]);
    }
  };

  const handleToggle = (id: number) => {
    setWishes((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      return w.status === "pending"
        ? { ...w, status: "completed", completedDate: "2026年3月11日" }
        : { ...w, status: "pending",   completedDate: undefined };
    }));
  };

  const confirmDelete = () => {
    if (deleteId !== null) { setWishes((prev) => prev.filter((w) => w.id !== deleteId)); setDeleteId(null); }
  };

  const filtered = wishes.filter((w) => {
    if (filterTab === "pending"   && w.status !== "pending")   return false;
    if (filterTab === "completed" && w.status !== "completed") return false;
    if (filterTag && w.category !== filterTag)                 return false;
    return true;
  });

  const totalCount     = wishes.length;
  const pendingCount   = wishes.filter((w) => w.status === "pending").length;
  const completedCount = wishes.filter((w) => w.status === "completed").length;

  const deletingItem = wishes.find((w) => w.id === deleteId);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8" style={{ color: "#FFD54F" }} fill="#FFD54F" />
            <h1 className="text-4xl" style={{ color: "#5D4037", fontWeight: "700" }}>心愿清单</h1>
          </div>
          <button onClick={openAdd}
            className="sketch-button px-5 py-2.5 flex items-center gap-2"
            style={{ background: "#FFD54F", color: "#5D4037" }}>
            <Plus className="w-4 h-4" /><span>添加心愿</span>
          </button>
        </div>
        <p className="text-base mb-2" style={{ color: "#B0A090" }}>好多心愿想一起实现</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="sketch-card p-4 text-center" style={{ background: "#FFF9C4" }}>
          <div className="text-3xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>{totalCount}</div>
          <div className="text-sm" style={{ color: "#8B6F47" }}>全部心愿</div>
        </div>
        <div className="sketch-card p-4 text-center" style={{ background: "#FFE6F0" }}>
          <div className="text-3xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>{pendingCount}</div>
          <div className="text-sm" style={{ color: "#8B6F47" }}>待实现</div>
        </div>
        <div className="sketch-card p-4 text-center" style={{ background: "#E8F5E9" }}>
          <div className="text-3xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>{completedCount}</div>
          <div className="text-sm" style={{ color: "#8B6F47" }}>已完成</div>
        </div>
      </div>

      {/* Toolbar: filter tabs + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {FILTER_TABS.map((tab) => {
            const isActive = filterTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setFilterTab(tab.key)}
                className="px-4 py-1.5 rounded-full border-2 text-sm transition-all"
                style={{
                  borderColor: isActive ? "#4A3728" : "#E0D0C0",
                  background:  isActive ? "#FFD54F" : "white",
                  color:       isActive ? "#5D4037" : "#8B6F47",
                  boxShadow:   isActive ? "2px 2px 0 #4A3728" : "none",
                  transform:   isActive ? "translate(-1px,-1px)" : "none",
                  fontWeight:  isActive ? "600" : "400",
                }}>
                {tab.label}
              </button>
            );
          })}
          {/* Tag dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "#B0A090" }}>标签</span>
            <TagDropdown
              value={filterTag}
              tags={tags}
              allTags={tags}
              onChange={setFilterTag}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl border-2"
          style={{ borderColor: "#4A3728", background: "white", boxShadow: "2px 2px 0 #4A3728" }}>
          <button onClick={() => setViewMode("board")}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: viewMode === "board" ? "#FFD54F" : "transparent", color: viewMode === "board" ? "#5D4037" : "#B0A090" }}
            title="看板视图">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: viewMode === "list" ? "#FFD54F" : "transparent", color: viewMode === "list" ? "#5D4037" : "#B0A090" }}
            title="列表视图">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="sketch-card p-14 text-center" style={{ background: "white" }}>
          <div className="text-4xl mb-3">🌟</div>
          <p className="text-base" style={{ color: "#8B6F47" }}>还没有心愿，点击"添加心愿"许下第一个愿望吧～</p>
        </div>
      ) : viewMode === "board" ? (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((w) => (
            <BoardCard key={w.id} wish={w} allTags={tags}
              onToggle={() => handleToggle(w.id)}
              onEdit={() => openEdit(w)}
              onDelete={() => setDeleteId(w.id)}
            />
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl mb-2 text-sm"
            style={{ background: "#F5EFE8", color: "#8B6F47" }}>
            <div className="w-7 flex-shrink-0" />
            <div className="flex-1">标题 / 描述</div>
            <div className="flex-shrink-0 w-20 text-center">分类</div>
            <div className="flex-shrink-0 w-16 text-center">状态</div>
            <div className="flex-shrink-0 w-16 text-center">操作</div>
          </div>
          <div className="space-y-2">
            {filtered.map((w) => (
              <ListRow key={w.id} wish={w} allTags={tags}
                onToggle={() => handleToggle(w.id)}
                onEdit={() => openEdit(w)}
                onDelete={() => setDeleteId(w.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom banner */}
      <div className="sketch-card p-8 text-center"
        style={{ background: "linear-gradient(135deg, #FFF9C4 0%, #FFE6F0 100%)" }}>
        <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: "#FFD54F" }} />
        <h3 className="text-2xl mb-2" style={{ color: "#5D4037", fontWeight: "600" }}>
          一起实现每一个小小的梦想
        </h3>
        <p className="text-base" style={{ color: "#8B6F47" }}>
          每一个心愿都是我们共同的期待，让我们一起努力，让梦想成真 🌈
        </p>
      </div>

      {/* Modals */}
      {showModal && (
        <WishModal
          editItem={editItem}
          tags={tags}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onTagsChange={setTags}
        />
      )}
      {deleteId !== null && deletingItem && (
        <DeleteModal title={deletingItem.title} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}