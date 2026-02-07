"use client";

import { useState } from "react";

type Item = {
  id: number;
  name: string;
  quantity?: string;
  checked: boolean;
};

type Category = {
  id: number;
  name: string;
  folded: boolean;
  items: Item[];
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "スーパー",
      folded: false,
      items: [
        { id: 1, name: "牛乳", quantity: "1本", checked: false },
        { id: 2, name: "卵", quantity: "10個", checked: true },
        { id: 3, name: "豚こま", quantity: "300g", checked: false },
      ],
    },
    {
      id: 2,
      name: "ドラッグストア",
      folded: true,
      items: [
        { id: 4, name: "洗剤", quantity: "1本", checked: false },
        { id: 5, name: "トイレットペーパー", quantity: "1個", checked: false },
      ],
    },
  ]);

  const toggleCategory = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, folded: !c.folded } : c
      )
    );
  };

  const toggleItem = (categoryId: number, itemId: number) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
            }
          : c
      )
    );
  };

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>今日の買い物</h1>

      {categories.map((category) => (
        <section key={category.id} style={{ marginBottom: 16 }}>
          {/* カテゴリヘッダ */}
          <div
            onClick={() => toggleCategory(category.id)}
            style={{
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            {category.folded ? "▶" : "▼"} {category.name}
          </div>

          {/* アイテム */}
          {!category.folded &&
            category.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 4px",
                  opacity: item.checked ? 0.4 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(category.id, item.id)}
                  style={{ width: 20, height: 20, marginRight: 12 }}
                />
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.quantity && (
                  <span style={{ fontSize: 12 }}>{item.quantity}</span>
                )}
              </div>
            ))}
        </section>
      ))}

      <button
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginTop: 16,
        }}
      >
        ＋ 追加する
      </button>
    </main>
  );
}
