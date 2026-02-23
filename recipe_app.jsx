import { useState, useCallback } from "react";

const INGREDIENT_SUGGESTIONS = [
  "卵", "玉ねぎ", "にんにく", "しょうが", "豚肉", "鶏肉", "豆腐",
  "じゃがいも", "にんじん", "キャベツ", "トマト", "なす", "ピーマン",
  "もやし", "ほうれん草", "きのこ", "醤油", "みりん", "酒", "味噌",
  "バター", "チーズ", "牛乳", "小麦粉", "ごま油", "白米", "パスタ"
];

function Tag({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: "linear-gradient(135deg, #f97316, #ea580c)",
      color: "white", borderRadius: "999px",
      padding: "4px 12px", fontSize: "0.85rem", fontWeight: 600,
      fontFamily: "'Zen Kaku Gothic New', sans-serif",
      boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
      animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)"
    }}>
      {label}
      <button onClick={() => onRemove(label)} style={{
        background: "rgba(255,255,255,0.3)", border: "none", color: "white",
        borderRadius: "50%", width: "16px", height: "16px",
        cursor: "pointer", fontSize: "10px", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 0,
        lineHeight: 1
      }}>✕</button>
    </span>
  );
}

function RecipeCard({ recipe }) {
  const [open, setOpen] = useState(false);

  // Parse sections from markdown-like text
  const lines = recipe.split("\n").filter(l => l.trim());
  const titleLine = lines.find(l => l.startsWith("##")) || lines[0];
  const title = titleLine.replace(/^#+\s*/, "").replace(/\*\*/g, "");

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      border: "1px solid #fde8d8",
      marginBottom: "1.5rem",
      animation: "slideUp 0.5s cubic-bezier(0.22,1,0.36,1)"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
        padding: "1.5rem",
        borderBottom: "1px solid #fde8d8",
        cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }} onClick={() => setOpen(!open)}>
        <div>
          <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>🍳</div>
          <h3 style={{
            margin: 0, fontSize: "1.2rem", fontWeight: 700,
            color: "#7c2d12", fontFamily: "'Zen Kaku Gothic New', sans-serif"
          }}>{title}</h3>
        </div>
        <span style={{
          fontSize: "1.4rem", transition: "transform 0.3s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          color: "#f97316"
        }}>▾</span>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "1.5rem" }}>
          {lines.slice(1).map((line, i) => {
            if (line.startsWith("###")) {
              return (
                <h4 key={i} style={{
                  color: "#ea580c", fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em",
                  margin: "1.2rem 0 0.5rem 0", textTransform: "uppercase"
                }}>{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h4>
              );
            }
            if (line.startsWith("##")) return null;
            if (line.match(/^\d+\./)) {
              return (
                <div key={i} style={{
                  display: "flex", gap: "10px", marginBottom: "8px",
                  alignItems: "flex-start"
                }}>
                  <span style={{
                    background: "#f97316", color: "white", borderRadius: "50%",
                    width: "22px", height: "22px", minWidth: "22px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700, marginTop: "1px"
                  }}>{line.match(/^\d+/)[0]}</span>
                  <p style={{ margin: 0, color: "#374151", lineHeight: 1.6, fontSize: "0.9rem" }}>
                    {line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "")}
                  </p>
                </div>
              );
            }
            if (line.startsWith("-") || line.startsWith("・")) {
              return (
                <div key={i} style={{
                  display: "flex", gap: "8px", marginBottom: "4px",
                  alignItems: "center"
                }}>
                  <span style={{ color: "#f97316", fontSize: "0.8rem" }}>◆</span>
                  <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem" }}>
                    {line.replace(/^[-・]\s*/, "").replace(/\*\*/g, "")}
                  </p>
                </div>
              );
            }
            if (line.trim()) {
              return (
                <p key={i} style={{ color: "#4b5563", lineHeight: 1.7, margin: "0.3rem 0", fontSize: "0.9rem" }}>
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(3);
  const [style, setStyle] = useState("和食");
  const [streamText, setStreamText] = useState("");

  const addIngredient = (name) => {
    const trimmed = name.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
    }
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(input);
      setInput("");
    }
  };

  const removeIngredient = (name) => {
    setIngredients(prev => prev.filter(i => i !== name));
  };

  const generateRecipes = useCallback(async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError("");
    setRecipes([]);
    setStreamText("");

    const prompt = `以下の食材を使った${style}のレシピを${count}品考えてください。

食材: ${ingredients.join("、")}

各レシピは必ず以下のフォーマットで書いてください：

## レシピ名

### 材料（2人分）
- 食材と分量

### 作り方
1. 手順1
2. 手順2
3. 手順3（以降も同様）

### ポイント
- コツや注意点

---

${count}品すべてをこのフォーマットで続けて書いてください。`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "";

      // Split into individual recipes
      const parts = text.split(/\n---\n/).filter(p => p.trim());
      setRecipes(parts.length > 0 ? parts : [text]);
    } catch (err) {
      setError("レシピの生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }, [ingredients, count, style]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #fff7ed; }
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .suggest-btn:hover {
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          color: white !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249,115,22,0.3) !important;
        }
        .gen-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(249,115,22,0.5) !important;
        }
        .gen-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)",
        fontFamily: "'Zen Kaku Gothic New', sans-serif",
        padding: "2rem 1rem 4rem"
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{
              fontSize: "4rem", marginBottom: "0.5rem",
              animation: "float 3s ease-in-out infinite"
            }}>🍳</div>
            <h1 style={{
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900,
              color: "#7c2d12", margin: "0 0 0.5rem",
              letterSpacing: "-0.02em", lineHeight: 1.1
            }}>冷蔵庫の食材で<br/>レシピ自動生成</h1>
            <p style={{ color: "#9a3412", fontSize: "1rem", margin: 0 }}>
              今ある食材を入力するだけで、AIがレシピを提案します
            </p>
          </div>

          {/* Input card */}
          <div style={{
            background: "white", borderRadius: "24px",
            padding: "2rem", marginBottom: "1.5rem",
            boxShadow: "0 8px 40px rgba(249,115,22,0.12)",
            border: "1px solid #fde8d8"
          }}>
            <label style={{
              display: "block", fontWeight: 700, color: "#7c2d12",
              marginBottom: "0.75rem", fontSize: "0.95rem"
            }}>🥕 食材を入力（Enterで追加）</label>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: "8px",
              minHeight: "48px", padding: "10px 12px",
              border: "2px solid #fed7aa", borderRadius: "12px",
              background: "#fff7ed", marginBottom: "1rem",
              alignItems: "center", cursor: "text"
            }} onClick={() => document.getElementById("ing-input").focus()}>
              {ingredients.map(ing => (
                <Tag key={ing} label={ing} onRemove={removeIngredient} />
              ))}
              <input
                id="ing-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder={ingredients.length === 0 ? "例：卵、玉ねぎ、豚肉..." : "追加する食材..."}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: "0.95rem", color: "#374151", minWidth: "120px",
                  fontFamily: "'Zen Kaku Gothic New', sans-serif"
                }}
              />
            </div>

            {/* Suggestions */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#9a3412", fontWeight: 600, marginBottom: "8px" }}>
                よく使われる食材：
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {INGREDIENT_SUGGESTIONS.filter(s => !ingredients.includes(s)).slice(0, 15).map(s => (
                  <button key={s} className="suggest-btn" onClick={() => addIngredient(s)} style={{
                    background: "white", border: "1.5px solid #fed7aa",
                    color: "#c2410c", borderRadius: "999px",
                    padding: "3px 12px", fontSize: "0.8rem", cursor: "pointer",
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    fontWeight: 500, transition: "all 0.15s ease"
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ fontSize: "0.8rem", color: "#9a3412", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  🍱 料理ジャンル
                </label>
                <select value={style} onChange={e => setStyle(e.target.value)} style={{
                  width: "100%", padding: "8px 12px", borderRadius: "10px",
                  border: "2px solid #fed7aa", background: "#fff7ed",
                  color: "#7c2d12", fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", outline: "none"
                }}>
                  {["和食", "洋食", "中華", "イタリアン", "韓国料理", "何でもOK"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ fontSize: "0.8rem", color: "#9a3412", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  🔢 提案数
                </label>
                <select value={count} onChange={e => setCount(Number(e.target.value))} style={{
                  width: "100%", padding: "8px 12px", borderRadius: "10px",
                  border: "2px solid #fed7aa", background: "#fff7ed",
                  color: "#7c2d12", fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", outline: "none"
                }}>
                  {[1, 2, 3, 5].map(n => (
                    <option key={n} value={n}>{n}品</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate button */}
            <button
              className="gen-btn"
              onClick={generateRecipes}
              disabled={loading || ingredients.length === 0}
              style={{
                width: "100%", padding: "1rem",
                background: ingredients.length === 0
                  ? "#e5e7eb"
                  : "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
                color: ingredients.length === 0 ? "#9ca3af" : "white",
                border: "none", borderRadius: "14px",
                fontSize: "1.05rem", fontWeight: 700,
                cursor: ingredients.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                boxShadow: ingredients.length === 0 ? "none" : "0 4px 20px rgba(249,115,22,0.35)",
                transition: "all 0.2s ease",
                letterSpacing: "0.05em"
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={{
                    width: "18px", height: "18px", border: "3px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.8s linear infinite"
                  }} />
                  AIがレシピを考えています...
                </span>
              ) : `✨ ${count}品のレシピを生成する`}
            </button>

            {ingredients.length === 0 && (
              <p style={{ textAlign: "center", color: "#f97316", fontSize: "0.8rem", margin: "0.5rem 0 0" }}>
                ↑ まず食材を入力してください
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "12px", padding: "1rem",
              color: "#991b1b", marginBottom: "1.5rem", fontSize: "0.9rem"
            }}>⚠️ {error}</div>
          )}

          {/* Recipes */}
          {recipes.length > 0 && (
            <div>
              <h2 style={{
                color: "#7c2d12", fontWeight: 900, fontSize: "1.2rem",
                marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px"
              }}>
                🍽️ 生成されたレシピ（クリックで展開）
              </h2>
              {recipes.map((recipe, i) => (
                <RecipeCard key={i} recipe={recipe} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
