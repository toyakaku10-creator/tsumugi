"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addSnap } from "../../../lib/firestore";
import { getBooks } from "../../../lib/firestore";
import type { SnapCategory, TsumugiBook } from "../../../types/tsumugi";
import { useEffect } from "react";

type Step = "capture" | "category" | "review" | "meta";

const CATEGORIES: SnapCategory[] = ["言葉", "ワード", "書籍名", "映画名"];

export default function NewSnapPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("capture");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [category, setCategory] = useState<SnapCategory>("言葉");
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [bookId, setBookId] = useState("");
  const [books, setBooks] = useState<TsumugiBook[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("category");
  }

  async function runOcr() {
    if (!imageFile) return;
    setOcrError(null);
    setOcrLoading(true);
    setStep("review");
    try {
      const form = new FormData();
      form.append("image", imageFile);
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `サーバーエラー (${res.status})`);
      }
      if (data.error) {
        throw new Error(data.error);
      }
      setOcrText(data.text ?? "");
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "OCRに失敗しました");
    } finally {
      setOcrLoading(false);
    }
  }

  function handleCategoryNext() {
    runOcr();
  }

  async function handleSave() {
    if (!imageFile) return;
    setSaving(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `snaps/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const image_url = await getDownloadURL(storageRef);

      await addSnap({
        book_id: bookId,
        extracted_text: ocrText,
        memo,
        category,
        source_page: sourcePage,
        image_url,
      });

      router.push("/snaps");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-xl font-bold">新しいスナップ</h1>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1">
        {(["capture", "category", "review", "meta"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              ["capture", "category", "review", "meta"].indexOf(step) >= i
                ? "bg-gray-900"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step: capture */}
      {step === "capture" && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 text-sm">写真を撮影またはライブラリから選択してください。</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-16 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-lg"
          >
            📷 カメラで撮影 / 写真を選択
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Step: category */}
      {step === "category" && (
        <div className="flex flex-col gap-5">
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="w-full rounded-xl object-cover max-h-64" />
          )}
          <div>
            <p className="text-sm font-semibold mb-3">ジャンルを選択</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                    category === c
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleCategoryNext}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold"
          >
            OCRを実行 →
          </button>
        </div>
      )}

      {/* Step: review */}
      {step === "review" && (
        <div className="flex flex-col gap-5">
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="w-full rounded-xl object-cover max-h-48" />
          )}
          {ocrLoading ? (
            <p className="text-center text-gray-400 py-6">テキストを認識中…</p>
          ) : ocrError ? (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <p className="font-semibold mb-1">OCRエラー</p>
                <p>{ocrError}</p>
              </div>
              <button
                onClick={runOcr}
                className="w-full py-3 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50"
              >
                再試行
              </button>
              <button
                onClick={() => { setOcrError(null); setStep("meta"); }}
                className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold"
              >
                スキップして続ける
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-semibold block mb-1">認識テキスト（編集可）</label>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-gray-400"
                />
              </div>
              <button
                onClick={() => setStep("meta")}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold"
              >
                次へ →
              </button>
            </>
          )}
        </div>
      )}

      {/* Step: meta */}
      {step === "meta" && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold block mb-1">本（任意）</label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-gray-400"
            >
              <option value="">-- 選択しない --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">メモ（任意）</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="感想や補足メモ"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">ページ番号（任意）</label>
            <input
              type="text"
              value={sourcePage}
              onChange={(e) => setSourcePage(e.target.value)}
              placeholder="例: p.42"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存する"}
          </button>
        </div>
      )}
    </main>
  );
}
