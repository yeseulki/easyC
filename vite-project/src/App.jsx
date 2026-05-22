import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import HomePage          from "./pages/HomePage";
import LearnPage         from "./pages/LearnPage";
import CodePage          from "./pages/CodePage";
import ProfilePage       from "./pages/ProfilePage";
import OnboardingOverlay from "./components/OnboardingOverlay";

const TABS = [
  { id: "home",    label: "홈",     icon: "🏠" },
  { id: "learn",   label: "학습",   icon: "📚" },
  { id: "code",    label: "코딩",   icon: "💻" },
  { id: "profile", label: "내 정보", icon: "👤" },
];

/* ── localStorage 진도 유틸 ── */
export const saveProgress = (completedStages) => {
  localStorage.setItem("easycProgress", JSON.stringify(completedStages));
};
export const currentProgress = JSON.parse(localStorage.getItem("easycProgress") || "[]");

export default function App() {
  const [tab, setTab] = useState("home");
  const [navData, setNavData] = useState({});

  /* 온보딩 & 닉네임 (localStorage 초기화) */
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem("easycOnboarded"));
  const [nickname,  setNickname]  = useState(() => localStorage.getItem("easycNickname") || "");

  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem("easycBadges");
    const list = saved ? JSON.parse(saved) : [];
    return list.filter(b => b !== "🏆 환경 설정 완료");
  });
  const [progress, setProgress] = useState(() => ({
    completedStages: JSON.parse(localStorage.getItem("easycProgress") || "[]"),
    cardAnswers: JSON.parse(localStorage.getItem("easycCardAnswers") || "{}"),
    viewedTips:   JSON.parse(localStorage.getItem("easycViewedTips")   || "{}"),
  }));
  const [savedItems, setSavedItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isCorrectToast, setIsCorrectToast] = useState(false);

  /* 온보딩 완료 처리 */
  const handleOnboardingComplete = (nick) => {
    localStorage.setItem("easycOnboarded", "true");
    localStorage.setItem("easycNickname", nick);
    setNickname(nick);
    setOnboarded(true);
  };

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
      const updated = [...badges, b];
      setBadges(updated);
      localStorage.setItem("easycBadges", JSON.stringify(updated));
      showToast(`🏆 뱃지 획득: ${b}`, true);
    }
  };

  const handleTipViewed = (stageIdx, cardIdx) => {
    setProgress(prev => {
      const viewedTips = { ...prev.viewedTips, [`${stageIdx}-${cardIdx}`]: true };
      localStorage.setItem("easycViewedTips", JSON.stringify(viewedTips));
      return { ...prev, viewedTips };
    });
  };

  const handleUpdateAnswer = (stageId, cardIdx, answer) => {
    setProgress(prev => {
      const cardAnswers = { ...prev.cardAnswers, [`${stageId}-${cardIdx}`]: answer };
      localStorage.setItem("easycCardAnswers", JSON.stringify(cardAnswers));
      return { ...prev, cardAnswers };
    });
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
      const updated = [...progress.completedStages, stageId];
      setProgress(prev => ({ ...prev, completedStages: updated }));
      saveProgress(updated); // localStorage에 저장
    }
  };

  const getPageTitle = () => {
    switch (tab) {
      case "home":    return "홈";
      case "learn":   return "학습하기";
      case "code":    return "코딩하기";
      case "profile": return "내 정보";
      default:        return "";
    }
  };

  return (
    <>
      {/* 온보딩 오버레이 - 미완료 사용자에게만 표시 */}
      {!onboarded && <OnboardingOverlay onComplete={handleOnboardingComplete} />}

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
          {tab === "home"    && <HomePage onNavigate={handleNavigate} progress={progress} nickname={nickname} />}
          {tab === "learn"   && (
            <LearnPage
              key={`${navData.stageIdx ?? "last"}-${navData.cardIdx ?? "last"}`}
              initialStage={navData.stageIdx ?? (() => { try { return JSON.parse(localStorage.getItem("easycLastPos") || "{}").stageIdx || 0; } catch { return 0; } })()}
              initialCard={navData.cardIdx ?? (() => { try { return JSON.parse(localStorage.getItem("easycLastPos") || "{}").cardIdx || 0; } catch { return 0; } })()}
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
              <div className={`ios-toast ${isCorrectToast ? "success" : ""}`}>
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
