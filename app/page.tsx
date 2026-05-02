"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSnaps } from "../lib/firestore";
import type { TsumugiSnap } from "../types/tsumugi";

const CATEGORY_COLORS: Record<string, string> = {
  言葉: "bg-purple-100 text-purple-700",
  ワード: "bg-blue-100 text-blue-700",
  書籍名: "bg-green-100 text-green-700",
  映画名: "bg-orange-100 text-orange-700",
};

export default function HomePage() {
  const [snaps, setSnaps] = useState<TsumugiSnap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnaps()
      .then((data) => setSnaps(data.slice(0, 10)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">tsumugi</h1>
        <p className="text-sm text-gray-500 mt-1">言葉を、紡ぐ。</p>
      </header>

      <Link
        href="/snap/new"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gray-900 text-white text-lg font-semibold active:scale-95 transition-transform"
      >
        <span className="text-2xl">📸</span> 撮影する
      </Link>

      <nav className="flex gap-3 text-sm font-medium">
        <Link
          href="/snaps"
          className="flex-1 text-center py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          一覧
        </Link>
        <Link
          href="/books"
          className="flex-1 text-center py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          本の管理
        </Link>
      </nav>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">最近のスナップ</h2>
        {loading ? (
          <p className="text-center text-gray-400 py-8">読み込み中…</p>
        ) : snaps.length === 0 ? (
          <p className="text-center text-gray-400 py-8">まだスナップがありません</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {snaps.map((snap) => (
              <li key={snap.id}>
                <Link
                  href={`/snaps/${snap.id}`}
                  className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {snap.image_url && (
                    <img
                      src={snap.image_url}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1 ${
                        CATEGORY_COLORS[snap.category] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {snap.category}
                    </span>
                    <p className="text-sm font-medium line-clamp-2 leading-snug">
                      {snap.extracted_text}
                    </p>
                    {snap.memo && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{snap.memo}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
