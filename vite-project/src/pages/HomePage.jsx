import { stages } from "../data/curriculum";

const FEATURES = [
  { icon: "🎰", color: "#ff9500", bg: "rgba(255,149,0,0.1)",  title: "슬롯 코딩",    sub: "코드 안에서 직접 조합" },
  { icon: "🗺️", color: "#5856d6", bg: "rgba(88,86,214,0.1)", title: "메모리 맵",    sub: "포인터를 눈으로 확인" },
  { icon: "🤖", color: "#007aff", bg: "rgba(0,122,255,0.1)",  title: "Dr. C AI",    sub: "정답 대신 유도하는 튜터" },
  { icon: "🚀", color: "#34c759", bg: "rgba(52,199,89,0.1)",  title: "미니 프로젝트",sub: "만들며 배우는 커리큘럼" },
];

export default function HomePage({ onNavigate, progress }) {
  const done = progress.completedStages || [];
  const pct  = Math.round((done.length / stages.length) * 100);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f2f2f7" }}>

      {/* CFeed-style header */}
      <div className="cf-nav">
        <div className="cf-nav-top">
          <span className="cf-logo">Vibe<span style={{ color: "var(--blue)" }}>-C</span></span>
          <span className="cf-beta">Beta</span>
        </div>
        <div className="cf-tabs">
          {["전체", "출력/변수", "조건문", "반복문", "함수", "배열"].map((t, i) => (
            <button key={t} className={`cf-tab ${i === 0 ? "active" : "inactive"}`}
              onClick={() => onNavigate("learn", { stageIdx: Math.max(0, i - 1) })}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>

        {/* Hero card */}
        <div style={s.heroCard}>
          <div style={s.heroBlob1} /><div style={s.heroBlob2} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#007aff", letterSpacing: 0.5, marginBottom: 12 }}>⚡ C언어 학습 플랫폼</div>
            <h1 style={s.heroTitle}>
              <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 300, fontSize: 32, display: "block", marginBottom: 2, letterSpacing: -0.8 }}>What is</span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ background: "linear-gradient(135deg,#007aff,#5856d6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 58, fontWeight: 900, letterSpacing: -2.5 }}>#C</span>
                <span style={{ fontSize: 58, fontWeight: 900, letterSpacing: -2.5, color: "#000" }}>?</span>
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(60,60,67,0.55)", lineHeight: 1.65, marginBottom: 20, fontWeight: 400 }}>
              컴퓨터의 모국어를 영어처럼 자연스럽게.{"\n"}중학생도 즐길 수 있는 C언어 플랫폼 🎵
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, padding: "13px 0", background: "var(--blue)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,122,255,0.3)" }} onClick={() => onNavigate("learn")}>
                시작하기 →
              </button>
              <button style={{ padding: "13px 18px", background: "rgba(0,122,255,0.1)", color: "var(--blue)", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }} onClick={() => onNavigate("drc")}>
                🤖 Dr. C
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
          {[{ n: "5", l: "단계", c: "#007aff" }, { n: "15", l: "카드", c: "#5856d6" }, { n: "5", l: "프로젝트", c: "#34c759" }, { n: "AI", l: "튜터", c: "#ff9500" }].map(st => (
            <div key={st.l} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "14px 0", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: st.c, letterSpacing: -0.5 }}>{st.n}</div>
              <div style={{ fontSize: 11, color: "#8e8e93", marginTop: 2, fontWeight: 500 }}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* Stage grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12, color: "#000" }}>커리큘럼</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
            {FEATURES.map((f, i) => (
              <div key={f.title} className="ios-cell" style={{ cursor: "pointer" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#000" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#8e8e93", marginTop: 1 }}>{f.sub}</div>
                </div>
                <span className="ios-chevron">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:150, height:150, borderRadius:"50%", background:"rgba(0,122,255,0.05)", pointerEvents:"none" }} />
          <div style={{ fontSize: 34, marginBottom: 10 }}>🚀</div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.6, color: "#000", marginBottom: 8 }}>지금 바로 시작!</div>
          <div style={{ fontSize: 14, color: "#8e8e93", lineHeight: 1.65, marginBottom: 20 }}>Hello World부터 포인터까지</div>
          <button style={{ background: "var(--blue)", color: "#fff", padding: "13px 32px", borderRadius: 100, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,122,255,0.3)" }} onClick={() => onNavigate("learn")}>
            학습 시작 →
          </button>
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
