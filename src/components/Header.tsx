"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/goals", label: "My Goals" },
  { href: "/profile", label: "Profile" },
];

export default function Header({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-sand-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/goals" className="text-xl font-bold text-forest-800 tracking-tight">
          BucketBuddy
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  active
                    ? "text-forest-800 font-semibold border-b-2 border-forest-600"
                    : "text-gray-500 hover:text-forest-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/goals/new"
            className="px-4 py-2 bg-forest-700 text-white text-sm font-medium rounded-lg hover:bg-forest-800 transition-colors"
          >
            Add Goal
          </Link>
          {userName && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
