//Home 今日の買い物リスト ( working copy )
"use client";

import { useState } from "react";
import { useEffect } from "react";

type Item = {
  id: number;
  name: string;
  quantity?: string;
  categoryId: number;
  checked: boolean;
};

type Category = {
  id: number;
  name: string;
  folded: boolean;
  items: Item[];
};

export default function Home() {

  const buttonStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
  };

  //const [masterNames, setMasterNames] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [masterItems, setMasterItems] = useState<any[]>([]);

  useEffect(() => {
    const storedToday = localStorage.getItem("todayCategories");
    if (storedToday) {
      setCategories(JSON.parse(storedToday));
      return;
    }

    const storedCategories = localStorage.getItem("masterCategories");
    if (!storedCategories) return;

    const categoriesData = JSON.parse(storedCategories);

    setCategories(
      categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        folded: false,
        items: [],
      }))
    );
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("masterItems");

    if (stored) {
      setMasterItems(JSON.parse(stored));
    }
  }, []);

  const moveItem = (
    fromCategoryId: number,
    toCategoryId: number,
    itemId: number
  ) => {
    setCategories((prev) => {
      let movingItem: Item | null = null;

      // まず item を取り出す
      const removed = prev.map((c) => {
        if (c.id !== fromCategoryId) return c;

        const restItems = c.items.filter((i) => {
          if (i.id === itemId) {
            movingItem = i;
            return false;
          }
          return true;
        });

        return { ...c, items: restItems };
      });

      if (!movingItem) return prev;

      // 移動先に追加
      return removed.map((c) =>
        c.id === toCategoryId
          ? {
            ...c,
            items: [
              ...c.items,
              {
                ...movingItem!,
                categoryId: toCategoryId,
              },
            ],
          }
          : c
      );
    });
  };

  const moveCategoryId = (index: number, direction: "up" | "down") => {
    setCategories((prev) => {
      const newCategories = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newCategories.length) {
        return prev;
      }

      [newCategories[index], newCategories[targetIndex]] =
        [newCategories[targetIndex], newCategories[index]];

      return newCategories;
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: Date.now(),
      name: newCategoryName,
      folded: false,
      items: [],
    };

    setCategories((prev) => [...prev, newCategory]);

    // 定番リストにも保存
    const stored = localStorage.getItem("masterCategories");
    const masterCategories = stored ? JSON.parse(stored) : [];

    masterCategories.push({
      id: newCategory.id,
      name: newCategory.name,
    });

    localStorage.setItem(
      "masterCategories",
      JSON.stringify(masterCategories)
    );

    setNewCategoryName("");
  };

  const removeCategory = (categoryId: number) => {
    if (!confirm("カテゴリを削除しますか？")) return;

    const uncategorized = categories.find(
      (c) => c.name === "未分類"
    );

    if (!uncategorized) {
      alert("未分類カテゴリがありません");
      return;
    }

    // 未分類は削除禁止
    if (categoryId === uncategorized.id) {
      alert("未分類は削除できません");
      return;
    }

    setCategories((prev) => {
      const removingCategory = prev.find(
        (c) => c.id === categoryId
      );

      if (!removingCategory) return prev;

      return prev
        .filter((c) => c.id !== categoryId)
        .map((c) =>
          c.id === uncategorized.id
            ? {
              ...c,
              items: [...c.items, ...removingCategory.items],
            }
            : c
        );
    });

    // masterCategories 更新
    const stored = localStorage.getItem("masterCategories");

    if (stored) {
      const masterCategories = JSON.parse(stored);

      const updated = masterCategories.filter(
        (c: any) => c.id !== categoryId
      );

      localStorage.setItem(
        "masterCategories",
        JSON.stringify(updated)
      );
    }
  };

  const updateQuantity = (
    categoryId: number,
    itemId: number,
    quantity: string
  ) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
            ...c,
            items: c.items.map((i) =>
              i.id === itemId
                ? { ...i, quantity }
                : i
            ),
          }
          : c
      )
    );
  };

  const addToMaster = (item: Item) => {
    const stored = localStorage.getItem("masterItems");

    const masterItems = stored
      ? JSON.parse(stored)
      : [];

    // 重複チェック
    if (
      masterItems.some(
        (i: any) => i.name === item.name
      )
    ) {
      return;
    }

    const newItem = {
      id: Date.now(),
      name: item.name,
      quantity: item.quantity ?? "",
      categoryId: item.categoryId,
    };

    const updated = [...masterItems, newItem];

    localStorage.setItem(
      "masterItems",
      JSON.stringify(updated)
    );

    // setMasterNames((prev) => [
    //   ...prev,
    //   item.name,
    // ]);
  };

  //HomeとMasterのカテゴリ名を同期
  const saveCategoryId = (id: number) => {
    const updated = categories.map((c) =>
      c.id === id
        ? { ...c, name: tempName }
        : c
    );

    setCategories(updated);

    // masterCategories にも保存
    const masterCategories = updated.map((c) => ({
      id: c.id,
      name: c.name,
    }));

    localStorage.setItem(
      "masterCategories",
      JSON.stringify(masterCategories)
    );

    setEditingId(null);
  };

  //購入済みアイテムを一括削除
  const removeCheckedItems = () => {
    if (!confirm("購入済を削除しますか？")) return;

    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.filter(
          (item) => !item.checked
        ),
      }))
    );
  };

  const resetToday = () => {
    if (!confirm("今日の買い物リストをリセットしますか？")) {
      return;
    }

    localStorage.removeItem("todayCategories");

    const storedCategories =
      localStorage.getItem("masterCategories");

    if (!storedCategories) {
      setCategories([]);
      return;
    }

    const categoriesData = JSON.parse(storedCategories);

    setCategories(
      categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        folded: false,
        items: [],
      }))
    );
  };

  useEffect(() => {
    const data = localStorage.getItem("addItems");
    if (!data) return;
    localStorage.removeItem("addItems");  //読み込み直後に削除する！

    const items = JSON.parse(data);

    setCategories((prev) => {
      const updated = [...prev];

      items.forEach((item: any) => {
        const targetCategory = updated.find(
          (c) => c.id === item.categoryId
        );

        const alreadyExists = updated.some((category) =>
          category.items.some(
            (existingItem) =>
              existingItem.name === item.name
          )
        );

        if (alreadyExists) {
          return;
        }

        const newItem = {
          id: Date.now() + Math.random(),
          name: item.name,
          quantity: item.quantity ?? "",
          categoryId: item.categoryId,
          checked: false,
        };

        if (targetCategory) {
          targetCategory.items.push(newItem);
        } else {
          updated.push({
            id: item.categoryId,
            name: "未分類",
            folded: false,
            items: [newItem],
          });
        }
      });

      return [...updated];
    });


  }, []);

  useEffect(() => {
    localStorage.setItem("todayCategories", JSON.stringify(categories));
  }, [categories]);

  const toggleCategoryId = (categoryId: number) => {
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

  const removeItem = (
    categoryId: number,
    itemId: number
  ) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
            ...c,
            items: c.items.filter((i) => i.id !== itemId),
          }
          : c
      )
    );
  };

  const isEmpty = categories.every(
    (categoryId) => categoryId.items.length === 0
  );

  return (
    <main
      style={{
        padding: 16,
        maxWidth: 480,
        margin: "0 auto",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        今日の買い物リスト
      </h1>

      {isEmpty && (
        <p style={{ color: "#666", textAlign: "center", marginTop: 24 }}>
          まだ買う物がありません<br />
          「＋ 新しく追加」から追加してみましょう
        </p>
      )}


      {categories.map((categoryId, index) => (
        <section
          key={categoryId.id}
          style={{
            marginBottom: 16,
            background: "white",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {/* カテゴリヘッダ */}
          {editingId === categoryId.id ? (
            <>
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{ flex: 1, marginRight: 8, cursor: "pointer" }}
              />
              <button
                onClick={() => saveCategoryId(categoryId.id)}
                style={buttonStyle}
              >
                💾
              </button>
            </>
          ) : (
            <>
              <span
                onClick={() => toggleCategoryId(categoryId.id)}
                style={buttonStyle}
              >
                {categoryId.folded ? "▶" : "▼"} {categoryId.name}
              </span>

              <span>
                <button
                  onClick={() => {
                    setEditingId(categoryId.id);
                    setTempName(categoryId.name);
                  }}
                  style={buttonStyle}
                >
                  ✏️
                </button>

                <button
                  onClick={() => moveCategoryId(index, "up")}
                  style={buttonStyle}
                  disabled={index === 0}
                >
                  ⬆
                </button>

                <button
                  onClick={() => moveCategoryId(index, "down")}
                  style={buttonStyle}
                  disabled={index === categories.length - 1}
                >
                  ⬇
                </button>

                <button
                  onClick={() => removeCategory(categoryId.id)}
                  style={buttonStyle}
                >
                  🗑
                </button>

              </span>
            </>
          )}

          {/* アイテム */}
          {!categoryId.folded &&
            Array.isArray(categoryId.items) &&
            [...categoryId.items]
              .sort((a, b) => Number(a.checked) - Number(b.checked))
              .map((item) => {

                const isMaster = masterItems.some(
                  (i: any) => i.name === item.name
                );

                return (
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
                      onChange={() => toggleItem(categoryId.id, item.id)}
                      style={{ width: 20, height: 20, marginRight: 12, cursor: "pointer" }}
                    />

                    <span style={{ flex: 1 }}>{item.name}</span>

                    <select
                      value={categoryId.id}
                      onChange={(e) =>
                        moveItem(
                          categoryId.id,
                          Number(e.target.value),
                          item.id
                        )
                      }
                      style={{ marginLeft: 8, cursor: "pointer" }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={item.quantity ?? ""}
                      placeholder="数量"
                      onChange={(e) =>
                        updateQuantity(
                          categoryId.id,
                          item.id,
                          e.target.value
                        )
                      }
                      style={{
                        width: 60,
                        fontSize: 16,
                        marginLeft: 8,
                        cursor: "pointer",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                      }}
                    />

                    <button
                      disabled={isMaster}
                      onClick={() => addToMaster(item)}
                      style={buttonStyle}
                    >
                      {isMaster ? "★" : "☆"}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("削除しますか？")) {
                          removeItem(categoryId.id, item.id);
                        }
                      }}
                      style={buttonStyle}
                    >
                      🗑
                    </button>
                  </div>
                );
              })}
        </section>
      ))}


      <a
        href="/add"
        style={{
          display: "block",
          textAlign: "center",
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginTop: 16,
          // border: "1px solid #ccc",
          textDecoration: "none",
          color: "black",

          background: "#7eda81",
          // color: "white",
          border: "none",
          borderRadius: 8,
        }}
      >
        ＋ 新しく追加
      </a>

      <a
        href="/master"
        style={{
          display: "block",
          textAlign: "center",
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginTop: 8,
          // border: "1px solid #ccc",
          textDecoration: "none",
          color: "black",

          background: "#7eda81",
          // color: "white",
          border: "none",
          borderRadius: 8,
        }}
      >
        ＋ 定番リストから追加
      </a>

      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="新しいカテゴリ"
          style={{
            padding: 8,
            marginRight: 8,
            width: 200,
            cursor: "pointer",
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />

        <button
          onClick={addCategory}
          style={{
            padding: "8px 12px",
            cursor: "pointer",

            background: "#7eda81",
            // color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          ＋ カテゴリ追加
        </button>

        <button
          onClick={removeCheckedItems}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            cursor: "pointer",

            background: "#406841",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          ✓ 購入済を削除
        </button>

        <button
          onClick={resetToday}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            cursor: "pointer",

            background: "#406841",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          🗑 今日の買い物リストをリセット
        </button>

      </div>

    </main>
  );
}
