import { useState, useEffect } from "react";
import "./App.css";

const UI = {
  en: {
    title: "Smart Gift Finder",
    subtitle: "Tell us who you're shopping for — baby's age, budget, preferences — and our",
    subtitleBold: "AI",
    subtitleEnd: "will curate perfect gift ideas instantly.",
    placeholder: "e.g. Gift for a mom with a 6-month-old baby under 200 AED",
    button: "Find Gifts",
    searching: "Analyzing...",
    loadingText: "Our AI is curating the perfect selection for you...",
    resultsTitle: "AI-Curated Recommendations",
    resultCount: (n) => `Discovered ${n} tailored gift ideas`,
    whyGift: "AI Reasoning",
    emptyText: "Enter a prompt or select a suggestion to begin your search.",
    errorGeneric: "Connection failed. Please check if the server is running.",
    errorUnclear: "Request not recognized. Try including age, budget, or gift type.",
    footer: "Smart Gift Finder • UAE & GCC Edition",
    suggestions: [
      "Gift for a mom with a 6-month-old under 200 AED",
      "Luxury gift for mom after delivery",
      "Useful baby products for 1 year old",
      "Self-care gift set for new mom under 300 AED",
    ],
  },
  ar: {
    title: "مكتشف الهدايا الذكي",
    subtitle: "أخبرنا لمن تبحث عن هدية — عمر الطفل، ميزانيتك، تفضيلاتك — و",
    subtitleBold: "الذكاء الاصطناعي",
    subtitleEnd: "سيقترح لك أفضل الهدايا فوراً.",
    placeholder: "مثال: هدية لأم طفلها عمره ٦ أشهر بأقل من ٢٠٠ درهم",
    button: "بحث عن هدايا",
    searching: "جاري التحليل...",
    loadingText: "الذكاء الاصطناعي يختار لك أفضل الهدايا بعناية...",
    resultsTitle: "توصيات الذكاء الاصطناعي",
    resultCount: (n) => `تم اكتشاف ${n} فكرة هدية مخصصة`,
    whyGift: "تحليل الذكاء الاصطناعي",
    emptyText: "اكتب طلبك أعلاه أو اختر أحد الاقتراحات للبدء.",
    errorGeneric: "فشل الاتصال. يرجى التأكد من تشغيل الخادم.",
    errorUnclear: "لم نتمكن من فهم طلبك. حاول تحديد العمر أو الميزانية.",
    footer: "مكتشف الهدايا الذكي • نسخة الإمارات والخليج",
    suggestions: [
      "هدية لأم طفلها عمره ٦ أشهر بأقل من ٢٠٠ درهم",
      "هدية فاخرة للأم بعد الولادة",
      "منتجات مفيدة لطفل عمره سنة",
      "طقم عناية شخصية للأم الجديدة",
    ],
  },
};

function localize(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.en || field.ar || "";
}

function App() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupError, setSetupError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  
  const t = UI[lang];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    
    setLoading(true);
    setError("");
    setSetupError("");
    setResults([]);
    setHasSearched(true);

    try {
      const res = await fetch("http://localhost:5000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      if (res.status === 503 && data.setup) {
        setSetupError(data.setup);
        return;
      }
      
      if (!res.ok) {
        setError(data.error || t.errorGeneric);
        return;
      }

      if (data.message === "I don't know") {
        setError(t.errorUnclear);
      } else if (data.products?.length > 0) {
        setResults(data.products);
      } else {
        setError(t.errorUnclear);
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const handleSuggestion = (s) => { setQuery(s); handleSearch(s); };

  return (
    <div className="app-wrapper" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Mesh Background blobs */}
      <div className="bg-mesh">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
      </div>

      <div className="lang-toggle">
        <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
        <button className={`lang-btn ${lang === "ar" ? "active" : ""}`} onClick={() => setLang("ar")}>عربي</button>
      </div>

      <header className="hero">
        <span className="hero-emoji">🎁</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle} <strong>{t.subtitleBold}</strong> {t.subtitleEnd}</p>
      </header>

      <section className="search-container">
        <div className="search-box">
          <input 
            className="search-input" 
            placeholder={t.placeholder}
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="search-btn" onClick={() => handleSearch()} disabled={loading || !query.trim()}>
            {loading ? t.searching : <><span className="btn-icon">✨</span> {t.button}</>}
          </button>
        </div>
        <div className="suggestion-list">
          {t.suggestions.map((s, i) => (
            <button key={i} className="suggestion-pill" onClick={() => handleSuggestion(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="loading-shimmer">
          <p className="loading-text">{t.loadingText}</p>
        </div>
      )}

      {setupError && !loading && (
        <div className="error-banner setup" role="alert">
          <span>⚙️</span>
          <div>
            <strong>Setup Required</strong><br />
            {setupError}
          </div>
        </div>
      )}

      {error && !loading && !setupError && (
        <div className="error-banner" role="alert">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {results.length > 0 && !loading && (
        <section className="results-container">
          <div className="results-header">
            <h2>{t.resultsTitle}</h2>
            <p className="result-count">{t.resultCount(results.length)}</p>
          </div>
          <div className="results-grid">
            {results.map((item, i) => {
              const level = (item.confidence || "medium").toLowerCase();
              return (
                <article className="product-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="card-top">
                    <div>
                      <div className="confidence-bar">
                        <div className={`confidence-fill ${level}`}></div>
                      </div>
                      <span className="card-category">📦 {localize(item.category, lang)}</span>
                    </div>
                  </div>
                  <h3 className="card-title">{localize(item.name, lang)}</h3>
                  <div className="card-price">💰 {item.price_range}</div>
                  <div className="reasoning-box">
                    <span className="reasoning-label">{t.whyGift}</span>
                    <p className="reasoning-text">{localize(item.reason, lang)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!loading && !error && !setupError && results.length === 0 && !hasSearched && (
        <div className="empty-state">
          <span className="empty-emoji">💝</span>
          <p className="empty-text">{t.emptyText}</p>
        </div>
      )}

      <footer className="app-footer">
        <p>{t.footer} © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;