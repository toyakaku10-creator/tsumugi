"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSnap, getBook, deleteSnap } from "../../../lib/firestore";
import type { TsumugiSnap, TsumugiBook } from "../../../types/tsumugi";

const CATEGORY_COLORS: Record<string, string> = {
  言葉: "bg-purple-100 text-purple-700",
  ワード: "bg-blue-100 text-blue-700",
  書籍名: "bg-green-100 text-green-700",
  映画名: "bg-orange-100 text-orange-700",
};

export default function SnapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [snap, setSnap] = useState<TsumugiSnap | null>(null);
  const [book, setBook] = useState<TsumugiBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(async ({ id }) => {
      const s = await getSnap(id);
      setSnap(s);
      if (s?.book_id) {
        const b = await getBook(s.book_id);
        setBook(b);
      }
      setLoading(false);
    });
  }, [params]);

  async function handleDelete() {
    if (!snap) return;
    if (!confirm("このスナップを削除しますか？")) return;
    setDeleting(true);
    await deleteSnap(snap.id);
    router.push("/snaps");
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <p className="text-center text-gray-400 py-20">読み込み中…</p>
      </main>
    );
  }

  if (!snap) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <p className="text-center text-gray-400 py-20">スナップが見つかりません</p>
        <div className="text-center mt-4">
          <Link href="/snaps" className="text-sm text-gray-500 underline">
            一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link href="/snaps" className="text-gray-500 hover:text-gray-800 text-sm">
          ← 一覧
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-400 hover:text-red-600 disabled:opacity-50"
        >
          削除
        </button>
      </div>

      {snap.image_url && (
        <img
          src={snap.image_url}
          alt="snap image"
          className="w-full rounded-2xl object-cover max-h-72"
        />
      )}

      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            CATEGORY_COLORS[snap.category] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {snap.category}
        </span>
        {snap.source_page && (
          <span className="text-xs text-gray-400">{snap.source_page}</span>
        )}
      </div>

      <section>
        <h2 className="text-xs font-semibold text-gray-400 mb-2">テキスト</h2>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{snap.extracted_text}</p>
      </section>

      {snap.memo && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 mb-2">メモ</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{snap.memo}</p>
        </section>
      )}

      {book && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 mb-2">出典</h2>
          <Link
            href={`/books`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{book.title}</p>
              <p className="text-xs text-gray-400">{book.author}</p>
            </div>
          </Link>
        </section>
      )}
    </main>
  );
}
