import { useState } from "react";
import "./App.css";
import HomePage    from "./pages/HomePage";
import LearnPage   from "./pages/LearnPage";
import CodePage    from "./pages/CodePage";
import ProfilePage from "./pages/ProfilePage";

const TABS = [
  { id: "home",    icon: "🏠", label: "홈" },
  { id: "learn",   icon: "📚", label: "학습" },
  { id: "code",    icon: "⌨️",  label: "코딩" },
  { id: "profile", icon: "👤", label: "내 정보" },
];

export default function App() {
  const [tab, setTab]             = useState("home");
  const [learnStage, setLearnStage] = useState(0);
  const [badges, setBadges]       = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [toast, setToast]         = useState(null);
  const [progress, setProgress]   = useState({ completedStages: [] });

  const navigate = (page, opts = {}) => {
    if (page === "learn" && opts.stageIdx !== undefined) setLearnStage(opts.stageIdx);
    setTab(page);
  };

  const handleBadge = (badge) => {
    setBadges(b => [...new Set([...b, badge])]);
    setToast(badge);
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = (item) => {
    setSavedItems(prev => {
      const exists = prev.find(i => i.title === item.title);
      if (exists) return prev.filter(i => i.title !== item.title);
      return [...prev, item];
    });
  };

  const handleComplete = (stageId) => {
    setProgress(p => ({ ...p, completedStages: [...new Set([...p.completedStages, stageId])] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#f2f2f7" }}>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: tab === "home"    ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}><HomePage onNavigate={navigate} progress={progress} /></div>
        <div style={{ display: tab === "learn"   ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <LearnPage 
            initialStage={learnStage} 
            onBadge={handleBadge} 
            onComplete={handleComplete} 
            onNavigate={navigate} 
            onSave={handleSave} 
            savedItems={savedItems} 
          />
        </div>
        <div style={{ display: tab === "code"    ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}><CodePage /></div>
        <div style={{ display: tab === "profile" ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}><ProfilePage badges={badges} progress={progress} savedItems={savedItems} /></div>
      </div>

      {/* Tab Bar */}
      <nav className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Badge Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "35%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(30px)",
          borderRadius: 28, padding: "28px 40px", textAlign: "center", zIndex: 200,
          animation: "iosPop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 220,
        }}>
          <div style={{ fontSize: 56, lineHeight: 1, animation: "iosBounce 1s infinite" }}>🏆</div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: "#000" }}>뱃지 획득!</div>
          <div style={{ fontSize: 14, color: "#8e8e93", fontWeight: 500 }}>{toast}</div>
        </div>
      )}
    </div>
  );
}
