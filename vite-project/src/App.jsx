import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";
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
  const [learnCard, setLearnCard]   = useState(0);
  const [badges, setBadges]       = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [toast, setToast]         = useState(null);
  const [isCorrectToast, setIsCorrectToast] = useState(false);
  const [progress, setProgress]   = useState({ 
    completedStages: [],
    cardAnswers: {}, // { "stageId-cardIdx": answerData }
  });

  const navigate = (page, opts = {}) => {
    if (page === "learn") {
      if (opts.stageIdx !== undefined) setLearnStage(opts.stageIdx);
      if (opts.cardIdx !== undefined)  setLearnCard(opts.cardIdx);
      else if (opts.stageIdx !== undefined) setLearnCard(0);
    }
    setTab(page);
  };

  const handleUpdateAnswer = (stageId, cardIdx, answer) => {
    setProgress(p => ({
      ...p,
      cardAnswers: {
        ...p.cardAnswers,
        [`${stageId}-${cardIdx}`]: answer
      }
    }));
  };

  const handleCorrect = () => {
    setIsCorrectToast(true);
    setToast("정답이야! 정말 잘했어! 🎉");
    setTimeout(() => { setToast(null); setIsCorrectToast(false); }, 2000);
  };

  const handleBadge = (badge) => {
    setBadges(b => [...new Set([...b, badge])]);
    setToast(badge);
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = (item, stageIdx, cardIdx) => {
    setSavedItems(prev => {
      const exists = prev.find(i => i.title === item.title);
      if (exists) return prev.filter(i => i.title !== item.title);
      return [...prev, { ...item, stageIdx, cardIdx }];
    });
  };

  const handleComplete = (stageId) => {
    setProgress(p => ({ ...p, completedStages: [...new Set([...p.completedStages, stageId])] }));
  };

  return (
    <div className="app-container">
      {/* Sidebar / Tab Bar */}
      <nav className="tab-bar">
        <div className="sidebar-logo">
          <img src={logo} className="cf-logo-img" onClick={() => setTab("home")} alt="logo" />
        </div>
        {TABS.map(t => (
          <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content" style={{ position: "relative" }}>
        <div style={{ display: tab === "home"    ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}><HomePage onNavigate={navigate} progress={progress} /></div>
        <div style={{ display: tab === "learn"   ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <LearnPage 
            initialStage={learnStage} 
            initialCard={learnCard}
            onBadge={handleBadge} 
            onCorrect={handleCorrect}
            onComplete={handleComplete} 
            onNavigate={navigate} 
            onSave={handleSave} 
            onUpdateAnswer={handleUpdateAnswer}
            progress={progress}
            badges={badges}
            savedItems={savedItems} 
          />
        </div>
        <div style={{ display: tab === "code"    ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}><CodePage onCorrect={handleCorrect} /></div>
        <div style={{ display: tab === "profile" ? "flex" : "none", flexDirection: "column", height: "100%", overflow: "hidden" }}><ProfilePage badges={badges} progress={progress} savedItems={savedItems} onNavigate={navigate} /></div>

        {/* Badge/Correct Toast - Now inside main-content */}
        {toast && (
          <div style={{
            position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 200, pointerEvents: "none"
          }}>
            <div style={{
              background: isCorrectToast ? "rgba(52,199,89,0.97)" : "rgba(255,255,255,0.97)",
              backdropFilter: "blur(30px)",
              borderRadius: 28, padding: "28px 40px", textAlign: "center",
              animation: "iosPop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 220,
            }}>
              <div style={{ fontSize: 56, lineHeight: 1, animation: "iosBounce 1s infinite" }}>{isCorrectToast ? "🎉" : "🏆"}</div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: isCorrectToast ? "#fff" : "#000" }}>{isCorrectToast ? "정답이야!" : "뱃지 획득!"}</div>
              <div style={{ fontSize: 14, color: isCorrectToast ? "rgba(255,255,255,0.8)" : "#8e8e93", fontWeight: 500 }}>{toast}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
