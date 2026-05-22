import { useState } from "react";
import { stages } from "../data/curriculum";

const CORE_FEATURES = [
  {
    icon: "📖", type: "concept", title: "개념 학습", sub: "핵심 개념부터 차근차근",
    color: "#007aff",
    desc: "C언어의 핵심 개념을 쉬운 비유와 그림으로 배워요.\n카드를 학습하고 핵심 팁을 확인하면 다음 단계로 넘어갈 수 있어요.",
  },
  {
    icon: "💻", type: "code", title: "실습", sub: "코드를 직접 완성하며 학습",
    color: "#5856d6",
    desc: "코드 속 빈 토큰을 눌러 직접 수정하며 완성해요.\n정답을 맞혀야 다음 단계로 진행할 수 있어요.",
  },
  {
    icon: "🚀", type: "project", title: "프로젝트", sub: "만들며 배우는 커리큘럼",
    color: "#ff9500",
    desc: "배운 개념으로 미니 프로젝트를 완성해요.\n완성하면 특별한 뱃지를 획득할 수 있어요!",
  },
];

function ConceptPreview() {
  return (
    <div style={{ background: "#f0f4ff", borderRadius: 16, padding: 18, border: "1px solid rgba(0,122,255,0.12)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#007aff", letterSpacing: 0.4, marginBottom: 10 }}>개념 카드 예시</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10, color: "#000" }}>변수란 무엇일까?</div>
      <div style={{ fontSize: 14, color: "#3c3c43", lineHeight: 1.75, marginBottom: 14 }}>
        변수는 컴퓨터의 <b>'기억 상자'</b>예요.<br />
        <code style={{ background: "rgba(0,0,0,0.07)", padding: "2px 6px", borderRadius: 5, fontFamily: "monospace", fontSize: 13 }}>int x = 10;</code>은<br />
        x라는 상자에 10을 넣는 것이에요. 📦
      </div>
      <div style={{ background: "rgba(0,122,255,0.09)", borderRadius: 10, padding: "10px 14px", borderLeft: "3px solid #007aff" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#007aff", marginBottom: 4 }}>핵심 팁 💡</div>
        <div style={{ fontSize: 13, color: "#3c3c43", lineHeight: 1.6 }}>int, float, char 등 상자의 종류(타입)를 꼭 지정해야 해요!</div>
      </div>
    </div>
  );
}

function CodePreview() {
  return (
    <div style={{ background: "#1c1c1e", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#8e8e93", letterSpacing: 0.4, marginBottom: 12 }}>실습 카드 예시</div>
      <div style={{ fontFamily: "'Menlo','Monaco','Courier New',monospace", fontSize: 13, lineHeight: 2.1, color: "#d4d4d4" }}>
        <div><span style={{ color: "#569cd6" }}>int</span> main() {"{"}</div>
        <div>&nbsp;&nbsp;<span style={{ color: "#dcdcaa" }}>printf</span>(<span style={{ color: "#ce9178" }}>"Hello!\n"</span>);</div>
        <div>
          &nbsp;&nbsp;
          <span style={{ display: "inline-block", background: "rgba(0,122,255,0.5)", color: "#fff", padding: "1px 10px", borderRadius: 5, fontWeight: 700, cursor: "pointer", border: "1.5px solid rgba(0,122,255,0.8)" }}>return</span>
          {" "}0;
        </div>
        <div>{"}"}</div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "#8e8e93" }}>👆 파란 토큰을 눌러 값을 수정해요</div>
    </div>
  );
}

function ProjectPreview() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#ff9500", letterSpacing: 0.4, marginBottom: 10 }}>프로젝트 카드 예시</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: "#000" }}>나만의 인사 프로그램 만들기</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {["출력 함수 작성하기", "이름 변수 만들기", "프로그램 완성하기"].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(52,199,89,0.12)", border: "1.5px solid #34c759", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#34c759", flexShrink: 0 }}>✓</div>
            <span style={{ fontSize: 13, color: "#3c3c43" }}>{step}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "linear-gradient(135deg,#ff9500,#ff6b00)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 26 }}>🏆</span>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>뱃지 획득!</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Hello World 마스터</div>
        </div>
      </div>
    </div>
  );
}

