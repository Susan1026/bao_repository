import { useState, useRef } from "react";
import {
  Heart, Plus, MapPin, Utensils, Star, X, Edit2, Trash2, Smile,
  Camera, ClipboardList, AlertTriangle, ChevronLeft, ChevronRight,
  Upload, ImageIcon,
} from "lucide-react";
import { albumsService, photosService, activitiesService, checkinsService, storageService } from "../../lib/services";
// 本地默认图片
const albumDefaultCover = "/images/album_default.jpg";
const activityDefaultCover = "/images/activity_default.jpg";

// 保留原来的网络图片用于示例数据
const dogPlane     = "https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";
const dogPicnic    = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";
const dogNight     = "https://images.unsplash.com/photo-1561037404-61cd46aa615b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";

type TabKey = "album" | "activities" | "checkin";

interface Photo {
  id: number;
  albumId: number;
  url: string;
}

interface Album {
  id: number;
  title: string;
  description: string;
  coverPhotoId: number | null;
  color: string;
}

interface Activity {
  id: number;
  title: string;
  date: string;
  note: string;
  location?: string;
  image?: string;
  completed?: boolean;
  tagId?: string;
}

interface CheckinTag {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  icon: string;
}

interface Checkin {
  id: number;
  name: string;
  tagId: string;
  date: string;
  location: string;
  rating: number;
  review: string;
}

// ─── Demo image URLs ──────────────────────────────────────────────────────────

const IMG_SUNSET  = "https://images.unsplash.com/photo-1658851866325-49fb8b7fbcb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_PARK    = "https://images.unsplash.com/photo-1766360635584-72218e8bad46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_TRAVEL  = "https://images.unsplash.com/photo-1692685820422-61b43dff3fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_NIGHT   = "https://images.unsplash.com/photo-1688549450664-8189b4ac4751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_FOOD    = "https://images.unsplash.com/photo-1681219916718-07dded87e8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_CAFE    = "https://images.unsplash.com/photo-1766471804320-1f85e39da334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_PICNIC  = "https://images.unsplash.com/photo-1716582873749-f4fb77fe9957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_BLOSSOM = "https://images.unsplash.com/photo-1709435842605-72b57594f0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";

// ─── Init data ────────────────────────────────────────────────────────────────

const INIT_PHOTOS: Photo[] = [
  { id: 1,  albumId: 1, url: IMG_SUNSET },
  { id: 2,  albumId: 1, url: IMG_PARK },
  { id: 3,  albumId: 1, url: albumDefaultCover },
  { id: 4,  albumId: 2, url: IMG_TRAVEL },
  { id: 5,  albumId: 2, url: IMG_NIGHT },
  { id: 6,  albumId: 2, url: dogPlane },
  { id: 7,  albumId: 3, url: IMG_FOOD },
  { id: 8,  albumId: 3, url: IMG_CAFE },
  { id: 9,  albumId: 3, url: IMG_PICNIC },
  { id: 10, albumId: 3, url: dogPicnic },
  { id: 11, albumId: 4, url: IMG_BLOSSOM },
  { id: 12, albumId: 4, url: dogNight },
];

const INIT_ALBUMS: Album[] = [
  { id: 1, title: "我们的相册",  description: "记录每一个平凡而温馨的日子", coverPhotoId: 1,    color: "#FFE6F0" },
  { id: 2, title: "旅行时光",   description: "一起走过的风景",             coverPhotoId: 4,    color: "#E3F2FD" },
  { id: 3, title: "美食记录",   description: "一起吃过的美味",             coverPhotoId: 7,    color: "#FFF9C4" },
  { id: 4, title: "浪漫时刻",   description: "那些心动的瞬间",             coverPhotoId: 11,   color: "#F3E5F5" },
];

const INIT_ACTIVITIES: Activity[] = [
  { id: 1, title: "一起看了《你好，李焕英》", date: "2026-01-20", note: "看到一半你哭了，我假装没哭" },
  { id: 2, title: "春日野餐",                  date: "2026-03-08", note: "带了炸鸡和草莓，在公园里赖了一整个下午" },
  { id: 3, title: "一起骑了共享单车",           date: "2025-11-03", note: "骑了差不多两个小时，你说很累但一直在笑" },
  { id: 4, title: "去游乐园玩过山车",           date: "2025-10-01", note: "你说不怕，结果第一个叫出来的是你" },
];

const INIT_TAGS: CheckinTag[] = [
  { id: "景点", name: "景点", bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB", icon: "🗺️" },
  { id: "餐厅", name: "餐厅", bg: "#FFF9C4", text: "#F57F17", border: "#FFF176", icon: "🍽️" },
  { id: "其他", name: "其他", bg: "#F5F0EB", text: "#7B5E3A", border: "#E8D9C8", icon: "✨" },
];

const INIT_CHECKINS: Checkin[] = [
  { id: 1, name: "西湖断桥",        tagId: "景点", date: "2026-02-05", location: "杭州", rating: 5, review: "雪后的断桥真的太美了，值得一去再去" },
  { id: 2, name: "外婆家（杭帮菜）", tagId: "餐厅", date: "2026-02-05", location: "杭州", rating: 4, review: "东坡肉超级入味，服务也好，就是有点贵" },
  { id: 3, name: "乌镇景区",        tagId: "景点", date: "2025-12-20", location: "嘉兴", rating: 4, review: "夜游乌镇很有感觉，人稍微有点多" },
  { id: 4, name: "喜茶（西湖店）",   tagId: "餐厅", date: "2026-02-06", location: "杭州", rating: 3, review: "排了半小时，多肉葡萄还是一如既往的好喝" },
  { id: 5, name: "灵隐寺",          tagId: "景点", date: "2025-09-18", location: "杭州", rating: 5, review: "氛围感很强，早上去人不多，非常推荐" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAlbumCover(album: Album, photos: Photo[]): string {
  if (album.coverPhotoId !== null) {
    const p = photos.find((ph) => ph.id === album.coverPhotoId && ph.albumId === album.id);
    if (p) return p.url;
  }
  const first = photos.find((ph) => ph.albumId === album.id);
  // 没有照片时使用本地默认图片
  return first?.url ?? albumDefaultCover;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}>
          <Star className="w-4 h-4" style={{ color: n <= value ? "#FFD54F" : "#E0D0C0" }} fill={n <= value ? "#FFD54F" : "none"} />
        </button>
      ))}
    </div>
  );
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sketch-card w-full max-w-xs p-6 flex flex-col items-center gap-5" style={{ background: "#FFF8F0" }} onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#FCF0F0", border: "2.5px solid #F4C2C2" }}>
          <AlertTriangle className="w-7 h-7" style={{ color: "#E25C7C" }} />
        </div>
        <div className="text-center">
          <h3 className="text-xl mb-1" style={{ color: "#5D4037" }}>确认删除？</h3>
          <p className="text-sm" style={{ color: "#B0A090" }}>「{name}」删除后无法恢复哦～</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>再想想</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-all"
            style={{ background: "#F4C2C2", color: "#5D4037" }}>确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ─── CreateAlbumModal ─────────────────────────────────────────────────────────

function CreateAlbumModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (a: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc,  setDesc]  = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-sm" style={{ background: "#FFF8F0" }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>📷 创建相册</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>
        <div className="px-6 space-y-4 pb-4">
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>相册名称 <span style={{ color: "#E25C7C" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="给相册起个名字…" className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: title ? "#F4A261" : "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>简介（可选）</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="描述一下这个相册…" className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button onClick={() => { if (title.trim()) { onSave({ title: title.trim(), description: desc.trim() }); onClose(); } }}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all disabled:opacity-40"
            style={{ background: "#F4C2C2", color: "#5D4037", fontWeight: "600" }}>创建 ✨</button>
        </div>
      </div>
    </div>
  );
}

// ─── EditAlbumModal ───────────────────────────────────────────────────────────

function EditAlbumModal({ album, photos, onClose, onSave }: {
  album: Album;
  photos: Photo[];
  onClose: () => void;
  onSave: (data: { title: string; description: string; coverPhotoId: number | null }) => void;
}) {
  const [title,        setTitle]       = useState(album.title);
  const [desc,         setDesc]        = useState(album.description);
  const [coverPhotoId, setCoverPhotoId] = useState<number | null>(album.coverPhotoId);
  const albumPhotos = photos.filter((p) => p.albumId === album.id);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-lg flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>✏️ 编辑相册</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>相册名称 <span style={{ color: "#E25C7C" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: title ? "#F4A261" : "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>简介</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          {/* Cover selection */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>选择封面</label>
            <div className="grid grid-cols-3 gap-2">
              {/* Default option */}
              <button
                onClick={() => setCoverPhotoId(null)}
                className="relative aspect-square rounded-2xl overflow-hidden border-2 transition-all"
                style={{ borderColor: coverPhotoId === null ? "#4A3728" : "#E0D0C0", boxShadow: coverPhotoId === null ? "3px 3px 0 #4A3728" : "none" }}>
                <img src={albumDefaultCover} className="w-full h-full object-cover" alt="默认" />
                <div className="absolute inset-0 flex items-end justify-center pb-1"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}>
                  <span className="text-xs text-white">默认</span>
                </div>
                {coverPhotoId === null && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#F4A261", border: "1.5px solid #4A3728" }}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
              {albumPhotos.map((photo) => (
                <button key={photo.id}
                  onClick={() => setCoverPhotoId(photo.id)}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 transition-all"
                  style={{ borderColor: coverPhotoId === photo.id ? "#4A3728" : "#E0D0C0", boxShadow: coverPhotoId === photo.id ? "3px 3px 0 #4A3728" : "none" }}>
                  <img src={photo.url} className="w-full h-full object-cover" alt="选项" />
                  {coverPhotoId === photo.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#F4A261", border: "1.5px solid #4A3728" }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {albumPhotos.length === 0 && (
              <p className="text-xs mt-1" style={{ color: "#B0A090" }}>相册中还没有照片，先添加照片后再选封面吧～</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button
            onClick={() => { if (title.trim()) { onSave({ title: title.trim(), description: desc.trim(), coverPhotoId }); onClose(); } }}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all disabled:opacity-40"
            style={{ background: "#F4C2C2", color: "#5D4037", fontWeight: "600" }}>保存修改 ✨</button>
        </div>
      </div>
    </div>
  );
}

// ─── AddPhotoModal ────────────────────────────────────────────────────────────

function AddPhotoModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput,   setUrlInput]   = useState("");
  const [tab,        setTab]        = useState<"upload" | "url">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const currentUrl = tab === "upload" ? previewUrl : (urlInput.trim() || null);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-sm flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>🖼️ 添加照片</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
          {/* Tab switch */}
          <div className="flex rounded-2xl overflow-hidden border-2 border-[#4A3728]">
            {(["upload", "url"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 text-sm transition-colors"
                style={{
                  background: tab === t ? "#F4A261" : "white",
                  color: tab === t ? "white" : "#8B6F47",
                  fontWeight: tab === t ? "700" : "400",
                }}>
                {t === "upload" ? "📁 本地上传" : "🔗 图片链接"}
              </button>
            ))}
          </div>

          {tab === "upload" ? (
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#4A3728]" style={{ aspectRatio: "4/3" }}>
                  <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                  <button onClick={() => { setPreviewUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "#F4C2C2", border: "1.5px solid #4A3728" }}>
                    <X className="w-3.5 h-3.5" style={{ color: "#5D4037" }} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-colors hover:bg-[#F4C2C2]/10"
                  style={{ borderColor: "#F4A261" }}>
                  <Upload className="w-8 h-8" style={{ color: "#F4A261" }} />
                  <span className="text-sm" style={{ color: "#8B6F47" }}>点击选择照片</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>图片 URL</label>
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-sm"
                style={{ borderColor: urlInput ? "#F4A261" : "rgba(244,162,97,0.4)", color: "#5D4037" }} />
              {urlInput.trim() && (
                <div className="mt-2 rounded-2xl overflow-hidden border-2 border-[#E0D0C0]" style={{ aspectRatio: "4/3" }}>
                  <img src={urlInput.trim()} className="w-full h-full object-cover" alt="preview"
                    onError={(e) => { (e.target as HTMLImageElement).src = albumDefaultCover; }} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button
            onClick={() => { if (currentUrl) { onAdd(currentUrl); onClose(); } }}
            disabled={!currentUrl}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all disabled:opacity-40"
            style={{ background: "#F4C2C2", color: "#5D4037", fontWeight: "600" }}>添加 🌟</button>
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ photos, startIndex, onClose }: {
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const photo = photos[idx];
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div className="fixed inset-0 bg-black/85 flex flex-col items-center justify-center z-[60] p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Nav */}
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="max-w-2xl w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt="查看照片"
          className="max-h-[70vh] w-full object-contain rounded-2xl"
          style={{ border: "3px solid rgba(255,255,255,0.2)" }} />
        <p className="text-white/50 text-sm">{idx + 1} / {photos.length}</p>
      </div>
    </div>
  );
}

// ─── AlbumDetail ──────────────────────────────────────────────────────────────

function AlbumDetail({ album, photos, onBack, onUpdateAlbum, onAddPhoto, onDeletePhoto, onSetCover }: {
  album: Album;
  photos: Photo[];
  onBack: () => void;
  onUpdateAlbum: (data: { title: string; description: string; coverPhotoId: number | null }) => void;
  onAddPhoto: (url: string) => void;
  onDeletePhoto: (id: number) => void;
  onSetCover: (photoId: number) => void;
}) {
  const [showEdit,    setShowEdit]    = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const albumPhotos = photos.filter((p) => p.albumId === album.id);
  const deletingPhoto = albumPhotos.find((p) => p.id === deletePhotoId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-[#4A3728] hover:-translate-x-0.5 transition-transform"
          style={{ background: "white" }}>
          <ChevronLeft className="w-5 h-5" style={{ color: "#5D4037" }} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl" style={{ color: "#5D4037", fontWeight: "700" }}>{album.title}</h2>
          {album.description && <p className="text-sm" style={{ color: "#B0A090" }}>{album.description}</p>}
        </div>
        <button onClick={() => setShowEdit(true)}
          className="sketch-button px-4 py-2 flex items-center gap-1.5 text-sm"
          style={{ background: "#A8DADC", color: "#5D4037" }}>
          <Edit2 className="w-3.5 h-3.5" />编辑
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-base" style={{ color: "#8B6F47" }}>
          共 {albumPhotos.length} 张照片
          {album.coverPhotoId !== null && <span className="ml-2 text-sm" style={{ color: "#B0A090" }}>· 已设封面</span>}
        </p>
        <button onClick={() => setShowAddPhoto(true)}
          className="sketch-button px-4 py-2 flex items-center gap-2 text-sm"
          style={{ background: "#F4C2C2", color: "#5D4037" }}>
          <Plus className="w-4 h-4" />添加照片
        </button>
      </div>

      {/* Photo grid */}
      {albumPhotos.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {albumPhotos.map((photo, i) => {
            const isCover = album.coverPhotoId === photo.id;
            return (
              <div key={photo.id}
                className="relative group rounded-2xl overflow-hidden border-2 cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ borderColor: isCover ? "#F4A261" : "#E0D0C0", aspectRatio: "1" }}>
                <img src={photo.url} alt="照片"
                  className="w-full h-full object-cover"
                  onClick={() => setLightboxIdx(i)} />

                {/* Cover badge */}
                {isCover && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs border border-[#4A3728]"
                    style={{ background: "#F4A261", color: "white" }}>封面</div>
                )}

                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    title="删除"
                    onClick={(e) => { e.stopPropagation(); setDeletePhotoId(photo.id); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid #4A3728" }}>
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "#E25C7C" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sketch-card p-16 flex flex-col items-center gap-4" style={{ background: "white" }}>
          <img src={albumDefaultCover} className="w-24 h-24 object-contain opacity-60" alt="empty" />
          <div className="text-center">
            <p className="text-base" style={{ color: "#8B6F47" }}>还没有照片，快来添加吧～</p>
            <p className="text-sm mt-1" style={{ color: "#B0A090" }}>可以上传本地照片或粘贴图片链接</p>
          </div>
          <button onClick={() => setShowAddPhoto(true)}
            className="sketch-button px-5 py-2.5 flex items-center gap-2"
            style={{ background: "#F4C2C2", color: "#5D4037" }}>
            <Plus className="w-4 h-4" />添加第一张照片
          </button>
        </div>
      )}

      {/* Modals */}
      {showEdit && (
        <EditAlbumModal album={album} photos={photos}
          onClose={() => setShowEdit(false)}
          onSave={(data) => { onUpdateAlbum(data); setShowEdit(false); }} />
      )}
      {showAddPhoto && (
        <AddPhotoModal onClose={() => setShowAddPhoto(false)} onAdd={onAddPhoto} />
      )}
      {lightboxIdx !== null && (
        <Lightbox photos={albumPhotos} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
      {deletePhotoId !== null && deletingPhoto && (
        <DeleteModal name={"这张照片"}
          onConfirm={() => { onDeletePhoto(deletePhotoId); setDeletePhotoId(null); }}
          onCancel={() => setDeletePhotoId(null)} />
      )}
    </div>
  );
}

// ─── AlbumTab ─────────────────────────────────────────────────────────────────

function AlbumTab() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAlbumId, setOpenAlbumId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editAlbumId, setEditAlbumId] = useState<number | null>(null);

  // 从 Supabase 加载数据
  useEffect(() => {
    async function loadData() {
      try {
        const [albumsData, allPhotos] = await Promise.all([
          albumsService.getAll(),
          Promise.all((await albumsService.getAll()).map(async (album) => {
            const photosData = await photosService.getByAlbumId(album.id);
            return photosData.map(p => ({ ...p, albumId: parseInt(album.id.slice(0, 8), 16) }));
          })).then(p => p.flat())
        ]);
        
        if (albumsData.length > 0) {
          setAlbums(albumsData.map(a => ({
            ...a,
            id: parseInt(a.id.slice(0, 8), 16),
            coverPhotoId: a.cover_photo_id ? parseInt(a.cover_photo_id.slice(0, 8), 16) : null
          })));
          setPhotos(allPhotos.map(p => ({
            ...p,
            id: parseInt(p.id.slice(0, 8), 16),
            albumId: parseInt(p.album_id.slice(0, 8), 16)
          })));
        }
      } catch (error) {
        console.error('Failed to load albums:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const COLORS = ["#FFE6F0", "#E3F2FD", "#FFF9C4", "#F3E5F5", "#E8F5E9", "#FFF3E0"];

  const handleCreate = async (a: { title: string; description: string }) => {
    try {
      const created = await albumsService.create({
        title: a.title,
        description: a.description,
        color: COLORS[albums.length % COLORS.length]
      });
      setAlbums((prev) => [...prev, { ...created, id: parseInt(created.id.slice(0, 8), 16), coverPhotoId: null }]);
    } catch (error) {
      console.error('Failed to create album:', error);
    }
  };

  const handleUpdateAlbum = async (albumId: number, data: { title: string; description: string; coverPhotoId: number | null }) => {
    try {
      await albumsService.update(albumId.toString(), {
        title: data.title,
        description: data.description,
        cover_photo_id: data.coverPhotoId ? data.coverPhotoId.toString() : null
      });
      setAlbums((prev) => prev.map((a) => a.id === albumId ? { ...a, ...data } : a));
    } catch (error) {
      console.error('Failed to update album:', error);
    }
  };

  const handleAddPhoto = async (albumId: number, url: string) => {
    try {
      const created = await photosService.create({
        album_id: (await albumsService.getAll())[Math.floor(albumId / 10000000)]?.id || '',
        url
      });
      setPhotos((prev) => [...prev, { ...created, id: parseInt(created.id.slice(0, 8), 16), albumId }]);
    } catch (error) {
      console.error('Failed to add photo:', error);
    }
  };

  const handleDeletePhoto = async (albumId: number, photoId: number) => {
    try {
      await photosService.delete(photoId.toString());
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setAlbums((prev) => prev.map((a) =>
        a.id === albumId && a.coverPhotoId === photoId ? { ...a, coverPhotoId: null } : a
      ));
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleSetCover = (albumId: number, photoId: number) => {
    setAlbums((prev) => prev.map((a) => a.id === albumId ? { ...a, coverPhotoId: photoId } : a));
  };

  const openAlbum = albums.find((a) => a.id === openAlbumId);
  const editingAlbum = albums.find((a) => a.id === editAlbumId);
  const deletingAlbum = albums.find((a) => a.id === deleteId);

  // ── Album detail view ──
  if (openAlbum) {
    return (
      <AlbumDetail
        album={openAlbum}
        photos={photos}
        onBack={() => setOpenAlbumId(null)}
        onUpdateAlbum={(data) => handleUpdateAlbum(openAlbum.id, data)}
        onAddPhoto={(url) => handleAddPhoto(openAlbum.id, url)}
        onDeletePhoto={(photoId) => handleDeletePhoto(openAlbum.id, photoId)}
        onSetCover={(photoId) => handleSetCover(openAlbum.id, photoId)}
      />
    );
  }

  // ── Album list view ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-base" style={{ color: "#8B6F47" }}>共 {albums.length} 个相册</p>
        <button onClick={() => setShowCreate(true)}
          className="sketch-button px-4 py-2 flex items-center gap-2 text-sm"
          style={{ background: "#F4C2C2", color: "#5D4037" }}>
          <Plus className="w-4 h-4" />创建相册
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {albums.map((album) => {
          const coverUrl = getAlbumCover(album, photos);
          const count = photos.filter((p) => p.albumId === album.id).length;
          return (
            <div key={album.id}
              onClick={() => setOpenAlbumId(album.id)}
              className="sketch-card overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group"
              style={{ background: "white" }}>
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: album.color }}>
                <img src={coverUrl} alt={album.title} className="w-full h-full object-cover" />
                {/* Photo count badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm border-2 border-[#4A3728]"
                  style={{ background: "white", color: "#5D4037" }}>
                  {count} 张
                </div>
                {/* 编辑/删除按钮 - 移动端在照片上 */}
                <div className="absolute top-2 left-2 flex gap-1 sm:hidden z-10" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); setEditAlbumId(album.id); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "#F4A26180" }}>
                    <Edit2 className="w-3 h-3" style={{ color: "#F4A261" }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(album.id); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "#F4C2C280" }}>
                    <Trash2 className="w-3 h-3" style={{ color: "#E25C7C" }} />
                  </button>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity sm:hidden"
                  style={{ background: "rgba(0,0,0,0.2)" }}>
                  <div className="px-4 py-2 rounded-2xl border-2 border-white text-white text-sm"
                    style={{ backdropFilter: "blur(4px)", background: "rgba(255,255,255,0.15)" }}>
                    查看照片
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-5 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-xl mb-0.5 sm:mb-1" style={{ color: "#5D4037", fontWeight: "600" }}>{album.title}</h3>
                  <p className="text-xs sm:text-base" style={{ color: "#8B6F47" }}>{album.description}</p>
                </div>
                {/* PC端编辑/删除按钮 */}
                <div className="hidden sm:flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setEditAlbumId(album.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "#F4A26120" }}>
                    <Edit2 className="w-4 h-4" style={{ color: "#F4A261" }} />
                  </button>
                  <button onClick={() => setDeleteId(album.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "#F4C2C240" }}>
                    <Trash2 className="w-4 h-4" style={{ color: "#E25C7C" }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateAlbumModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editAlbumId !== null && editingAlbum && (
        <EditAlbumModal
          album={editingAlbum}
          photos={photos}
          onClose={() => setEditAlbumId(null)}
          onSave={(data) => {
            handleUpdateAlbum(editingAlbum.id, data);
            setEditAlbumId(null);
          }}
        />
      )}
      {deleteId !== null && deletingAlbum && (
        <DeleteModal name={deletingAlbum.title}
          onConfirm={() => {
            setAlbums((p) => p.filter((a) => a.id !== deleteId));
            setPhotos((p) => p.filter((ph) => ph.albumId !== deleteId));
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

// ─── ActivitiesTab ────────────────────────────────────────────────────────────

function ActivityModal({ editItem, tags, onClose, onSave, onManageTags }: {
  editItem?: Activity;
  tags: CheckinTag[];
  onClose: () => void;
  onSave: (a: Omit<Activity, "id">) => void;
  onManageTags: () => void;
}) {
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [date, setDate] = useState(editItem?.date ?? new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(editItem?.note ?? "");
  const [location, setLocation] = useState(editItem?.location ?? "");
  const [image, setImage] = useState(editItem?.image ?? "");
  const [completed, setCompleted] = useState(editItem?.completed ?? false);
  const [tagId, setTagId] = useState(editItem?.tagId ?? (tags.length > 0 ? tags[0].id : ""));
  const imgRef = useRef<HTMLInputElement>(null);

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sketch-card w-full max-w-sm flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>{editItem ? "✏️ 编辑活动" : "✨ 添加活动"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
          {/* 标签选择 */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>标签</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const sel = tagId === t.id;
                return (
                  <button key={t.id} onClick={() => setTagId(t.id)}
                    className="py-1.5 px-3 rounded-full border-2 text-sm flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: sel ? t.bg : "white", borderColor: sel ? "#4A3728" : t.border, color: sel ? t.text : "#8B6F47",
                      boxShadow: sel ? "2px 2px 0 #4A3728" : "none", transform: sel ? "translate(-1px,-1px)" : "none", fontWeight: sel ? "700" : "400" }}>
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
              <button onClick={onManageTags}
                className="py-1.5 px-3 rounded-full border-2 border-dashed text-sm flex items-center gap-1 transition-all hover:bg-[#F4C2C2]/20"
                style={{ borderColor: "#E0D0C0", color: "#8B6F47" }}>
                ⚙️ 管理标签
              </button>
            </div>
            {tags.length === 0 && <p className="text-xs text-[#E25C7C]">请先去管理标签中添加至少一个标签</p>}
          </div>

          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>活动名称 <span style={{ color: "#E25C7C" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="一起去看日出…"
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: title ? "#F4A261" : "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>地点</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="在哪里完成的？"
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>

          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>备注</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="记录一下当时的心情…"
              rows={3} className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base resize-none"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>上传照片（仅支持一张）</label>
            {image ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#E0D0C0]">
                <img src={image} className="w-full h-full object-cover" alt="活动" />
                <button onClick={() => setImage("")} className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => imgRef.current?.click()} className="w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors" style={{ borderColor: "rgba(244,162,97,0.4)" }}>
                <ImageIcon className="w-8 h-8 opacity-40 mb-2" style={{ color: "#5D4037" }} />
                <span className="text-xs" style={{ color: "#8B6F47" }}>点击上传照片</span>
              </div>
            )}
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button onClick={() => { if (title.trim()) { onSave({ title: title.trim(), date, note, location: location.trim(), image, completed, tagId }); onClose(); } }}
            disabled={!title.trim() || !tagId}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all disabled:opacity-40"
            style={{ background: "#A8DADC", color: "#5D4037", fontWeight: "600" }}>
            {editItem ? "保存修改 ✨" : "保存活动 🌟"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivitiesTab({ tags, onManageTags }: { tags: CheckinTag[]; onManageTags: () => void }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Activity | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterTag, setFilterTag] = useState<string>("全部");

  // 从 Supabase 加载数据
  useEffect(() => {
    async function loadData() {
      try {
        const data = await activitiesService.getAll();
        if (data.length > 0) {
          setItems(data.map(a => ({
            ...a,
            id: parseInt(a.id.slice(0, 8), 16),
            tagId: a.tag_id || ''
          })));
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (data: Omit<Activity, "id">) => {
    try {
      if (editItem) {
        await activitiesService.toggleComplete(editItem.id.toString(), data.completed);
        setItems((p) => p.map((a) => a.id === editItem.id ? { ...a, ...data } : a));
      } else {
        const created = await activitiesService.create({
          title: data.title,
          date: data.date,
          note: data.note,
          location: data.location,
          image: data.image,
          completed: data.completed,
          tag_id: data.tagId
        });
        setItems((p) => [...p, { ...created, id: parseInt(created.id.slice(0, 8), 16), tagId: created.tag_id || '' }]);
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  };

  const handleToggle = async (id: number) => {
    const item = items.find(a => a.id === id);
    if (!item) return;
    try {
      await activitiesService.toggleComplete(id.toString(), !item.completed);
      setItems((p) => p.map((a) => a.id === id ? { ...a, completed: !a.completed } : a));
    } catch (error) {
      console.error('Failed to toggle activity:', error);
    }
  };

  const deletingItem = items.find((a) => a.id === deleteId);
  const filtered = filterTag === "全部" ? items : items.filter((c) => c.tagId === filterTag);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-1 sm:gap-2 flex-wrap max-w-[50%] sm:max-w-[65%]">
          <button onClick={() => setFilterTag("全部")}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-2 text-xs sm:text-sm flex items-center gap-1 transition-all"
            style={{ background: filterTag === "全部" ? "#A8DADC" : "white",
              borderColor: filterTag === "全部" ? "#4A3728" : "#E0D0C0",
              color: filterTag === "全部" ? "#5D4037" : "#8B6F47",
              boxShadow: filterTag === "全部" ? "2px 2px 0 #4A3728" : "none", transform: filterTag === "全部" ? "translate(-1px,-1px)" : "none",
              fontWeight: filterTag === "全部" ? "700" : "400" }}>
            全部
          </button>
          {tags.map((t) => {
            const isActive = filterTag === t.id;
            return (
              <button key={t.id} onClick={() => setFilterTag(t.id)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-2 text-xs sm:text-sm flex items-center gap-1 transition-all"
                style={{ background: isActive ? t.bg : "white",
                  borderColor: isActive ? "#4A3728" : t.border,
                  color: isActive ? t.text : "#8B6F47",
                  boxShadow: isActive ? "2px 2px 0 #4A3728" : "none", transform: isActive ? "translate(-1px,-1px)" : "none",
                  fontWeight: isActive ? "700" : "400" }}>
                <span>{t.icon}</span>{t.name}
              </button>
            );
          })}
          <button onClick={onManageTags}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-2 text-xs sm:text-sm flex items-center gap-1 transition-all"
            style={{ background: "white", borderColor: "#E0D0C0", color: "#8B6F47" }}>
            🏷️ 管理
          </button>
        </div>
        <button onClick={() => { setEditItem(undefined); setShowModal(true); }}
          className="sketch-button px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 text-xs sm:text-sm shrink-0"
          style={{ background: "#A8DADC", color: "#5D4037" }}>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />添加活动
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((item) => (
          <div key={item.id}
            onClick={() => { setEditItem(item); setShowModal(true); }}
            className="sketch-card overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer relative group flex flex-col"
            style={{ background: "white", padding: 0 }}>
            
            {/* Image banner */}
            <div className="relative w-full aspect-square border-b-2 bg-[#FFF8F0] flex items-center justify-center overflow-hidden"
              style={{ borderColor: "#F4E0D0" }}>
              <img src={item.image || activityDefaultCover} alt={item.title} className="w-full h-full object-cover" />
              
              {/* Completed checkmark - just a small indicator, no overlay */}
              {item.completed && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: "#4CAF50" }}>
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>

            {/* Content area */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="line-clamp-2 text-base leading-snug mb-2" style={{ color: "#5D4037", fontWeight: "600" }}>{item.title}</h3>
                {item.location && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#B0A090" }}>
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                {item.date && (
                  <div className="text-xs mt-1" style={{ color: "#B0A090" }}>
                    {item.date}
                  </div>
                )}
              </div>
              
              {/* Quick toggle check btn (stops event propagation so it doesn't open modal) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(item.id);
                }}
                className="self-end mt-3 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors z-10"
                style={{ 
                  borderColor: item.completed ? "#4A3728" : "#E0D0C0",
                  background: "white"
                }}
              >
                {item.completed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>

              {/* Delete btn - always show on mobile, hover on desktop */}
              <button onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                style={{ background: "#F4C2C2", border: "1.5px solid #4A3728" }}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#5D4037" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="sketch-card p-14 text-center" style={{ background: "white" }}>
          <div className="text-4xl mb-3">🌸</div>
          <p className="text-base" style={{ color: "#8B6F47" }}>还没记录任何活动，快来添加一件你们一起做过的事吧～</p>
        </div>
      )}

      {showModal && <ActivityModal editItem={editItem} tags={tags} onClose={() => setShowModal(false)} onSave={handleSave} onManageTags={onManageTags} />}
      {deleteId !== null && deletingItem && (
        <DeleteModal name={deletingItem.title}
          onConfirm={() => { setItems((p) => p.filter((a) => a.id !== deleteId)); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

// ─── CheckinTab ───────────────────────────────────────────────────────────────

const TAG_PALETTES = [
  { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
  { bg: "#FFF9C4", text: "#F57F17", border: "#FFF176" },
  { bg: "#F5F0EB", text: "#7B5E3A", border: "#E8D9C8" },
  { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD0" },
  { bg: "#F3E5F5", text: "#6A1B9A", border: "#E1BEE7" },
];
const TAG_ICONS = ["🗺️", "🍽️", "✨", "☕", "🛍️", "🎬", "📚", "🌳", "🎡", "🎤", "⛰️", "🏨"];

function ManageTagsModal({ tags, onClose, onSave, onDelete }: {
  tags: CheckinTag[];
  onClose: () => void;
  onSave: (t: Omit<CheckinTag, "id">) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(TAG_ICONS[0]);
  const [palette, setPalette] = useState(0);
  const [localTags, setLocalTags] = useState<CheckinTag[]>(tags);

  const handleAddTag = () => {
    if (name.trim()) {
      const newTag = { id: `temp_${Date.now()}`, name: name.trim(), icon, ...TAG_PALETTES[palette] };
      setLocalTags((p) => [...p, newTag]);
      setName("");
    }
  };

  const handleRemoveTag = (id: string) => {
    setLocalTags((p) => p.filter((t) => t.id !== id));
  };

  const handleConfirm = () => {
    localTags.forEach((t) => {
      if (!tags.find((ot) => ot.id === t.id)) {
        onSave({ name: t.name, icon: t.icon, bg: t.bg, text: t.text, border: t.border });
      }
    });
    tags.forEach((t) => {
      if (!localTags.find((lt) => lt.id === t.id)) {
        onDelete(t.id);
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sketch-card w-full max-w-sm flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>🏷️ 管理标签</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">
          <div className="space-y-2">
            <label className="text-xs block" style={{ color: "#8B6F47" }}>现有标签</label>
            <div className="flex flex-wrap gap-2">
              {localTags.map((t) => (
                <div key={t.id} className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm"
                  style={{ background: t.bg, borderColor: t.border, color: t.text }}>
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                  <button onClick={() => handleRemoveTag(t.id)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center border-2 border-[#E25C7C] text-[#E25C7C] opacity-100 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {localTags.length === 0 && <p className="text-sm text-[#B0A090]">暂无标签</p>}
          </div>
          <div className="pt-4" style={{ borderTop: "1.5px dashed #F4E0D0" }}>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>新建标签</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="标签名称..."
              className="w-full px-4 py-2.5 rounded-2xl border-2 bg-white outline-none text-sm mb-3"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
            
            <label className="text-xs block mb-1" style={{ color: "#8B6F47" }}>图标</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {TAG_ICONS.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white"
                  style={{ border: icon === ic ? "2px solid #F4A261" : "2px solid #E0D0C0", transform: icon === ic ? "translate(-1px,-1px)" : "none", boxShadow: icon === ic ? "2px 2px 0 #F4A261" : "none" }}>
                  {ic}
                </button>
              ))}
            </div>

            <label className="text-xs block mb-1" style={{ color: "#8B6F47" }}>颜色搭配</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {TAG_PALETTES.map((p, i) => (
                <button key={i} onClick={() => setPalette(i)} className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ background: p.bg, borderColor: palette === i ? p.text : p.border, transform: palette === i ? "scale(1.1)" : "scale(1)" }} />
              ))}
            </div>

            <button onClick={handleAddTag}
              disabled={!name.trim()}
              className="w-full py-2.5 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-all disabled:opacity-40"
              style={{ background: "#F4A261", color: "white", fontWeight: "600" }}>
              添加标签
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button onClick={handleConfirm} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all"
            style={{ background: "#FFD54F", color: "#5D4037", fontWeight: "600" }}>确认</button>
        </div>
      </div>
    </div>
  );
}

function CheckinModal({ editItem, tags, onClose, onSave }: {
  editItem?: Checkin;
  tags: CheckinTag[];
  onClose: () => void;
  onSave: (c: Omit<Checkin, "id">) => void;
}) {
  const [name, setName] = useState(editItem?.name ?? "");
  const [tagId, setTagId] = useState(editItem?.tagId ?? (tags.length > 0 ? tags[0].id : ""));
  const [date, setDate] = useState(editItem?.date ?? "");
  const [location, setLocation] = useState(editItem?.location ?? "");
  const [rating, setRating] = useState(editItem?.rating ?? 5);
  const [review, setReview] = useState(editItem?.review ?? "");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sketch-card w-full max-w-md flex flex-col" style={{ background: "#FFF8F0", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl" style={{ color: "#5D4037" }}>{editItem ? "✏️ 编辑打卡" : "📍 添加打卡"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
            <X className="w-4 h-4" style={{ color: "#5D4037" }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>标签类型</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const sel = tagId === t.id;
                return (
                  <button key={t.id} onClick={() => setTagId(t.id)}
                    className="py-1.5 px-3 rounded-full border-2 text-sm flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: sel ? t.bg : "white", borderColor: sel ? "#4A3728" : t.border, color: sel ? t.text : "#8B6F47",
                      boxShadow: sel ? "2px 2px 0 #4A3728" : "none", transform: sel ? "translate(-1px,-1px)" : "none", fontWeight: sel ? "700" : "400" }}>
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
              {tags.length === 0 && <p className="text-xs text-[#E25C7C]">请先去管理标签中添加至少一个标签</p>}
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>名称 <span style={{ color: "#E25C7C" }}>*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="地点名称…"
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: name ? "#F4A261" : "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>地点</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="详细地址或城市…"
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>打卡日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037", fontFamily: "inherit" }} />
          </div>
          <div>
            <label className="text-xs block mb-2" style={{ color: "#8B6F47" }}>评分</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8B6F47" }}>测评 / 备注（可选）</label>
            <textarea value={review} onChange={(e) => setReview(e.target.value)}
              placeholder="写下你的感受、推荐理由、或注意事项…" rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none text-base resize-none"
              style={{ borderColor: "rgba(244,162,97,0.4)", color: "#5D4037" }} />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1.5px solid #F4E0D0" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-sm hover:-translate-y-0.5 transition-transform"
            style={{ color: "#5D4037", background: "white" }}>取消</button>
          <button onClick={() => { if (name.trim() && tagId) { onSave({ name: name.trim(), tagId, date, location: location.trim(), rating, review: review.trim() }); onClose(); } }}
            disabled={!name.trim() || !tagId}
            className="flex-1 py-3 rounded-2xl border-2 border-[#4A3728] text-base hover:-translate-y-0.5 transition-all disabled:opacity-40"
            style={{ background: "#FFD54F", color: "#5D4037", fontWeight: "600" }}>
            {editItem ? "保存修改 ✨" : "打卡！📍"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckinTab() {
  const [items, setItems] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<CheckinTag[]>(INIT_TAGS);
  const [filterTag, setFilterTag] = useState<string>("全部");
  const [showModal, setShowModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editItem, setEditItem] = useState<Checkin | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 从 Supabase 加载数据
  useEffect(() => {
    async function loadData() {
      try {
        const data = await checkinsService.getAll();
        if (data.length > 0) {
          setItems(data.map(c => ({
            ...c,
            id: parseInt(c.id.slice(0, 8), 16),
            tagId: c.tag_id
          })));
        }
      } catch (error) {
        console.error('Failed to load checkins:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (data: Omit<Checkin, "id">) => {
    try {
      if (editItem) {
        setItems((p) => p.map((c) => c.id === editItem.id ? { ...c, ...data } : c));
      } else {
        const created = await checkinsService.create({
          name: data.name,
          tag_id: data.tagId,
          date: data.date,
          location: data.location || '',
          rating: data.rating,
          review: data.review
        });
        setItems((p) => [...p, { ...created, id: parseInt(created.id.slice(0, 8), 16), tagId: created.tag_id }]);
      }
    } catch (error) {
      console.error('Failed to save checkin:', error);
    }
  };

  const handleAddTag = (t: Omit<CheckinTag, "id">) => {
    setTags((p) => [...p, { id: t.name, ...t }]);
  };

  const handleDeleteTag = (id: string) => {
    setTags((p) => p.filter((t) => t.id !== id));
    if (filterTag === id) setFilterTag("全部");
  };

  const filtered = filterTag === "全部" ? items : items.filter((c) => c.tagId === filterTag);
  const deletingItem = items.find((c) => c.id === deleteId);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-1 sm:gap-2 flex-wrap max-w-[50%] sm:max-w-[65%]">
          <button onClick={() => setFilterTag("全部")}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-2 text-xs sm:text-sm flex items-center gap-1 transition-all"
            style={{ background: filterTag === "全部" ? "#F4A261" : "white",
              borderColor: filterTag === "全部" ? "#4A3728" : "#E0D0C0",
              color: filterTag === "全部" ? "white" : "#8B6F47",
              boxShadow: filterTag === "全部" ? "2px 2px 0 #4A3728" : "none", transform: filterTag === "全部" ? "translate(-1px,-1px)" : "none",
              fontWeight: filterTag === "全部" ? "700" : "400" }}>
            全部
          </button>
          {tags.map((t) => {
            const isActive = filterTag === t.id;
            return (
              <button key={t.id} onClick={() => setFilterTag(t.id)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-2 text-xs sm:text-sm flex items-center gap-1 transition-all"
                style={{ background: isActive ? t.bg : "white",
                  borderColor: isActive ? "#4A3728" : t.border,
                  color: isActive ? t.text : "#8B6F47",
                  boxShadow: isActive ? "2px 2px 0 #4A3728" : "none", transform: isActive ? "translate(-1px,-1px)" : "none",
                  fontWeight: isActive ? "700" : "400" }}>
                <span>{t.icon}</span>{t.name}
              </button>
            );
          })}
          <button onClick={() => setShowTagModal(true)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-2 text-xs sm:text-sm flex items-center gap-1 transition-all"
            style={{ background: "white", borderColor: "#E0D0C0", color: "#8B6F47" }}>
            🏷️ 管理
          </button>
        </div>
        <button onClick={() => { setEditItem(undefined); setShowModal(true); }}
          className="sketch-button px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 text-xs sm:text-sm shrink-0"
          style={{ background: "#FFD54F", color: "#5D4037" }}>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />添加打卡
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const t = tags.find((tag) => tag.id === item.tagId) || { bg: "#f0f0f0", border: "#ccc", text: "#999", icon: "📌", name: "未知标识" };
          return (
            <div key={item.id} className="sketch-card px-5 py-4 hover:scale-[1.01] transition-transform" style={{ background: "white" }}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border-2"
                  style={{ background: t.bg, borderColor: t.border }}>
                  <span style={{ color: t.text }}>{t.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg" style={{ color: "#5D4037", fontWeight: "600" }}>{item.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs border" style={{ background: t.bg, color: t.text, borderColor: t.border }}>
                        {t.name}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditItem(item); setShowModal(true); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4A261]/20 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
                      </button>
                      <button onClick={() => setDeleteId(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F4C2C2]/40 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#B0A090" }} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 mb-2 flex-wrap">
                    <StarRating value={item.rating} />
                    {item.date && <span className="text-sm" style={{ color: "#B0A090" }}>{item.date}</span>}
                    {item.location && <span className="text-sm flex items-center gap-1" style={{ color: "#8B6F47" }}><MapPin className="w-3 h-3" />{item.location}</span>}
                  </div>
                  {item.review && <p className="text-base" style={{ color: "#8B6F47" }}>{item.review}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="sketch-card p-14 text-center" style={{ background: "white" }}>
          <div className="text-4xl mb-3">📍</div>
          <p className="text-base" style={{ color: "#8B6F47" }}>此标签下没有打卡记录，快去探索吧～</p>
        </div>
      )}

      {showModal && <CheckinModal editItem={editItem} tags={tags} onClose={() => setShowModal(false)} onSave={handleSave} />}
      {showTagModal && <ManageTagsModal tags={tags} onClose={() => setShowTagModal(false)} onSave={handleAddTag} onDelete={handleDeleteTag} />}
      {deleteId !== null && deletingItem && (
        <DeleteModal name={deletingItem.name}
          onConfirm={() => { setItems((p) => p.filter((c) => c.id !== deleteId)); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode; bigIcon: React.ReactNode; color: string; sub: string }[] = [
  { key: "album",      label: "相册",        icon: <Camera className="w-4 h-4" />,        bigIcon: <Camera className="w-10 h-10" />,        color: "#F4C2C2", sub: `${INIT_ALBUMS.length} 个相册` },
  { key: "activities", label: "一起做的事", icon: <Heart className="w-4 h-4" />,         bigIcon: <Heart className="w-10 h-10" />,         color: "#A8DADC", sub: `${INIT_ACTIVITIES.length} 件小事` },
  { key: "checkin",    label: "打卡清单",     icon: <ClipboardList className="w-4 h-4" />, bigIcon: <ClipboardList className="w-10 h-10" />, color: "#FFD54F", sub: `${INIT_CHECKINS.length} 条打卡` },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Memories() {
  const [activeTab, setActiveTab] = useState<TabKey>("album");
  const [tags, setTags] = useState<CheckinTag[]>(INIT_TAGS);
  const [showTagModal, setShowTagModal] = useState(false);

  const handleAddTag = (tag: Omit<CheckinTag, "id">) => {
    setTags((prev) => [...prev, { ...tag, id: tag.name }]);
  };

  const handleDeleteTag = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Heart className="w-8 h-8" style={{ color: "#FF69B4" }} fill="#FF69B4" />
          <h1 className="text-4xl" style={{ color: "#5D4037", fontWeight: "700" }}>回忆库</h1>
        </div>
        <p className="text-base" style={{ color: "#B0A090" }}>珍藏我们的美好时光</p>
      </div>

      {/* Tab cards */}
      <div className="grid grid-cols-3 gap-4">
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="sketch-card flex flex-col items-center justify-center py-7 gap-3 transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: isActive ? t.color : "white", borderColor: isActive ? "#4A3728" : "#E0D0C0",
                boxShadow: isActive ? "4px 4px 0 #4A3728" : "2px 2px 0 rgba(74,55,40,0.15)",
                transform: isActive ? "translate(-2px,-2px)" : "none" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: isActive ? "rgba(255,255,255,0.55)" : t.color, border: "2.5px solid",
                  borderColor: isActive ? "#4A3728" : "rgba(74,55,40,0.18)" }}>
                <span style={{ color: "#5D4037" }}>{t.bigIcon}</span>
              </div>
              <div className="text-center">
                <div className="text-base" style={{ color: "#5D4037", fontWeight: isActive ? "700" : "500" }}>{t.label}</div>
                <div className="text-xs mt-0.5" style={{ color: isActive ? "#7B5E3A" : "#B0A090" }}>{t.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "album"      && <AlbumTab />}
      {activeTab === "activities" && <ActivitiesTab tags={tags} onManageTags={() => setShowTagModal(true)} />}
      {activeTab === "checkin"    && <CheckinTab tags={tags} onManageTags={() => setShowTagModal(true)} />}

      {/* Bottom banner */}
      <div className="sketch-card p-8 text-center" style={{ background: "linear-gradient(135deg, #FFE6F0 0%, #F3E5F5 100%)" }}>
        <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: "#FF69B4" }} fill="#FF69B4" />
        <h3 className="text-2xl mb-2" style={{ color: "#5D4037", fontWeight: "600" }}>珍藏每一个温暖的瞬间</h3>
        <p className="text-base" style={{ color: "#8B6F47" }}>
          这里保存着我们所有的美好回忆，每一张照片都是爱的见证 💕
        </p>
      </div>

      {/* Tag management modal */}
      {showTagModal && <ManageTagsModal tags={tags} onClose={() => setShowTagModal(false)} onSave={handleAddTag} onDelete={handleDeleteTag} />}
    </div>
  );
}
