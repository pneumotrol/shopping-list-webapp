//Add Homeに新しく追加
"use client";

import { useState,useEffect } from "react";

export default function AddPage() {

  const buttonStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "var(--btn-bg-default)",
    color: "var(--btn-text-default)",
    cursor: "pointer",
  };

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  //const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  // const storedCategories = localStorage.getItem("todayCategories");

  // const categories = storedCategories
  //   ? JSON.parse(storedCategories)
  //   : [];

  useEffect(() => {
    const storedCategories =
      localStorage.getItem("todayCategories");

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  //アイテムを新しく追加する
  const addItem = () => {
    if (!name.trim()) return;

    const newItem = {
      name,
      quantity,
      categoryId,
    };

    const stored = localStorage.getItem("addItems");
    const items = stored ? JSON.parse(stored) : [];

    items.push(newItem);

    localStorage.setItem("addItems", JSON.stringify(items));
    window.location.href = "/";
  };

  //カテゴリを新しく追加する
  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: Date.now(),
      name: newCategoryName,
      folded: false,
      items: [],
    };

    const updatedCategories = [...categories, newCategory];

    localStorage.setItem(
      "todayCategories",
      JSON.stringify(updatedCategories)
    );

    localStorage.setItem(
      "masterCategories",
      JSON.stringify(updatedCategories)
    );

    setNewCategoryName("");

    // 画面更新
    window.location.reload();
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
        新しく追加
      </h1>

      <input
        type="text"
        placeholder="買う物の名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          cursor: "pointer",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}
      />

      <input
        type="text"
        placeholder="数量"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          cursor: "pointer",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          cursor: "pointer",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}
      >
        {categories.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={addItem}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          cursor: "pointer",
          background: "var(--btn-bg-primary)",
          color: "var(--btn-text-default)",
          border: "none",
          borderRadius: 8,
        }}
      >
        今日の買い物リストに追加
      </button>

      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="新しいカテゴリ"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          style={{
            width: "70%",
            padding: 12,
            fontSize: 16,
            marginRight: 8,
            cursor: "pointer",
            background: "var(--input-bg)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: 8, 
          }}
        />

        <button
          onClick={addCategory}
          style={{ 
            cursor: "pointer",
            background: "var(--btn-bg-danger)",
            color: "var(--btn-text-light)",
            border: "none",
            borderRadius: 8,
          }}
        >
          ＋ カテゴリ追加
        </button>
      </div>

    </main>
  );
}
