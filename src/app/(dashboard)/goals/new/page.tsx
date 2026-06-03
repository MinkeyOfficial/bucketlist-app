"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Travel",
  "Sports",
  "Education",
  "Career",
  "Creativity",
  "Health",
  "Relationships",
  "Other",
];

export default function NewGoalPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [webLinks, setWebLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function addWebLink() {
    setWebLinks([...webLinks, ""]);
  }

  function updateWebLink(index: number, value: string) {
    const updated = [...webLinks];
    updated[index] = value;
    setWebLinks(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const fullDescription = category
      ? `[${category}] ${description}`
      : description;

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: fullDescription,
        targetDate: targetDate || null,
      }),
    });

    const data = await res.json();
    const itemId = data.item.id;

    if (coverFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await fetch(`/api/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImage: base64, coverMime: coverFile.type }),
        });
      };
      reader.readAsDataURL(coverFile);
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });
    }

    if (videoUrl.trim()) {
      await fetch(`/api/items/${itemId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, title: "Video inspiration" }),
      });
    }

    for (const link of webLinks) {
      if (link.trim()) {
        await fetch(`/api/items/${itemId}/links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: link }),
        });
      }
    }

    setLoading(false);
    router.push(`/goals/${itemId}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-sand-200 p-8">
        <h1 className="text-2xl font-bold text-forest-800 mb-2">New Goal</h1>
        <p className="text-sm text-gray-400 mb-8">
          Define your vision and take the first step towards making it happen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Trip to Iceland"
                required
                className="w-full px-4 py-2.5 border border-sand-200 rounded-lg outline-none focus:ring-2 focus:ring-forest-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-sand-200 rounded-lg outline-none text-sm text-gray-600"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your dream in detail..."
              rows={4}
              className="w-full px-4 py-2.5 border border-sand-200 rounded-lg outline-none focus:ring-2 focus:ring-forest-600 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-sand-200 rounded-lg outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Media & Links
            </label>

            <label className="block border-2 border-dashed border-sand-200 rounded-xl p-6 text-center cursor-pointer hover:border-forest-600 transition-colors mb-4">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <div className="text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Drop an image here</p>
                  <p className="text-xs">or click to browse</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>

            <div className="flex items-center gap-2 p-3 border border-sand-200 rounded-lg mb-3">
              <span className="text-gray-400">🎬</span>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Video link (YouTube / Vimeo)"
                className="flex-1 outline-none text-sm"
              />
            </div>

            {webLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 p-3 border border-sand-200 rounded-lg mb-3">
                <span className="text-gray-400">🔗</span>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateWebLink(i, e.target.value)}
                  placeholder="Web links"
                  className="flex-1 outline-none text-sm"
                />
                {i === webLinks.length - 1 && (
                  <button
                    type="button"
                    onClick={addWebLink}
                    className="w-7 h-7 rounded-full border border-sand-200 text-gray-400 hover:bg-sand-100 flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/goals"
              className="px-6 py-2.5 border border-sand-200 text-gray-600 rounded-lg text-sm hover:bg-sand-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-forest-700 text-white rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