function FeaturePopup({ feature, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#f2f2f7", borderRadius: "24px 24px 0 0", width: "100%", height: "92vh", overflowY: "auto", paddingBottom: 40 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.18)", borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: "16px 24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{feature.icon}</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: "#000", marginBottom: 8 }}>{feature.title}</div>
          <div style={{ fontSize: 15, color: "#6c6c70", lineHeight: 1.7, whiteSpace: "pre-line" }}>{feature.desc}</div>
        </div>

        {/* Preview section */}
        <div style={{ margin: "0 16px 40px" }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#8e8e93", letterSpacing: 0.3, marginBottom: 14 }}>화면 예시</div>
            {feature.type === "concept" && <ConceptPreview />}
            {feature.type === "code"    && <CodePreview />}
            {feature.type === "project" && <ProjectPreview />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ onNavigate, progress, nickname }) {
  const done = progress.completedStages || [];
  const pct  = Math.round((done.length / stages.length) * 100);
  const [featurePopup, setFeaturePopup] = useState(null);

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

      {/* Feature popup */}
      {featurePopup && (
        <FeaturePopup
          feature={featurePopup}
          onClose={() => setFeaturePopup(null)}
        />
      )}

      {/* Nav */}
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group">
            <span className="cf-logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>easy<b>C</b></span>
          </div>
          <span className="cf-beta">Beta</span>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "8px 20px", flexShrink: 0 }}>
        <div className="ios-hscroll"
          onMouseDown={e => { e.currentTarget._isDown = true; e.currentTarget._startX = e.pageX - e.currentTarget.offsetLeft; e.currentTarget._scrollLeft = e.currentTarget.scrollLeft; e.currentTarget.style.cursor = 'grabbing'; }}
          onMouseLeave={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseUp={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseMove={e => { if (!e.currentTarget._isDown) return; e.preventDefault(); const x = e.pageX - e.currentTarget.offsetLeft; const walk = (x - e.currentTarget._startX) * 2; e.currentTarget.scrollLeft = e.currentTarget._scrollLeft - walk; }}
          onWheel={e => { if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }}
          style={{ cursor: 'grab' }}
        >
          {["전체", "기초", "조건/반복", "배열/함수", "포인터", "심화"].map((t, i) => {
            const targetIdx = i === 0 ? 0 : [0, 0, 2, 3, 4, 5][i];
            const locked = !isStageAccessible(targetIdx);
            const s = stages[targetIdx];
            return (
              <button key={t}
                className={`cf-tab ${i === 0 ? "active" : "inactive"}`}
                style={{
                  ...(i === 0 ? { background: "var(--blue)" } : {}),
                  ...(locked ? { opacity: 0.4, cursor: "default" } : {})
                }}
                onClick={() => {
                  if (locked) return;
                  onNavigate("learn", { stageIdx: targetIdx });
                }}
              >
                {locked ? "🔒" : (i === 0 ? "🏠" : s.emoji)} {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px var(--nav-h)" }}>

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

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[{ n: "0", l: "진입장벽", c: "#007aff" }, { n: "8", l: "스테이지", c: "#5856d6" }, { n: "40", l: "카드", c: "#34c759" }, { n: "100%", l: "자율학습", c: "#ff9500" }].map(st => (
            <div key={st.l} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "14px 0", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: st.c, letterSpacing: -0.5 }}>{st.n}</div>
              <div style={{ fontSize: 11, color: "#8e8e93", marginTop: 2, fontWeight: 500 }}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* Curriculum stage grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12, color: "#000" }}>커리큘럼</div>
          <div className="responsive-grid grid-2">
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
                    borderRadius: 18, padding: "16px",
                    cursor: locked ? "default" : "pointer",
                    boxShadow: completed ? `0 2px 12px ${stage.color}22` : "0 1px 4px rgba(0,0,0,0.06)",
                    opacity: locked ? 0.5 : 1,
                    filter: locked ? "grayscale(0.4)" : "none",
                    transition: "opacity 0.2s"
                  }}
                  onClick={() => { if (!locked) onNavigate("learn", { stageIdx: i }); }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 26 }}>{locked ? "🔒" : stage.emoji}</span>
                    {completed
                      ? <span style={{ fontSize: 11, color: stage.color, fontWeight: 700, background: stage.color + "15", padding: "3px 8px", borderRadius: 100 }}>완료 ✓</span>
                      : locked
                        ? <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 600, background: "rgba(0,0,0,0.06)", padding: "3px 8px", borderRadius: 100 }}>잠김</span>
                        : <span style={{ fontSize: 18, fontWeight: 900, color: "rgba(0,0,0,0.07)", letterSpacing: -1 }}>{`0${stage.id}`}</span>
                    }
                  </div>
                  <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, letterSpacing: -0.3, color: locked ? "#8e8e93" : "#000" }}>{stage.title}</div>
                  <div style={{ fontSize: 12, color: locked ? "#b0b0b5" : stage.color, marginTop: 3, fontWeight: 600 }}>{stage.subtitle}</div>
                  <div style={{ fontSize: 11, color: "#8e8e93", marginTop: 8 }}>
                    {locked ? "이전 단계를 완료하세요" : `카드 ${stage.cards.length + stage.cards.filter(c => c.type === "project").length}개`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core features */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12, color: "#000" }}>핵심 기능</div>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            {CORE_FEATURES.map((f) => (
              <div key={f.title} className="ios-cell" style={{ cursor: "pointer" }} onClick={() => setFeaturePopup(f)}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: f.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
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
