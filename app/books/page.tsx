"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBooks, addBook, deleteBook } from "../../lib/firestore";
import type { TsumugiBook } from "../../types/tsumugi";

export default function BooksPage() {
  const [books, setBooks] = useState<TsumugiBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setBooks(await getBooks());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    try {
      await addBook({ title: title.trim(), author: author.trim() });
      setTitle("");
      setAuthor("");
      setShowForm(false);
      await load();
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string, bookTitle: string) {
    if (!confirm(`「${bookTitle}」を削除しますか？`)) return;
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-gray-500 hover:text-gray-800 text-sm">
          ← ホーム
        </Link>
        <h1 className="text-xl font-bold">本の管理</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          {showForm ? "✕" : "＋追加"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200"
        >
          <h2 className="text-sm font-semibold">新しい本を登録</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル *"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="著者名"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="w-full py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-50"
          >
            {adding ? "保存中…" : "登録する"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-12">読み込み中…</p>
      ) : books.length === 0 ? (
        <p className="text-center text-gray-400 py-12">まだ本が登録されていません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100"
            >
              <div>
                <p className="text-sm font-medium">{book.title}</p>
                {book.author && (
                  <p className="text-xs text-gray-400">{book.author}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(book.id, book.title)}
                className="text-xs text-red-400 hover:text-red-600 ml-3 flex-shrink-0"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
