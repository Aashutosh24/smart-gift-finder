import { useState } from "react";
import "./App.css";

const UI = {
  en: {
    title: "Smart Gift Finder",
    subtitle: "Tell us who you\u2019re shopping for \u2014 baby\u2019s age, budget, preferences \u2014 and our",
    subtitleBold: "AI",
    subtitleEnd: "will curate perfect gift ideas instantly.",
    placeholder: "e.g. Gift for a mom with a 6-month-old baby under 200 AED",
    button: "Find Gifts",
    searching: "Searching\u2026",
    loadingText: "AI is analyzing your request\u2026",
    resultsTitle: "\uD83C\uDF80 Gift Recommendations",
    resultCount: (n) => `${n} curated suggestion${n > 1 ? "s" : ""}`,
    whyGift: "Why this gift?",
    emptyText: "Type a gift request above or tap a suggestion to get started!",
    errorGeneric: "Unable to connect. Make sure the backend is running on port 5000.",
    errorUnclear: "Couldn\u2019t understand your request. Try being more specific about baby\u2019s age, budget, or gift type.",
    footer: "Powered by AI \u00B7 Smart Gift Finder",
    suggestions: [
      "Gift for a mom with a 6-month-old under 200 AED",
      "Luxury gift for mom after delivery",
      "Useful baby products for 1 year old",
      "Gift for newborn baby under 100 AED",
      "Self-care gift set for new mom under 300 AED",
    ],
  },
  ar: {
    title: "\u0645\u064F\u0643\u062A\u0634\u0641 \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0627\u0644\u0630\u0643\u064A",
    subtitle: "\u0623\u062E\u0628\u0631\u0646\u0627 \u0644\u0645\u0646 \u062A\u0628\u062D\u062B \u0639\u0646 \u0647\u062F\u064A\u0629 \u2014 \u0639\u0645\u0631 \u0627\u0644\u0637\u0641\u0644\u060C \u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0643\u060C \u062A\u0641\u0636\u064A\u0644\u0627\u062A\u0643 \u2014 \u0648",
    subtitleBold: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    subtitleEnd: "\u064A\u0642\u062A\u0631\u062D \u0644\u0643 \u0623\u0641\u0636\u0644 \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0641\u0648\u0631\u0627\u064B.",
    placeholder: "\u0645\u062B\u0627\u0644: \u0647\u062F\u064A\u0629 \u0644\u0623\u0645 \u0637\u0641\u0644\u0647\u0627 \u0639\u0645\u0631\u0647 \u0666 \u0623\u0634\u0647\u0631 \u0628\u0623\u0642\u0644 \u0645\u0646 \u0662\u0660\u0660 \u062F\u0631\u0647\u0645",
    button: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0647\u062F\u0627\u064A\u0627",
    searching: "\u062C\u0627\u0631\u064A \u0627\u0644\u0628\u062D\u062B\u2026",
    loadingText: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u064A\u062D\u0644\u0644 \u0637\u0644\u0628\u0643\u2026",
    resultsTitle: "\uD83C\uDF80 \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629",
    resultCount: (n) => `${n} \u0627\u0642\u062A\u0631\u0627\u062D${n > 1 ? "\u0627\u062A" : ""}`,
    whyGift: "\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u0647\u062F\u064A\u0629\u061F",
    emptyText: "\u0627\u0643\u062A\u0628 \u0637\u0644\u0628\u0643 \u0623\u0639\u0644\u0627\u0647 \u0623\u0648 \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u062D\u062F \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A!",
    errorGeneric: "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644. \u062A\u0623\u0643\u062F \u0645\u0646 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062E\u0627\u062F\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0641\u0630 5000.",
    errorUnclear: "\u0644\u0645 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u0641\u0647\u0645 \u0637\u0644\u0628\u0643. \u062D\u0627\u0648\u0644 \u062A\u062D\u062F\u064A\u062F \u0639\u0645\u0631 \u0627\u0644\u0637\u0641\u0644 \u0623\u0648 \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0623\u0648 \u0646\u0648\u0639 \u0627\u0644\u0647\u062F\u064A\u0629.",
    footer: "\u0645\u062F\u0639\u0648\u0645 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u00B7 \u0645\u064F\u0643\u062A\u0634\u0641 \u0627\u0644\u0647\u062F\u0627\u064A\u0627",
    suggestions: [
      "\u0647\u062F\u064A\u0629 \u0644\u0623\u0645 \u0637\u0641\u0644\u0647\u0627 \u0639\u0645\u0631\u0647 \u0666 \u0623\u0634\u0647\u0631 \u0628\u0623\u0642\u0644 \u0645\u0646 \u0662\u0660\u0660 \u062F\u0631\u0647\u0645",
      "\u0647\u062F\u064A\u0629 \u0641\u0627\u062E\u0631\u0629 \u0644\u0644\u0623\u0645 \u0628\u0639\u062F \u0627\u0644\u0648\u0644\u0627\u062F\u0629",
      "\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0641\u064A\u062F\u0629 \u0644\u0637\u0641\u0644 \u0639\u0645\u0631\u0647 \u0633\u0646\u0629",
      "\u0647\u062F\u064A\u0629 \u0644\u0645\u0648\u0644\u0648\u062F \u062C\u062F\u064A\u062F \u0628\u0623\u0642\u0644 \u0645\u0646 \u0661\u0660\u0660 \u062F\u0631\u0647\u0645",
      "\u0637\u0642\u0645 \u0639\u0646\u0627\u064A\u0629 \u0634\u062E\u0635\u064A\u0629 \u0644\u0644\u0623\u0645 \u0627\u0644\u062C\u062F\u064A\u062F\u0629",
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
      if (!res.ok) { setError(data.error || t.errorGeneric); return; }
      if (data.message === "I don't know") { setError(t.errorUnclear); }
      else if (data.products?.length > 0) { setResults(data.products); }
      else { setError(t.errorUnclear); }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const handleSuggestion = (s) => { setQuery(s); handleSearch(s); };
  const confClass = (c) => {
    const v = (c || "").toLowerCase();
    if (v.includes("high")) return "high";
    if (v.includes("med")) return "medium";
    return "low";
  };

  return (
    <div className="app-wrapper" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div className="lang-toggle" id="lang-toggle">
        <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
        <button className={`lang-btn ${lang === "ar" ? "active" : ""}`} onClick={() => setLang("ar")}>عربي</button>
      </div>

      <header className="hero">
        <span className="hero-emoji" role="img" aria-label="gift">🎁</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle} <strong>{t.subtitleBold}</strong> {t.subtitleEnd}</p>
      </header>

      <section className="search-card" id="search-section">
        <div className="search-card-inner">
          <input id="search-input" className="search-input" type="text" placeholder={t.placeholder}
            value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            disabled={loading} aria-label="Gift search query" />
          <button id="search-button" className="search-btn" onClick={() => handleSearch()}
            disabled={loading || !query.trim()}>
            <span className="btn-icon">✨</span>
            {loading ? t.searching : t.button}
          </button>
        </div>
        <div className="suggestions">
          {t.suggestions.map((s, i) => (
            <button key={i} className="suggestion-pill" onClick={() => handleSuggestion(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="loading-container" role="status">
          <div className="loading-spinner" />
          <p className="loading-text"><span className="shimmer">{t.loadingText}</span></p>
        </div>
      )}

      {setupError && !loading && (
        <div className="error-banner setup" role="alert">
          <span>⚙️</span>
          <div>
            <strong>AI Setup Required</strong><br />
            {setupError}
          </div>
        </div>
      )}

      {error && !loading && !setupError && (
        <div className="error-banner" role="alert" id="error-banner">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {results.length > 0 && !loading && (
        <section className="results-section" id="results-section">
          <div className="results-header">
            <h2>{t.resultsTitle}</h2>
            <p className="result-count">{t.resultCount(results.length)}</p>
          </div>
          <div className="results-grid">
            {results.map((item, i) => {
              const level = confClass(item.confidence);
              return (
                <article className="product-card" key={i} id={`product-card-${i}`}>
                  <div className="card-header">
                    <h3 className="card-title">{localize(item.name, lang)}</h3>
                    <span className={`confidence-badge ${level}`}>
                      <span className="confidence-dot" />{item.confidence}
                    </span>
                  </div>
                  <span className="card-category">📦 {localize(item.category, lang)}</span>
                  <div className="card-price"><span className="price-icon">💰</span>{item.price_range}</div>
                  <p className="card-reason"><strong>{t.whyGift}</strong> {localize(item.reason, lang)}</p>
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