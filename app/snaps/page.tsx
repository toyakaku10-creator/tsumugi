"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSnaps } from "../../lib/firestore";
import type { TsumugiSnap, SnapCategory } from "../../types/tsumugi";

const CATEGORIES: SnapCategory[] = ["言葉", "ワード", "書籍名", "映画名"];

const CATEGORY_COLORS: Record<string, string> = {
  言葉: "bg-purple-100 text-purple-700",
  ワード: "bg-blue-100 text-blue-700",
  書籍名: "bg-green-100 text-green-700",
  映画名: "bg-orange-100 text-orange-700",
};

type SortKey = "newest" | "oldest";

export default function SnapsPage() {
  const [snaps, setSnaps] = useState<TsumugiSnap[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<SnapCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    getSnaps()
      .then(setSnaps)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = snaps;
    if (category !== "all") result = result.filter((s) => s.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.extracted_text.toLowerCase().includes(q) ||
          s.memo.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") result = [...result].reverse();
    return result;
  }, [snaps, category, search, sort]);

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-gray-500 hover:text-gray-800 text-sm">
          ← ホーム
        </Link>
        <h1 className="text-xl font-bold">スナップ一覧</h1>
        <Link href="/snap/new" className="text-sm text-gray-500 hover:text-gray-800">
          ＋新規
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="テキスト・メモで検索"
        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory("all")}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            category === "all"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              category === c
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex justify-end">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">読み込み中…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">該当するスナップがありません</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((snap) => (
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
    </main>
  );
}
