import { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Plus,
  Heart,
  MessageCircle,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Send,
  CornerDownRight,
  AlertTriangle,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { dailyRecordsService, storageService, DailyRecord as DailyRecordType } from "../../lib/services";
// Temporarily using placeholder images instead of local assets for now to fix compile errors
const baoDog = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";
const zhangDog = "https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";

// Get current user role from localStorage
type UserRole = "B" | "Z";
const getCurrentUserRole = (): UserRole => {
  const savedRole = localStorage.getItem("userRole") as UserRole;
  return savedRole && (savedRole === "B" || savedRole === "Z") ? savedRole : "B";
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  id: number;
  author: "Bao" | "Zhang" | "B" | "Z";
  text: string;
  time: string;
}

interface DailyComment {
  id: number;
  author: "Bao" | "Zhang" | "B" | "Z";
  text: string;
  time: string;
  replies: Reply[];
}

interface DailyRecord {
  id: number | string;
  date: string;
  title: string;
  content: string;
  images: string[];
  location: string;
  mood?: string;
  author: "Bao" | "Zhang" | "B" | "Z";
  likes: number;
  liked: boolean;
  comments: DailyComment[];
}

// ─── Mood options ─────────────────────────────────────────────────────────────

const MOODS = [
  { emoji: "🥰", label: "甜蜜" },
  { emoji: "😆", label: "兴奋" },
  { emoji: "😊", label: "愉悦" },
  { emoji: "😌", label: "平静" },
  { emoji: "🥺", label: "感动" },
  { emoji: "😂", label: "搞笑" },
  { emoji: "😴", label: "慵懒" },
  { emoji: "🤩", label: "惊喜" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

const START_DATE = new Date("2025-03-24");

function calcDaysFromStart(dateStr: string) {
  const d = new Date(dateStr);
  return Math.max(1, Math.ceil((d.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

// ─── Author Avatar ─────────────────────────────────────────────────────────────

function AuthorAvatar({ author, size = 40 }: { author: "Bao" | "Zhang" | "B" | "Z"; size?: number }) {
  const isBao = author === "Bao" || author === "B";
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: "2.5px solid #4A3728",
        boxShadow: "2px 2px 0 #4A3728",
        background: isBao ? "#F4A261" : "#F4C2C2",
      }}
      title={isBao ? "Bao" : "Zhang"}
    >
      <span className="text-white text-sm font-bold">{isBao ? "B" : "Z"}</span>
    </div>
  );
}

// ─── Image Grid ───────────────────────────────────────────────────────────────

function ImageGrid({ images, onRemove }: { images: string[]; onRemove?: (i: number) => void }) {
  if (images.length === 0) return null;
  const gridClass =
    images.length === 1 ? "grid grid-cols-1"
    : images.length === 2 ? "grid grid-cols-2 gap-1"
    : "grid grid-cols-3 gap-1";
  const imgClass =
    images.length === 1
      ? "w-full rounded-xl object-cover max-h-60"
      : "w-full aspect-square object-cover rounded-lg";

  return (
    <div className={`mt-3 ${gridClass}`}>
      {images.map((src, i) => (
        <div key={i} className="relative group">
          <img src={src} alt={`图片${i + 1}`} className={imgClass} />
          {onRemove && (
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Record Modal ─────────────────────────────────────────────────────────────

function RecordModal({
  initialDate,
  editRecord,
  onClose,
  onSave,
}: {
  initialDate?: string;
  editRecord?: DailyRecord;
  onClose: () => void;
  onSave: (r: Omit<DailyRecord, "id">) => void;
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(editRecord?.date || initialDate || todayStr);
  const [title, setTitle] = useState(editRecord?.title || "");
  const [content, setContent] = useState(editRecord?.content || "");
  const [location, setLocation] = useState(editRecord?.location || "");
  const [images, setImages] = useState<string[]>(editRecord?.images || []);
  const [mood, setMood] = useState(editRecord?.mood || "");
  const imgRef = useRef<HTMLInputElement>(null);

  const handleImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      try {
        const url = await storageService.uploadImage(file);
        setImages((prev) => [...prev, url]);
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('图片上传失败，请重试');
      }
    }
    
    e.target.value = "";
  };

  const removeImg = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      date, title: title.trim(), content: content.trim(),
      location: location.trim() || "某个地方",
      images, mood, author: getCurrentUserRole() === "B" ? "Bao" : "Zhang",
      likes: editRecord?.likes || 0,
      liked: editRecord?.liked || false,
      comments: editRecord?.comments || [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-md flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>
            {editRecord ? "✏️ 编辑记录" : "✍️ 新记录"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 space-y-4 pb-4">
          {/* Date */}
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: "#8B6F47" }}>📅 日期</label>
            <div className="flex items-center rounded-2xl border-2 bg-white overflow-hidden" style={{ borderColor: "rgba(244,162,97,0.6)" }}>
              <div className="flex items-center justify-center w-10 h-10 flex-shrink-0" style={{ background: "rgba(244,162,97,0.1)" }}>
                <Calendar className="w-4 h-4" style={{ color: "#F4A261" }} />
              </div>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 pr-4 py-2.5 bg-transparent outline-none text-sm"
                style={{ color: "#5D4037", colorScheme: "light", fontFamily: "var(--font-body, 'Ma Shan Zheng', cursive)" }}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8B6F47" }}>🏷️ 标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给今天的记录起个名字…"
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#F4A261]/60 bg-white outline-none text-sm" style={{ color: "#5D4037" }} />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8B6F47" }}>📍 地点</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="在哪里呀…"
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#F4A261]/60 bg-white outline-none text-sm" style={{ color: "#5D4037" }} />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8B6F47" }}>💬 内容</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="记录今天发生的美好事情…"
              rows={4} className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#F4A261]/60 bg-white outline-none resize-none text-sm" style={{ color: "#5D4037" }} />
          </div>

          {/* Mood */}
          <div>
            <label className="text-xs mb-2 block" style={{ color: "#8B6F47" }}>🌈 心情</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m.label} onClick={() => setMood(mood === m.label ? "" : m.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm transition-all"
                  style={{
                    borderColor: mood === m.label ? "#F4A261" : "#E0D0C0",
                    background: mood === m.label ? "#FFF0E0" : "white",
                    color: "#5D4037",
                    transform: mood === m.label ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <span>{m.emoji}</span><span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-xs mb-2 block" style={{ color: "#8B6F47" }}>🖼️ 图片</label>
            {images.length > 0 && <ImageGrid images={images} onRemove={removeImg} />}
            <button onClick={() => imgRef.current?.click()}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#F4A261]/50 text-sm hover:bg-[#F4A261]/10 transition-colors"
              style={{ color: "#B0A090" }}
            >
              <ImageIcon className="w-4 h-4" />
              {images.length > 0 ? "继续添加图片" : "上传图片"}
            </button>
            <input ref={imgRef} type="file" accept="image/*" multiple onChange={handleImg} className="hidden" />
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform" style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button onClick={submit} disabled={!title.trim() || !content.trim()}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#F4A261", color: "white" }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-xs p-6 flex flex-col items-center gap-5" style={{ background: "#FFF8F0" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#FCF0F0", border: "2.5px solid #F4C2C2" }}>
          <AlertTriangle className="w-7 h-7" style={{ color: "#E25C7C" }} />
        </div>
        <div className="text-center">
          <h3 className="text-xl mb-1" style={{ color: "#5D4037" }}>确认删除？</h3>
          <p className="text-sm" style={{ color: "#B0A090" }}>删除后无法恢复哦～</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform" style={{ color: "#5D4037", background: "white" }}>再想想</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-all" style={{ background: "#F4C2C2", color: "#5D4037" }}>确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ─── Record Card ──────────────────────────────────────────────────────────────

function RecordCard({
  record, onEdit, onDelete, onUpdate, userRole,
}: {
  record: DailyRecord;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (r: DailyRecord) => void;
  userRole: UserRole;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(0);
  const [replyText, setReplyText] = useState("");
  const moodObj = MOODS.find((m) => m.label === record.mood);

  const toggleLike = () =>
    onUpdate({ ...record, liked: !record.liked, likes: record.liked ? record.likes - 1 : record.likes + 1 });

  const addComment = () => {
    if (!newComment.trim()) return;
    const c: DailyComment = { id: Date.now(), author: record.author, text: newComment.trim(), time: nowTime(), replies: [] };
    onUpdate({ ...record, comments: [...record.comments, c] });
    setNewComment("");
  };

  const addReply = (cid: number) => {
    if (!replyText.trim()) return;
    const r: Reply = { id: Date.now(), author: record.author, text: replyText.trim(), time: nowTime() };
    onUpdate({ ...record, comments: record.comments.map((c) => c.id === cid ? { ...c, replies: [...c.replies, r] } : c) });
    setReplyingTo(0);
    setReplyText("");
  };

  return (
    <div className="sketch-card overflow-hidden relative" style={{ background: "white" }}>
      {moodObj && (
        <div className="absolute top-3 right-3 flex flex-col items-center select-none pointer-events-none" style={{ opacity: 0.8 }}>
          <span style={{ fontSize: "1.8rem" }}>{moodObj.emoji}</span>
          <span style={{ color: "#C0A890", fontSize: "10px" }}>{moodObj.label}</span>
        </div>
      )}
      <div className="p-4">
        <div className="pr-10 mb-2">
          <h3 className="text-lg mb-1" style={{ color: "#5D4037", fontWeight: "600" }}>{record.title}</h3>
          <div className="flex items-center gap-1 text-xs" style={{ color: "#B0A090" }}>
            <MapPin className="w-3 h-3" />{record.location}
          </div>
        </div>
        <p className="text-base leading-relaxed" style={{ color: "#5D4037" }}>{record.content}</p>
        {record.images.length > 0 && <ImageGrid images={record.images} />}

        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1.5px dashed #F4E0D0" }}>
          <button onClick={toggleLike} className="flex items-center gap-1.5 text-sm transition-transform hover:scale-110 active:scale-95" style={{ color: record.liked ? "#E25C7C" : "#C0B0A0" }}>
            <Heart className={`w-4 h-4 transition-all ${record.liked ? "fill-current" : ""}`} />
            <span>{record.likes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: showComments ? "#F4A261" : "#C0B0A0" }}>
            <MessageCircle className="w-4 h-4" /><span>{record.comments.length}</span>
          </button>
          <div className="flex-1" />
          <button onClick={onEdit} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4A261]/20 transition-colors">
            <Edit2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <Trash2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
          </button>
        </div>

        {showComments && (
          <div className="mt-3 space-y-3">
            {record.comments.length === 0 && (
              <p className="text-xs text-center py-2" style={{ color: "#C0B0A0" }}>还没有评论，快来抢沙发～ 🐾</p>
            )}
            {record.comments.map((cm) => (
              <div key={cm.id} className="space-y-2">
                <div className="flex gap-2">
                  <AuthorAvatar author={cm.author === "Zhang" ? "Zhang" : "Bao"} size={32} />
                  <div className="flex-1 bg-[#FFF8F0] rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm" style={{ color: "#5D4037", fontWeight: "600" }}>{cm.author}</span>
                      <span className="text-xs" style={{ color: "#C0B0A0" }}>{cm.time}</span>
                    </div>
                    <p className="text-sm" style={{ color: "#5D4037" }}>{cm.text}</p>
                    <button onClick={() => setReplyingTo(replyingTo === cm.id ? 0 : cm.id)} className="text-xs mt-1 hover:underline" style={{ color: replyingTo === cm.id ? "#F4A261" : "#C0B0A0" }}>
                      {replyingTo === cm.id ? "收起" : "回复"}
                    </button>
                  </div>
                </div>
                {cm.replies.length > 0 && (
                  <div className="ml-9 space-y-2">
                    {cm.replies.map((rp) => (
                      <div key={rp.id} className="flex gap-2 items-start">
                        <CornerDownRight className="w-3 h-3 mt-2 flex-shrink-0" style={{ color: "#D0C0B0" }} />
                        <AuthorAvatar author={rp.author === "Zhang" ? "Zhang" : "Bao"} size={28} />
                        <div className="flex-1 bg-[#EEF9F9] rounded-2xl px-3 py-1.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs" style={{ color: "#5D4037", fontWeight: "600" }}>{rp.author}</span>
                            <span className="text-xs" style={{ color: "#C0B0A0" }}>{rp.time}</span>
                          </div>
                          <p className="text-xs" style={{ color: "#5D4037" }}>{rp.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {replyingTo === cm.id && (
                  <div className="ml-9 flex gap-2">
                    <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReply(cm.id)}
                      placeholder={`回复 ${cm.author}…`} className="flex-1 text-xs px-3 py-1.5 rounded-full border border-[#A8DADC] outline-none bg-[#EEF9F9]" style={{ color: "#5D4037" }} autoFocus />
                    <button onClick={() => addReply(cm.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: "#A8DADC" }}>
                      <Send className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="写下你的想法…" className="flex-1 text-sm px-3 py-2 rounded-full border-2 border-[#F4A261]/50 outline-none bg-[#FFF8F0]" style={{ color: "#5D4037" }} />
              <button onClick={addComment} className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 flex-shrink-0" style={{ background: "#F4A261" }}>
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sketch Select ────────────────────────────────────────────────────────────

function SketchSelect({
  value,
  onChange,
  options,
  placeholder,
  minWidth = 64,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  minWidth?: number;
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 pl-2 sm:pl-3 pr-1.5 sm:pr-2 py-1 rounded-xl sm:rounded-2xl border-2 text-xs sm:text-sm transition-all whitespace-nowrap"
        style={{
          borderColor: value ? "#4A3728" : "#E0D0C0",
          background: value ? "#FFF8F0" : "white",
          color: value ? "#5D4037" : "#B0A090",
          boxShadow: value ? "2px 2px 0 #4A3728" : "none",
          transform: value ? "translate(-1px,-1px)" : "none",
          minWidth: `max(${minWidth}px, 85px)`,
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-transform"
          style={{ color: "#B0A090", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 rounded-2xl overflow-hidden z-30"
          style={{
            background: "white",
            border: "2px solid #4A3728",
            boxShadow: "3px 3px 0 #4A3728",
            minWidth: "100%",
          }}
        >
          {/* "全部" option */}
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#FFF8F0]"
            style={{ color: !value ? "#F4A261" : "#8B6F47", fontWeight: !value ? "600" : "400" }}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#FFF8F0]"
              style={{ color: value === opt.value ? "#F4A261" : "#8B6F47", fontWeight: value === opt.value ? "600" : "400" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Daily() {
  const [userRole, setUserRole] = useState<UserRole>(getCurrentUserRole());
  const [records, setRecords] = useState<DailyRecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [editingRecord, setEditingRecord] = useState<DailyRecordType | undefined>();
  const [deletingId, setDeletingId] = useState<number | string>(0);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  
  // 从 Supabase 加载记录
  useEffect(() => {
    async function loadRecords() {
      try {
        const data = await dailyRecordsService.getAll();
        if (data.length > 0) {
          // 不转换 id，保持字符串格式，添加空 comments
          const mappedData = data.map((r: any) => ({
            ...r,
            comments: []
          }));
          setRecords(mappedData);
        }
      } catch (error) {
        console.error('Failed to load records:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);
  
  // 监听用户角色变化
  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(getCurrentUserRole());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const openAdd = () => { setEditingRecord(undefined); setModalDate(""); setShowModal(true); };
  const openEdit = (record: DailyRecordType) => { setEditingRecord(record); setModalDate(""); setShowModal(true); };

  const handleSave = async (r: Omit<DailyRecordType, 'id' | 'created_at'>) => {
    try {
      // 移除 comments 字段，不发送到 Supabase
      const { comments, ...recordData } = r as any;
      
      if (editingRecord) {
        const updated = await dailyRecordsService.update(editingRecord.id.toString(), recordData);
        setRecords((prev) => prev.map((rec) => rec.id === editingRecord.id ? { ...rec, ...updated } : rec));
      } else {
        const created = await dailyRecordsService.create(recordData);
        // 不转换 id，添加空 comments
        const mappedCreated = {
          ...created,
          comments: []
        };
        setRecords((prev) => [mappedCreated, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (error) {
      console.error('Failed to save record:', error);
    }
  };

  const confirmDelete = async () => { 
    try {
      await dailyRecordsService.delete(deletingId.toString());
      setRecords((prev) => prev.filter((r) => r.id !== deletingId)); 
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
    setDeletingId(0); 
  };
  
  const updateRecord = (updated: DailyRecordType) => setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r));

  const thisMonth = "2026-03";
  const monthCount = records.filter((r) => r.date.startsWith(thisMonth)).length;
  const today = new Date("2026-03-11");
  const daysTogther = Math.ceil((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));

  // Derive dropdown options
  const allYears = Array.from(new Set(records.map((r) => r.date.split("-")[0]))).sort((a, b) => Number(b) - Number(a));
  const availableMonths = Array.from(
    new Set(
      records
        .filter((r) => !filterYear || r.date.startsWith(filterYear))
        .map((r) => r.date.split("-")[1])
    )
  ).sort((a, b) => Number(a) - Number(b));

  // Filter records
  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-");
    if (filterYear && ry !== filterYear) return false;
    if (filterMonth && rm !== filterMonth) return false;
    return true;
  });

  const grouped: Record<string, DailyRecord[]> = {};
  filtered.forEach((r) => { if (!grouped[r.date]) grouped[r.date] = []; grouped[r.date].push(r); });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8" style={{ color: "#F4A261" }} />
          <h1 className="text-4xl" style={{ color: "#5D4037", fontWeight: "700" }}>日常记录</h1>
        </div>
        <button onClick={openAdd} className="sketch-button px-5 py-2.5 flex items-center gap-2" style={{ background: "#F4A261", color: "white" }}>
          <Plus className="w-4 h-4" />添加记录
        </button>
      </div>
      <p className="text-base mb-6" style={{ color: "#B0A090" }}>记录我们的甜蜜日常</p>

      {/* Stats row — same style as Wishes cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="sketch-card p-4 text-center" style={{ background: "#E8F4F5" }}>
          <div className="text-3xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>{monthCount}</div>
          <div className="text-sm" style={{ color: "#8B6F47" }}>本月记录</div>
        </div>
        <div className="sketch-card p-4 text-center" style={{ background: "#FCF0F0" }}>
          <div className="text-3xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>{records.length}</div>
          <div className="text-sm" style={{ color: "#8B6F47" }}>总记录数</div>
        </div>
        <div className="sketch-card p-4 text-center" style={{ background: "#FFF9C4" }}>
          <div className="text-3xl mb-1" style={{ color: "#5D4037", fontWeight: "700" }}>{daysTogther}</div>
          <div className="text-sm" style={{ color: "#8B6F47" }}>相恋天数</div>
        </div>
      </div>

      {/* Year + Month dropdown filter */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm flex-shrink-0" style={{ color: "#8B6F47" }}>年份</label>
          <SketchSelect
            value={filterYear}
            onChange={(v) => { setFilterYear(v); setFilterMonth(""); }}
            options={allYears.map((y) => ({ value: y, label: `${y}年` }))}
            placeholder="全部年份"
            minWidth={96}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm flex-shrink-0" style={{ color: "#8B6F47" }}>月份</label>
          <SketchSelect
            value={filterMonth}
            onChange={setFilterMonth}
            options={availableMonths.map((m) => ({ value: m, label: `${parseInt(m)}月` }))}
            placeholder="全部月份"
            minWidth={96}
          />
        </div>
      </div>

      {/* Timeline */}
      <div id="timeline-top" />
      {filtered.length === 0 ? (
        <div className="sketch-card p-14 text-center" style={{ background: "white" }}>
          <div className="text-5xl mb-4">🐾</div>
          <p className="text-lg mb-2" style={{ color: "#8B6F47" }}>这个月还没有记录哦～</p>
          <p className="text-sm" style={{ color: "#C0B0A0" }}>点击右上角「添加记录」开始记录美好吧！</p>
        </div>
      ) : (
        <div className="relative">
          {/* Axis line */}
          <div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              left: "19px",
              width: "3px",
              background: "linear-gradient(to bottom, #F4A261 0%, #F4C2C2 50%, #A8DADC 100%)",
              opacity: 0.65,
            }}
          />

          {sortedDates.map((date) => {
            const [y, m, d] = date.split("-").map(Number);
            const daysFromStart = calcDaysFromStart(date);
            const dateRecords = grouped[date];

            return (
              <div key={date} id={`date-${date}`} className="mb-2">
                {/* Date node - 轴线连接点 */}
                <div className="flex items-center mb-3">
                  <div
                    className="flex-shrink-0 relative z-10"
                    style={{ width: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: "#FFF8F0",
                        border: "3px solid #4A3728",
                        boxShadow: "0 0 0 3px rgba(244,162,97,0.35)",
                      }}
                    />
                  </div>
                  <div className="flex items-baseline gap-2 flex-1 pl-1">
                    <span style={{ fontSize: "clamp(1.8rem,4.5vw,2.8rem)", color: "#5D4037", fontWeight: "700", lineHeight: 1 }}>{d}</span>
                    <span className="text-sm" style={{ color: "#B0A090" }}>{y}年{String(m).padStart(2, "0")}月</span>
                    <span className="ml-auto text-xs pr-1" style={{ color: "#C0B0A0" }}>
                      相恋第 <span style={{ color: "#F4A261", fontWeight: "600" }}>{daysFromStart}</span> 天
                    </span>
                  </div>
                </div>

                {/* Records */}
                {dateRecords.map((record) => (
                  <div key={record.id} className="flex gap-3 mb-4">
                    {/* Avatar on axis */}
                    <div className="flex-shrink-0 flex justify-center" style={{ width: "40px" }}>
                      <AuthorAvatar author={record.author} />
                    </div>
                    {/* Card */}
                    <div className="flex-1 min-w-0">
                      <RecordCard
                        record={record}
                        onEdit={() => openEdit(record)}
                        onDelete={() => setDeletingId(record.id)}
                        onUpdate={updateRecord}
                        userRole={userRole}
                      />
                    </div>
                  </div>
                ))}

                <div style={{ height: "8px" }} />
              </div>
            );
          })}

          {/* End dot */}
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#A8DADC", border: "2px solid #4A3728", marginLeft: "15px", position: "relative", zIndex: 10 }} />
        </div>
      )}

      {showModal && (
        <RecordModal
          initialDate={modalDate || undefined}
          editRecord={editingRecord}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {deletingId !== 0 && <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(0)} />}

      {/* Bottom banner */}
      <div className="sketch-card p-8 text-center mt-6"
        style={{ background: "linear-gradient(135deg, #FFF0E6 0%, #FCF0F0 100%)" }}>
        <Camera className="w-12 h-12 mx-auto mb-3" style={{ color: "#F4A261" }} />
        <h3 className="text-2xl mb-2" style={{ color: "#5D4037", fontWeight: "600" }}>
          记录每一个平凡的美好
        </h3>
        <p className="text-base" style={{ color: "#8B6F47" }}>
          日常里的每一个小细节，都是我们故事里最珍贵的章节 🧡
        </p>
      </div>
    </>
  );
}