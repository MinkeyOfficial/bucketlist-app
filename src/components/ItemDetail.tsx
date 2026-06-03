"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ItemLink = {
  id: string;
  url: string;
  title: string | null;
  linkType: "YOUTUBE" | "WEBSITE" | "OTHER";
  createdAt: string;
};

type ItemImage = {
  id: string;
  caption: string | null;
  mimeType: string;
  createdAt: string;
};

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
};

type Item = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: number;
  targetDate: string | null;
  hasCover: boolean;
  createdAt: string;
  completedAt: string | null;
  images: ItemImage[];
  links: ItemLink[];
  checklist: ChecklistItem[];
};

const STATUS_OPTIONS = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

function progressPercent(status: string): number {
  if (status === "DONE") return 100;
  if (status === "IN_PROGRESS") return 50;
  return 0;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: ItemImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  const img = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-50"
      >
        &times;
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/50 text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
        >
          &lsaquo;
        </button>
      )}

      {/* Image */}
      <img
        src={`/api/images/${img.id}`}
        alt={img.caption || ""}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
        >
          &rsaquo;
        </button>
      )}

      {/* Caption */}
      {img.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-4 py-2 rounded-lg">
          {img.caption}
        </div>
      )}
    </div>
  );
}

export default function ItemDetail({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("TODO");
  const [editDate, setEditDate] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [newCheckTitle, setNewCheckTitle] = useState("");

  const fetchItem = useCallback(async () => {
    const res = await fetch(`/api/items/${itemId}`);
    if (!res.ok) {
      router.push("/goals");
      return;
    }
    const data = await res.json();
    setItem(data.item);
    setLoading(false);
  }, [itemId, router]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  function startEdit() {
    if (!item) return;
    setEditTitle(item.title);
    setEditDesc(item.description || "");
    setEditStatus(item.status);
    setEditDate(item.targetDate?.split("T")[0] || "");
    setEditing(true);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDesc,
        status: editStatus,
        targetDate: editDate || null,
      }),
    });
    setEditing(false);
    fetchItem();
  }

  async function handleMarkDone() {
    await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    fetchItem();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    router.push("/goals");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/items/${itemId}/images`, {
        method: "POST",
        body: formData,
      });
    }
    setUploading(false);
    fetchItem();
    e.target.value = "";
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: base64, coverMime: file.type }),
      });
      fetchItem();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleDeleteImage(imageId: string) {
    await fetch(`/api/images/${imageId}`, { method: "DELETE" });
    fetchItem();
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    await fetch(`/api/items/${itemId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkUrl, title: linkTitle }),
    });
    setLinkUrl("");
    setLinkTitle("");
    fetchItem();
  }

  async function handleAddChecklistItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newCheckTitle.trim()) return;
    await fetch(`/api/items/${itemId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newCheckTitle }),
    });
    setNewCheckTitle("");
    fetchItem();
  }

  async function handleToggleCheck(checkId: string, done: boolean) {
    await fetch(`/api/items/${itemId}/checklist/${checkId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    fetchItem();
  }

  async function handleDeleteCheck(checkId: string) {
    await fetch(`/api/items/${itemId}/checklist/${checkId}`, {
      method: "DELETE",
    });
    fetchItem();
  }

  async function handleDeleteLink(linkId: string) {
    await fetch(`/api/items/${itemId}/links/${linkId}`, { method: "DELETE" });
    fetchItem();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!item) return null;

  const youtubeLinks = item.links.filter((l) => l.linkType === "YOUTUBE");
  const otherLinks = item.links.filter((l) => l.linkType !== "YOUTUBE");

  return (
    <div>
      {/* Lightbox */}
      {lightboxIndex !== null && item.images.length > 0 && (
        <Lightbox
          images={item.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex(
              (lightboxIndex - 1 + item.images.length) % item.images.length
            )
          }
          onNext={() =>
            setLightboxIndex((lightboxIndex + 1) % item.images.length)
          }
        />
      )}

      {/* Hero section with cover image */}
      <section className="relative h-80 bg-gradient-to-br from-forest-900 to-forest-700 overflow-hidden">
        {item.hasCover && (
          <img
            src={`/api/images/cover-${item.id}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end max-w-5xl mx-auto px-6 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                item.status === "DONE"
                  ? "bg-forest-600 text-white"
                  : item.status === "IN_PROGRESS"
                    ? "bg-warm-500 text-white"
                    : "bg-white/20 text-white backdrop-blur-sm"
              }`}
            >
              {STATUS_OPTIONS.find((s) => s.value === item.status)?.label}
            </span>
            <div className="flex-1 max-w-xs">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progressPercent(item.status)}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-white/70">
              {progressPercent(item.status)}% complete
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{item.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-white/60">
            <span>
              Created:{" "}
              {new Date(item.createdAt).toLocaleDateString("en-US")}
            </span>
            {item.targetDate && (
              <span>
                Target:{" "}
                {new Date(item.targetDate).toLocaleDateString("en-US")}
              </span>
            )}
            {item.completedAt && (
              <span className="text-green-300">
                Completed:{" "}
                {new Date(item.completedAt).toLocaleDateString("en-US")}
              </span>
            )}
          </div>
        </div>
        <label className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
          {item.hasCover ? "Change cover" : "Upload cover"}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </label>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Action buttons */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/goals"
            className="text-sm text-forest-600 hover:text-forest-800"
          >
            &larr; Back to goals
          </Link>
          <div className="flex-1" />
          {item.status !== "DONE" && (
            <button
              onClick={handleMarkDone}
              className="px-5 py-2 bg-forest-700 text-white text-sm font-medium rounded-lg hover:bg-forest-800 transition-colors"
            >
              Mark as complete
            </button>
          )}
          <button
            onClick={startEdit}
            className="px-4 py-2 bg-sand-100 text-gray-600 text-sm rounded-lg hover:bg-sand-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Edit form */}
            {editing && (
              <form
                onSubmit={saveEdit}
                className="bg-white rounded-2xl p-6 border border-sand-200"
              >
                <h2 className="font-semibold text-lg mb-4">Edit goal</h2>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-sand-200 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-forest-600"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-sand-200 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-forest-600 resize-none"
                  placeholder="Description..."
                />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Target date
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-forest-700 text-white rounded-lg text-sm font-medium hover:bg-forest-800"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-sand-100 text-gray-600 rounded-lg text-sm hover:bg-sand-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Description */}
            {!editing && (
              <div className="bg-white rounded-2xl p-6 border border-sand-200">
                <h2 className="font-semibold text-lg text-forest-800 mb-3">
                  About this goal
                </h2>
                {item.description ? (
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No description yet.</p>
                )}
              </div>
            )}

            {/* Image gallery */}
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-forest-800">
                  Photo Gallery
                </h2>
                <label className="px-4 py-2 bg-olive-100 text-olive-600 text-sm rounded-lg cursor-pointer hover:bg-olive-200 transition-colors font-medium">
                  {uploading ? "Uploading..." : "Add photos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {item.images.length === 0 ? (
                <p className="text-sm text-gray-400">No photos yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {item.images.map((img, index) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={`/api/images/${img.id}`}
                        alt={img.caption || ""}
                        className="w-full h-36 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxIndex(index)}
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        &times;
                      </button>
                      {img.caption && (
                        <p className="text-xs text-gray-500 p-2">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* YouTube videos */}
            {youtubeLinks.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-sand-200">
                <h2 className="font-semibold text-lg text-forest-800 mb-4">
                  Video Inspiration
                </h2>
                <div className="space-y-4">
                  {youtubeLinks.map((link) => {
                    const embedUrl = getYoutubeEmbedUrl(link.url);
                    return (
                      <div key={link.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {link.title || link.url}
                          </span>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                        {embedUrl && (
                          <div className="aspect-video rounded-xl overflow-hidden">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Sub-goals checklist */}
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-forest-800">
                  Sub-goals
                </h2>
                {item.checklist.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {item.checklist.filter((c) => c.done).length}/{item.checklist.length} done
                  </span>
                )}
              </div>

              {item.checklist.length > 0 && (
                <div className="mb-3">
                  <div className="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forest-600 rounded-full transition-all"
                      style={{
                        width: `${item.checklist.length > 0 ? (item.checklist.filter((c) => c.done).length / item.checklist.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {item.checklist.length === 0 ? (
                <p className="text-sm text-gray-400 mb-4">
                  Break this goal into smaller steps to track your progress.
                </p>
              ) : (
                <div className="space-y-1 mb-4">
                  {item.checklist.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center gap-3 group py-1.5 px-2 -mx-2 rounded-lg hover:bg-sand-50"
                    >
                      <input
                        type="checkbox"
                        checked={check.done}
                        onChange={() => handleToggleCheck(check.id, check.done)}
                        className="w-4 h-4 accent-forest-600 cursor-pointer"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          check.done
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {check.title}
                      </span>
                      <button
                        onClick={() => handleDeleteCheck(check.id)}
                        className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleAddChecklistItem}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newCheckTitle}
                  onChange={(e) => setNewCheckTitle(e.target.value)}
                  placeholder="Add a sub-goal..."
                  className="flex-1 px-3 py-2 border border-sand-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-forest-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-forest-700 text-white rounded-lg text-sm hover:bg-forest-800 transition-colors"
                >
                  +
                </button>
              </form>

              {item.status !== "DONE" && (
                <button
                  onClick={handleMarkDone}
                  className="w-full mt-4 px-4 py-2.5 bg-forest-700 text-white rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors"
                >
                  Mark as complete
                </button>
              )}
            </div>

            {/* Links */}
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <h2 className="font-semibold text-lg text-forest-800 mb-4">
                Resources & Links
              </h2>
              {otherLinks.length === 0 && youtubeLinks.length === 0 ? (
                <p className="text-sm text-gray-400 mb-4">No links yet.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {[...youtubeLinks, ...otherLinks].map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2.5 bg-sand-50 rounded-lg"
                    >
                      <span className="text-sm">
                        {link.linkType === "YOUTUBE" ? "🎬" : "🔗"}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-forest-600 hover:underline truncate flex-1"
                      >
                        {link.title || link.url}
                      </a>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddLink} className="space-y-2">
                <input
                  type="url"
                  placeholder="URL (youtube, website, ...)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-forest-600"
                />
                <input
                  type="text"
                  placeholder="Link title (optional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-forest-600"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-olive-100 text-olive-600 rounded-lg text-sm font-medium hover:bg-olive-200 transition-colors"
                >
                  + Add link
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
