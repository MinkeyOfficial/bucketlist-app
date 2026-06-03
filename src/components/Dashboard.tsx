"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: number;
  targetDate: string | null;
  hasCover: boolean;
  createdAt: string;
  _count: { images: number; links: number };
};

type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const FILTER_LABELS: Record<string, string> = {
  ALL: "All",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

function progressPercent(status: string): number {
  if (status === "DONE") return 100;
  if (status === "IN_PROGRESS") return 50;
  return 0;
}

export default function Dashboard({ user }: { user: User }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleMarkDone(e: React.MouseEvent, itemId: string) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    fetchItems();
  }

  const filteredItems =
    filter === "ALL" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-72 bg-gradient-to-br from-forest-900 to-forest-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-mountains.jpg')] bg-cover bg-center opacity-40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-white mb-3">
            Turn your dreams into plans.
          </h1>
          <p className="text-sand-200 text-sm max-w-lg">
            Create your bucket list, track your progress, and turn every day
            into an adventure. Welcome, {user.name}!
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 -mt-5 relative z-20">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2 text-sm rounded-full transition-colors ${
                filter === key
                  ? "bg-forest-700 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-sand-100 border border-sand-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Goal Grid */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">
              {items.length === 0
                ? "No goals yet. Create your first one!"
                : "No goals in this category."}
            </p>
            <Link
              href="/goals/new"
              className="inline-block px-6 py-3 bg-forest-700 text-white rounded-lg font-medium hover:bg-forest-800 transition-colors"
            >
              + Add Goal
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/goals/${item.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-sand-100"
              >
                <div className="h-44 bg-sand-100 overflow-hidden">
                  {item.hasCover ? (
                    <img
                      src={`/api/images/cover-${item.id}`}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sand-200 to-olive-100 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-sand-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">
                        {STATUS_LABELS[item.status]}
                      </span>
                      <span className="text-gray-400">
                        {progressPercent(item.status)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === "DONE"
                            ? "bg-forest-600"
                            : item.status === "IN_PROGRESS"
                              ? "bg-warm-500"
                              : "bg-sand-300"
                        }`}
                        style={{ width: `${progressPercent(item.status)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-xs text-gray-400">
                      {item._count.images > 0 && (
                        <span>{item._count.images} photos</span>
                      )}
                      {item._count.links > 0 && (
                        <span>{item._count.links} links</span>
                      )}
                    </div>
                    {item.status !== "DONE" && (
                      <button
                        onClick={(e) => handleMarkDone(e, item.id)}
                        className="px-3 py-1 bg-forest-700 text-white text-xs font-medium rounded-full hover:bg-forest-800 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
