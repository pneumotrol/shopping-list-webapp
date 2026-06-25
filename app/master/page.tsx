//Master 定番リスト ( source of truth )
"use client";

import { useState, useEffect } from "react";

type MasterItem = {
  id: number;
  name: string;
  quantity?: string;
  categoryId: number;
};

type MasterCategory = {
  id: number;
  name: string;
};

export default function MasterPage() {

  const buttonStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "var(--btn-bg-default)",
    color: "var(--btn-text-default)",
    cursor: "pointer",
  };
  
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategoryId, setNewCategoryId] = useState(1);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const startEditCategory = (category: MasterCategory) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const saveCategoryName = () => {
    if (editingCategoryId === null) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategoryId
          ? { ...c, name: editingName }
          : c
      )
    );

    setEditingCategoryId(null);
    setEditingName("");
  };

    useEffect(() => {
      const stored = localStorage.getItem("masterItems");
      if (!stored) return;

      const parsed: MasterItem[] = JSON.parse(stored).map((item: MasterItem) => ({
        ...item,
        categoryId: item.categoryId ?? 1, // デフォルトカテゴリ
      }));

      setMasterItems(parsed);
    }, []);

  useEffect(() => {
    localStorage.setItem("masterItems", JSON.stringify(masterItems));
  }, [masterItems]);

  useEffect(() => {
    const stored = localStorage.getItem("masterCategories");
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      setCategories([  // 初期の categories
        {
          id: 1,
          name: "定番",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "masterCategories",
      JSON.stringify(categories)
    );
  }, [categories]);

  const toggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  //今日のリストに追加
  const addToToday = () => {
    const selectedItems = masterItems.filter((item) =>
      checkedIds.includes(item.id)
    );

    localStorage.setItem("addItems", JSON.stringify(selectedItems));
    setCheckedIds([]);
    window.location.href = "/";
  };

  //定番リストに新規追加
  const addItem = () => {
    if (!newItemName.trim()) return;

    setMasterItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newItemName,
        quantity: newQuantity,
        categoryId: newCategoryId,
      },
    ]);

    setNewItemName("");  //定番品の名称
    setNewQuantity("");  //定番品の数量
    setNewCategoryId(1);  //定番品のカテゴリ選択
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newCategoryName,
      },
    ]);

    setNewCategoryName("");
  };

  const removeMaster = (id: number) => {
    setMasterItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setMasterItems((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newItems.length) {
        return prev;
      }

      [newItems[index], newItems[targetIndex]] =
        [newItems[targetIndex], newItems[index]];

      return newItems;
    });
  };

  const grouped: Record<number, MasterItem[]> = masterItems.reduce(
    (acc, item) => {
      if (!acc[item.categoryId]) acc[item.categoryId] = [];
      acc[item.categoryId].push(item);
      return acc;
    },
    {} as Record<number, MasterItem[]>
  );

  const moveCategory = (index: number, direction: "up" | "down") => {
    setCategories((prev) => {
      const newCategories = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;

      if (target < 0 || target >= newCategories.length) {
        return prev;
      }

      [newCategories[index], newCategories[target]] =
        [newCategories[target], newCategories[index]];

      return newCategories;
    });
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

    // カテゴリ削除
    setCategories((prev) =>
      prev.filter((c) => c.id !== categoryId)
    );

    // アイテムを未分類へ移動
    setMasterItems((prev) =>
      prev.map((item) =>
        item.categoryId === categoryId
          ? {
              ...item,
              categoryId: uncategorized.id,
            }
          : item
      )
    );
  };

  return (
    <main
      style={{
        padding: 16,
        maxWidth: 480,
        margin: "0 auto",
        background: "var(--main-bg)",
        color: "var(--text-main)",
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
        定番リスト
      </h1>

      {categories.map((category, index) => (
        <section
          key={category.id}
          style={{
            marginBottom: 16,
            background: "var(--card-bg)",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>
            {editingCategoryId === category.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{
                    fontSize: 16,
                    background: "var(--input-bg)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: "4px 8px",
                  }}
                />
                <button
                  onClick={saveCategoryName}
                  style={buttonStyle}
                >💾
                </button>
              </>
            ) : (
              <>
                {category.name}
                <button
                  onClick={() => startEditCategory(category)}
                  style={buttonStyle}
                >✏️
                </button>

                <button
                  onClick={() => moveCategory(index, "up")}
                  style={buttonStyle}
                >⬆
                </button>

                <button
                  onClick={() => moveCategory(index, "down")}
                  style={buttonStyle}
                >⬇
                </button>

                <button
                  onClick={() => removeCategory(category.id)}
                  style={buttonStyle}
                >🗑
                </button>
              </>
            )}
          </h2>

          {(grouped[category.id] ?? []).map((item, index) => (
            <div
              key={item.id}
              style={{
                padding: "8px 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={checkedIds.includes(item.id)}
                  onChange={() => toggleCheck(item.id)}
                  style={{ marginRight: 12, cursor: "pointer" }}
                />
                {item.name}
                {item.quantity && `（${item.quantity}）`}
              </label>

              <div style={{ display: "flex", gap: 12 }}>
                <select
                  value={item.categoryId}
                  onChange={(e) =>
                    setMasterItems((prev) =>
                      prev.map((m) =>
                        m.id === item.id
                          ? { ...m, categoryId: Number(e.target.value) }
                          : m
                      )
                    )
                  }
                  style={{
                    cursor: "pointer",
                    background: "var(--input-bg)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: "4px 8px",
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => moveItem(index, "up")}
                  style={buttonStyle}
                >
                  ⬆
                </button>

                <button
                  onClick={() => moveItem(index, "down")}
                  style={buttonStyle}
                >
                  ⬇
                </button>

                <button
                  onClick={() => removeMaster(item.id)}
                  style={buttonStyle}
                >
                  🗑
                </button>

              </div>
            </div>
          ))}
        </section>
      ))}

      <button
        onClick={addToToday}
        style={{ 
          width: "100%",
          padding: 12,
          marginTop: 16,
          cursor: "pointer",
          background: "var(--btn-bg-primary)",
          color: "var(--btn-text-default)",
          border: "none",
          borderRadius: 8,
        }}
      >
        今日の買い物リストに追加
      </button>

      <input
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        placeholder="新しい定番品"
        style={{ 
          marginRight: 8,
          cursor: "pointer",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "8px 12px",
        }}
      />

      <input
        value={newQuantity}
        onChange={(e) => setNewQuantity(e.target.value)}
        placeholder="数量"
        style={{
          marginRight: 8,
          cursor: "pointer",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "8px 12px",
        }}
      />

      <select
        value={newCategoryId}
        onChange={(e) =>
          setNewCategoryId(Number(e.target.value))
        }
        style={{
          marginRight: 8,
          cursor: "pointer",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "8px 12px",
        }}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={addItem}
        style={{ 
          cursor: "pointer",
          background: "var(--btn-bg-warning)",
          color: "var(--btn-text-default)",
          border: "none",
          borderRadius: 8,
          padding: "8px 12px",
        }}
      >
        ＋ 定番リストに追加
      </button>

      <div style={{ marginTop: 16 }}>
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="新しいカテゴリ"
          style={{
            marginRight: 8,
            cursor: "pointer",
            background: "var(--input-bg)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        />

        <button
          onClick={addCategory}
          style={{ 
            cursor: "pointer",
            background: "var(--btn-bg-warning)",
            color: "var(--btn-text-default)",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          ＋ カテゴリ追加
        </button>
      </div>

    </main>
  );
}
