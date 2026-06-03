"use client";

import { useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

type Item = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  createdAt: string;
  completedAt: string | null;
};

export default function ProfileView({ user }: { user: User }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const stats = {
    total: items.length,
    inProgress: items.filter((i) => i.status === "IN_PROGRESS").length,
    done: items.filter((i) => i.status === "DONE").length,
  };

  const recentActivity = items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const completedItems = items
    .filter((i) => i.status === "DONE" && i.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  return (
    <div>
      <section className="relative h-52 bg-gradient-to-br from-forest-900 to-forest-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-mountains.jpg')] bg-cover bg-center opacity-30" />
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-forest-700 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg mb-3">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-sand-200 text-center">
            <div className="text-3xl font-bold text-forest-800 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-400">Total goals</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-sand-200 text-center">
            <div className="text-3xl font-bold text-warm-500 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-400">In progress</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-sand-200 text-center">
            <div className="text-3xl font-bold text-olive-500 mb-1">{stats.done}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-olive-100 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-forest-800 mb-2">Overall Progress</h3>
            <p className="text-sm text-gray-600 mb-4">
              {stats.done > 0
                ? `You've completed ${stats.done} out of ${stats.total} goals. Keep going!`
                : "No completed goals yet. Let's get started!"}
            </p>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-forest-600 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total > 0 ? `${Math.round((stats.done / stats.total) * 100)}% complete` : "0% complete"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sand-200">
            <h3 className="text-lg font-bold text-forest-800 mb-4">Milestones</h3>
            {completedItems.length === 0 ? (
              <p className="text-sm text-gray-400">No milestones yet.</p>
            ) : (
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-400">{new Date(item.completedAt!).toLocaleDateString("en-US")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-200 mb-12">
          <h3 className="text-lg font-bold text-forest-800 mb-4">Recent Activity</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === "DONE" ? "bg-forest-600" : item.status === "IN_PROGRESS" ? "bg-warm-500" : "bg-sand-300"
                    }`} />
                    <p className="text-sm font-medium text-gray-700">
                      {item.status === "DONE" ? `Completed: ${item.title}` : item.status === "IN_PROGRESS" ? `In progress: ${item.title}` : `Created: ${item.title}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString("en-US")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
