import { stages } from "../data/curriculum";
import { useIsWide, wideSide } from "../hooks/useIsWide";

export default function HomePage({ onNavigate, progress, nickname }) {
  const done = progress.completedStages || [];
  const pct  = Math.round((done.length / stages.length) * 100);
  const isWide = useIsWide();

  // Stage i is accessible only if all previous stages are completed
  const isStageAccessible = (i) => i <= done.length;

  const handleFeatureNavigate = (type) => {
    const currentStageIdx = Math.min(done.length, stages.length - 1);
    const stage = stages[currentStageIdx];
    if (!stage) return;
    let cardIdx = stage.cards.findIndex(card => card.type === type);
    if (cardIdx === -1) cardIdx = 0;
    onNavigate('learn', { stageIdx: currentStageIdx, cardIdx });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f2f2f7" }}>

      {/* Nav */}
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group">
            <span className="cf-logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>easy<b>C</b></span>
          </div>
          <span className="cf-beta">Beta</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px var(--nav-h)", ...wideSide(isWide, 20), ...(isWide ? { paddingTop: 32 } : {}) }}>
        {/* Hero card */}
        <div style={heroStyles.card}>
          <div style={heroStyles.blob1} /><div style={heroStyles.blob2} />
          <div style={{ position: "relative", zIndex: 1 }}>
            {nickname ? (
              <div style={{ fontSize: 14, fontWeight: 700, color: "#007aff", letterSpacing: 0.3, marginBottom: 12 }}>
                ⚡ <span id="user-name">반가워요, {nickname} 개발자님!</span>
              </div>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 700, color: "#007aff", letterSpacing: 0.5, marginBottom: 12 }}>⚡C언어 학습 플랫폼</div>
            )}
            <h1 style={heroStyles.title}>
              <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 300, fontSize: 32, display: "block", marginBottom: 2, letterSpacing: -0.8 }}>What is</span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ background: "linear-gradient(135deg,#007aff,#5856d6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 58, fontWeight: 900, letterSpacing: -2.5 }}>#C</span>
                <span style={{ fontSize: 58, fontWeight: 900, letterSpacing: -2.5, color: "#000" }}>?</span>
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(60,60,67,0.55)", lineHeight: 1.65, marginBottom: 20, fontWeight: 400 }}>
              쉽게 시작하는 C언어
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, padding: "13px 0", background: "var(--blue)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,122,255,0.3)" }} onClick={() => {
                if (done.length > 0) {
                  try {
                    const last = JSON.parse(localStorage.getItem("easycLastPos") || "{}");
                    onNavigate("learn", { stageIdx: last.stageIdx || 0, cardIdx: last.cardIdx || 0 });
                  } catch {
                    onNavigate("learn");
                  }
                } else {
                  onNavigate("learn");
                }
              }}>
                {done.length > 0 ? "이어서 진행하기 →" : "학습 시작하기 →"}
              </button>
            </div>
            {done.length > 0 && (
              <div style={{ marginTop: 14, background: "rgba(0,122,255,0.06)", border: "0.5px solid rgba(0,122,255,0.2)", borderRadius: 12, padding: "12px 14px", cursor: "pointer" }} onClick={() => onNavigate("learn")}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 7, color: "#000" }}>
                  <span>계속 학습하기</span><span style={{ color: "var(--blue)" }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(0,0,0,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--blue)", borderRadius: 3 }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Curriculum stage grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12, color: "#000" }}>스테이지</div>
          <div className="responsive-grid grid-2" style={isWide ? { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" } : undefined}>
            {stages.map((stage, i) => {
              const completed = done.includes(stage.id);
              const accessible = isStageAccessible(i);
              const locked = !accessible;
              return (
                <div
                  key={stage.id}
                  style={{
                    background: locked ? "rgba(0,0,0,0.03)" : "#fff",
                    border: `1px solid ${completed ? stage.color + "55" : locked ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.07)"}`,
                    borderRadius: 18, padding: isWide ? "20px 18px" : "16px",
                    cursor: locked ? "default" : "pointer",
                    boxShadow: completed ? `0 2px 12px ${stage.color}22` : "0 1px 4px rgba(0,0,0,0.06)",
                    opacity: locked ? 0.5 : 1,
                    filter: locked ? "grayscale(0.4)" : "none",
                    transition: "opacity 0.2s"
                  }}
                  onClick={() => { if (!locked) onNavigate("learn", { stageIdx: i }); }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: isWide ? 34 : 26 }}>{locked ? "🔒" : stage.emoji}</span>
                    {completed
                      ? <span style={{ fontSize: 11, color: stage.color, fontWeight: 700, background: stage.color + "15", padding: "3px 8px", borderRadius: 100 }}>완료 ✓</span>
                      : locked
                        ? <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 600, background: "rgba(0,0,0,0.06)", padding: "3px 8px", borderRadius: 100 }}>잠김</span>
                        : <span style={{ fontSize: 18, fontWeight: 900, color: "rgba(0,0,0,0.07)", letterSpacing: -1 }}>{`0${stage.id}`}</span>
                    }
                  </div>
                  <div style={{ marginTop: isWide ? 14 : 10, fontSize: isWide ? 16 : 14, fontWeight: 800, letterSpacing: -0.3, color: locked ? "#8e8e93" : "#000" }}>{stage.title}</div>
                  <div style={{ fontSize: isWide ? 13.5 : 12, color: locked ? "#b0b0b5" : stage.color, marginTop: 3, fontWeight: 600 }}>{stage.subtitle}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const heroStyles = {
  card: {
    background: "#fff",
    borderRadius: 22, padding: "24px 20px",
    marginBottom: 16,
    position: "relative", overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  blob1: { position:"absolute", top:-60, right:-60, width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,122,255,0.1),transparent 70%)", pointerEvents:"none" },
  blob2: { position:"absolute", bottom:-40, left:-40, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle,rgba(88,86,214,0.08),transparent 70%)", pointerEvents:"none" },
  title: { marginBottom: 12, lineHeight: 0.95 },
};
