import { useState } from "react";
import HomePage    from "./pages/HomePage";
import LearnPage   from "./pages/LearnPage";
import CodePage    from "./pages/CodePage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [tab, setTab]             = useState("home");    
  const [learnStage, setLearnStage] = useState(0);       
  const [badges, setBadges]       = useState([]);        
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

  const handleComplete = (stageId) => {
    setProgress(p => ({ ...p, completedStages: [...new Set([...p.completedStages, stageId])] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--canvas)" }}>
      
      {/* Global Nav */}
      <nav className="global-nav">
        <div className="nav-content" style={{ maxWidth: 1024 }}>
          <div style={{ fontWeight: 600, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onClick={() => setTab("home")}>
            <span style={{ fontSize: 20 }}></span>
            <span>easyC</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setTab("home")} className="nav-link">Home</button>
            <button onClick={() => setTab("learn")} className="nav-link">Learn</button>
            <button onClick={() => setTab("code")} className="nav-link">Code</button>
            <button onClick={() => setTab("profile")} className="nav-link">Profile</button>
          </div>
        </div>
      </nav>

      {/* Sub Nav */}
      <nav className="sub-nav-frosted">
        <div className="nav-content" style={{ maxWidth: 1024 }}>
          <span className="tagline" style={{ fontSize: 21 }}>
            {tab === "home" ? "easyC" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 12, color: "var(--ink-muted-80)", cursor: "pointer" }} onClick={() => setTab("learn")}>Overview</span>
            <span style={{ fontSize: 12, color: "var(--ink-muted-80)", cursor: "pointer" }} onClick={() => setTab("code")}>Editor</span>
            <button className="button-primary" style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => navigate("learn")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: tab === "home"    ? "flex" : "none", flexDirection: "column", flex: 1 }}><HomePage onNavigate={navigate} progress={progress} /></div>
        <div style={{ display: tab === "learn"   ? "flex" : "none", flexDirection: "column", flex: 1 }}><LearnPage initialStage={learnStage} onDrC={() => setTab("learn")} onBadge={handleBadge} onComplete={handleComplete} /></div>
        <div style={{ display: tab === "code"    ? "flex" : "none", flexDirection: "column", flex: 1 }}><CodePage /></div>
        <div style={{ display: tab === "profile" ? "flex" : "none", flexDirection: "column", flex: 1 }}><ProfilePage badges={badges} progress={progress} /></div>
      </main>

      {/* Badge Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: 20, padding: "16px 24px", textAlign: "center", zIndex: 200,
          animation: "fadeIn 0.4s ease-out",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>🎖️</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Badge Earned</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted-80)" }}>{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}
