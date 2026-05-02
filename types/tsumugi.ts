import { Timestamp } from "firebase/firestore";

export type SnapCategory = "言葉" | "ワード" | "書籍名" | "映画名";

export interface TsumugiBook {
  id: string;
  title: string;
  author: string;
  created_at: Timestamp;
}

export interface TsumugiSnap {
  id: string;
  book_id: string;
  extracted_text: string;
  memo: string;
  category: SnapCategory;
  source_page: string;
  image_url: string;
  created_at: Timestamp;
}
