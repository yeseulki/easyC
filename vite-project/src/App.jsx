import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import HomePage    from "./pages/HomePage";
import LearnPage   from "./pages/LearnPage";
import CodePage    from "./pages/CodePage";
import ProfilePage from "./pages/ProfilePage";

const TABS = [
  { id: "home",    label: "홈",     icon: "🏠" },
  { id: "learn",   label: "학습",   icon: "📚" },
  { id: "code",    label: "코딩",   icon: "💻" },
  { id: "profile", label: "내 정보", icon: "👤" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [navData, setNavData] = useState({});
  const [badges, setBadges] = useState(["🏆 환경 설정 완료"]);
  const [progress, setProgress] = useState({
    completedStages: [],
    cardAnswers: {},
    viewedTips: {}
  });
  const [savedItems, setSavedItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isCorrectToast, setIsCorrectToast] = useState(false);

  const showToast = (msg, correct = false) => {
    setToast(msg);
    setIsCorrectToast(correct);
    setTimeout(() => setToast(null), 2500);
  };

  const handleNavigate = (target, data = {}) => {
    setTab(target);
    setNavData(data);
  };

  const handleBadge = (b) => {
    if (!badges.includes(b)) {
      setBadges([...badges, b]);
      showToast(`🏆 뱃지 획득: ${b}`, true);
    }
  };

  const handleTipViewed = (stageIdx, cardIdx) => {
    setProgress(prev => ({
      ...prev,
      viewedTips: { ...prev.viewedTips, [`${stageIdx}-${cardIdx}`]: true }
    }));
  };

  const handleUpdateAnswer = (stageId, cardIdx, answer) => {
    setProgress(prev => ({
      ...prev,
      cardAnswers: {
        ...prev.cardAnswers,
        [`${stageId}-${cardIdx}`]: answer
      }
    }));
  };

  const handleSave = (card, stageIdx, cardIdx) => {
    const isAlreadySaved = savedItems.some(item => item.title === card.title);
    if (isAlreadySaved) {
      setSavedItems(savedItems.filter(item => item.title !== card.title));
      showToast("🔖 저장이 취소되었습니다.");
    } else {
      setSavedItems([...savedItems, { ...card, stageIdx, cardIdx }]);
      showToast("🔖 학습 카드가 저장되었습니다.", true);
    }
  };

  const handleCompleteStage = (stageId) => {
    if (!progress.completedStages.includes(stageId)) {
      setProgress(prev => ({
        ...prev,
        completedStages: [...prev.completedStages, stageId]
      }));
    }
  };

  const getPageTitle = () => {
    switch(tab) {
      case "home":    return "홈";
      case "learn":   return "학습하기";
      case "code":    return "코딩하기";
      case "profile": return "내 정보";
      default:        return "";
    }
  };

  return (
    <>
    <div className="app-container">
      {/* Sidebar / Tab Bar */}
      <nav className="tab-bar">
        <div className="sidebar-logo-group">
          <div className="sidebar-logo" onClick={() => setTab("home")}>
            <span className="cf-logo">easy<b>C</b></span>
          </div>
          <div className="desktop-page-title">{getPageTitle()}</div>
        </div>
        <div className="tab-items-wrapper">
          {TABS.map(t => (
            <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {tab === "home"    && <HomePage onNavigate={handleNavigate} progress={progress} />}
        {tab === "learn"   && (
          <LearnPage 
            key={`${navData.stageIdx}-${navData.cardIdx}`}
            initialStage={navData.stageIdx || 0} 
            initialCard={navData.cardIdx || 0}
            onBadge={handleBadge}
            onCorrect={() => showToast("정답이야! 완벽해! 🌟", true)}
            onComplete={handleCompleteStage}
            onNavigate={handleNavigate}
            onSave={handleSave}
            savedItems={savedItems}
            onUpdateAnswer={handleUpdateAnswer}
            onTipViewed={handleTipViewed}
            progress={progress}
            badges={badges}
          />
        )}
        {tab === "code"    && <CodePage onCorrect={() => showToast("코드가 실행되었습니다!", true)} onNavigate={handleNavigate} />}
        {tab === "profile" && <ProfilePage badges={badges} progress={progress} savedItems={savedItems} onNavigate={handleNavigate} />}

        {/* Global Toast */}
        {toast && (
          <div className="ios-toast-container">
            <div className={`ios-toast ${isCorrectToast ? 'success' : ''}`}>
              <div style={{ fontSize: 16 }}>{isCorrectToast ? "✨" : "🔖"}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{isCorrectToast ? "성공!" : "뱃지 획득!"}</div>
              <div style={{ fontSize: 14, color: isCorrectToast ? "rgba(255,255,255,0.8)" : "#8e8e93", fontWeight: 500 }}>{toast}</div>
            </div>
          </div>
        )}
      </main>
    </div>
    <Analytics />
    </>
  );
}
