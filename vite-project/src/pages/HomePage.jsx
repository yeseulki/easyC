import { stages } from "../data/curriculum";

const CORE_FEATURES = [
  { icon: "📖", type: "concept", title: "개념 학습", sub: "핵심 개념부터 차근차근" },
  { icon: "💻", type: "code",    title: "실습",      sub: "코드를 직접 완성하며 학습" },
  { icon: "🚀", type: "project", title: "프로젝트",  sub: "만들며 배우는 커리큘럼" },
];

export default function HomePage({ onNavigate, progress }) {
  const done = progress.completedStages || [];
  const pct  = Math.round((done.length / stages.length) * 100);

  const handleFeatureClick = (type) => {
    const currentStageIdx = Math.min(progress.completedStages.length, stages.length - 1);
    const stage = stages[currentStageIdx];
    if (!stage) return;

    let cardIdx = stage.cards.findIndex(card => card.type === type);
    if (cardIdx === -1) { // If no card of this type, go to first card of the stage
      cardIdx = 0;
    }
    
    onNavigate('learn', { stageIdx: currentStageIdx, cardIdx });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f2f2f7" }}>

      {/* Unified Nav */}
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group" style={{ gap: 16 }}>
            <span className="cf-logo" style={{ fontSize: 28 }}>easy<b>C</b></span>
            <div className="ios-nav-large-title">홈</div>
          </div>
          <span className="cf-beta">Beta</span>
        </div>
        <div className="cf-tabs"
          onMouseDown={e => { e.currentTarget._isDown = true; e.currentTarget._startX = e.pageX - e.currentTarget.offsetLeft; e.currentTarget._scrollLeft = e.currentTarget.scrollLeft; e.currentTarget.style.cursor = 'grabbing'; }}
          onMouseLeave={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseUp={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseMove={e => { if (!e.currentTarget._isDown) return; e.preventDefault(); const x = e.pageX - e.currentTarget.offsetLeft; const walk = (x - e.currentTarget._startX) * 2; e.currentTarget.scrollLeft = e.currentTarget._scrollLeft - walk; }}
          onWheel={e => { if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }}
          style={{ cursor: 'grab', marginTop: 14 }}
        >
          {["전체", "기초", "조건/반복", "배열/함수", "포인터", "심화"].map((t, i) => (
            <button key={t} className={`cf-tab ${i === 0 ? "active" : "inactive"}`}
              onClick={() => onNavigate("learn", { stageIdx: i === 0 ? 0 : [0, 0, 2, 3, 4, 5][i] })}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px var(--nav-h)" }}>

        {/* Hero card */}
        <div style={s.heroCard}>
          <div style={s.heroBlob1} /><div style={s.heroBlob2} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#007aff", letterSpacing: 0.5, marginBottom: 12 }}>⚡C언어 학습 플랫폼</div>
            <h1 style={s.heroTitle}>
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
              <button style={{ flex: 1, padding: "13px 0", background: "var(--blue)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,122,255,0.3)" }} onClick={() => onNavigate("learn")}>
                학습 시작하기 →
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

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[{ n: "8", l: "단계", c: "#007aff" }, { n: "25+", l: "카드", c: "#5856d6" }, { n: "8", l: "프로젝트", c: "#34c759" }, { n: "100%", l: "자율학습", c: "#ff9500" }].map(st => (
            <div key={st.l} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "14px 0", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: st.c, letterSpacing: -0.5 }}>{st.n}</div>
              <div style={{ fontSize: 11, color: "#8e8e93", marginTop: 2, fontWeight: 500 }}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* Stage grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12, color: "#000" }}>커리큘럼</div>
          <div className="responsive-grid grid-2">
            {stages.map((stage, i) => {
              const completed = done.includes(stage.id);
              return (
                <div key={stage.id} style={{ background: "#fff", border: `1px solid ${completed ? stage.color + "55" : "rgba(0,0,0,0.07)"}`, borderRadius: 18, padding: "16px", cursor: "pointer", boxShadow: completed ? `0 2px 12px ${stage.color}22` : "0 1px 4px rgba(0,0,0,0.06)" }}
                  onClick={() => onNavigate("learn", { stageIdx: i })}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 26 }}>{stage.emoji}</span>
                    {completed
                      ? <span style={{ fontSize: 11, color: stage.color, fontWeight: 700, background: stage.color + "15", padding: "3px 8px", borderRadius: 100 }}>완료 ✓</span>
                      : <span style={{ fontSize: 18, fontWeight: 900, color: "rgba(0,0,0,0.07)", letterSpacing: -1 }}>{`0${stage.id}`}</span>
                    }
                  </div>
                  <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, letterSpacing: -0.3, color: "#000" }}>{stage.title}</div>
                  <div style={{ fontSize: 12, color: stage.color, marginTop: 3, fontWeight: 600 }}>{stage.subtitle}</div>
                  <div style={{ fontSize: 11, color: "#8e8e93", marginTop: 8 }}>카드 {stage.cards.length}개</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12, color: "#000" }}>핵심 기능</div>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            {CORE_FEATURES.map((f, i) => (
              <div key={f.title} className="ios-cell" style={{ cursor: "pointer" }} onClick={() => handleFeatureClick(f.type)}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: f.bg || 'none', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#000" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#8e8e93", marginTop: 1 }}>{f.sub}</div>
                </div>
                <span className="ios-chevron">›</span>
              </div>
            ))}
          </div>
        </div>



      </div>
    </div>
  );
}

const s = {
  heroCard: {
    background: "#fff",
    borderRadius: 22, padding: "24px 20px",
    marginBottom: 16,
    position: "relative", overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  heroBlob1: { position:"absolute", top:-60, right:-60, width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,122,255,0.1),transparent 70%)", pointerEvents:"none" },
  heroBlob2: { position:"absolute", bottom:-40, left:-40, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle,rgba(88,86,214,0.08),transparent 70%)", pointerEvents:"none" },
  heroTitle: { marginBottom: 12, lineHeight: 0.95 },
};
