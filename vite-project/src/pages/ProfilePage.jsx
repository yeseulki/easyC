import { stages } from "../data/curriculum";

const ALL_BADGES = stages.map(st => ({
  badge: st.cards.find(c => c.type === "project")?.badge || `Stage ${st.id}`,
  color: st.color, emoji: st.emoji, stage: st.title,
}));

const LEVELS = [
  { min: 0, label: "씨앗",   emoji: "🌱", color: "#8e8e93" },
  { min: 1, label: "새싹",   emoji: "🌿", color: "#34c759" },
  { min: 2, label: "나무",   emoji: "🌳", color: "#30b0c7" },
  { min: 3, label: "마법사", emoji: "⚡", color: "#af52de" },
  { min: 4, label: "해커",   emoji: "🔥", color: "#ff9500" },
  { min: 5, label: "마스터", emoji: "👑", color: "#ff9500" },
];
const getLevel = n => [...LEVELS].reverse().find(l => n >= l.min) || LEVELS[0];

export default function ProfilePage({ badges, progress, savedItems = [], onNavigate }) {
  const done  = progress.completedStages || [];
  const pct   = Math.round((done.length / stages.length) * 100);
  const level = getLevel(badges.length);
  const next  = LEVELS.find(l => l.min > badges.length);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)" }}>
      {/* Nav with easyC logo */}
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group" style={{ gap: 16 }}>
            <span className="cf-logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>easy<b>C</b></span>
            <div className="ios-nav-large-title">내 정보</div>
          </div>
        </div>
      </div>

      <div className="page" style={{ padding: "0 0 var(--nav-h)" }}>
        <div className="profile-content-inner">
          {/* Hero & Level Card */}
          <div className="ios-section">
            <div style={{ background: "#fff", padding: "24px", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,rgba(0,122,255,0.12),rgba(88,86,214,0.1))", border: `2.5px solid ${level.color}55`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${level.color}22` }}>
                <span style={{ fontSize: 44 }}>🧑‍💻</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginTop: 14, color: "var(--label)" }}>코딩 학생</div>
              <div style={{ 
                display: "flex", alignItems: "center", gap: 6, marginTop: 12,
                background: level.color + "12", border: `1.5px solid ${level.color}33`,
                padding: "6px 14px", borderRadius: 12,
              }}>
                <span style={{ fontSize: 16 }}>{level.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: level.color, letterSpacing: -0.2 }}>{level.label}</span>
              </div>
              {next && (
                <div style={{ width: "100%", marginTop: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--label2)", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>다음: {next.emoji} {next.label}</span>
                    <span style={{ fontWeight: 600 }}>{badges.length} / {next.min} 뱃지</span>
                  </div>
                  <div className="ios-prog-track" style={{ height: 6, background: "rgba(0,0,0,0.05)" }}>
                    <div className="ios-prog-fill" style={{ width: `${(badges.length / next.min) * 100}%`, background: `linear-gradient(90deg,${level.color},${next.color})` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="ios-section" style={{ marginBottom: 28 }}>
            <div className="responsive-grid grid-2">
              {[
                { icon: "🏅", val: badges.length, label: "획득 뱃지",    c: "var(--orange)" },
                { icon: "📚", val: done.length,   label: "완료 스테이지", c: "var(--blue)"   },
                { icon: "💯", val: `${pct}%`,     label: "전체 진도",    c: "var(--green)"  },
                { icon: "🗺️", val: stages.length, label: "전체 스테이지", c: "var(--purple)" },
              ].map(st => (
                <div key={st.label} style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 28 }}>{st.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: st.c, letterSpacing: -1 }}>{st.val}</div>
                  <div style={{ fontSize: 12, color: "var(--label2)" }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Items */}
          <div className="ios-section" style={{ marginBottom: 28 }}>
            <div className="ios-section-title">저장된 학습</div>
            {savedItems.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: "32px 20px", textAlign: "center", border: "1px dashed var(--sep)" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📌</div>
                <div style={{ fontSize: 14, color: "var(--label2)" }}>아직 저장된 카드가 없어요.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {savedItems.map((item, i) => (
                  <div 
                    key={i} 
                    style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer" }}
                    onClick={() => onNavigate("learn", { stageIdx: item.stageIdx, cardIdx: item.cardIdx })}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,122,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔖</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--label)" }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "var(--label2)", marginTop: 2 }}>{item.type === "concept" ? "개념 카드" : "실습 카드"}</div>
                    </div>
                    <span style={{ color: "var(--blue)", fontSize: 18 }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="ios-section" style={{ marginBottom: 28 }}>
            <div className="ios-section-title">뱃지</div>
            <div className="responsive-grid grid-3">
              {ALL_BADGES.map(b => {
                const earned = badges.includes(b.badge);
                return (
                  <div key={b.badge} style={{ background: earned ? "#fff" : "rgba(0,0,0,0.03)", border: `0.5px solid ${earned ? b.color + "44" : "rgba(0,0,0,0.07)"}`, borderRadius: 16, padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", opacity: earned ? 1 : 0.35, boxShadow: earned ? `0 2px 10px ${b.color}18` : "none", transition: "all 0.3s" }}>
                    <div style={{ fontSize: 30 }}>{earned ? b.emoji : "🔒"}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: earned ? b.color : "var(--label3)", marginTop: 8, textAlign: "center", lineHeight: 1.3 }}>
                      {b.badge.replace("🏆 ", "")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage list */}
          <div className="ios-section" style={{ marginBottom: 28 }}>
            <div className="ios-section-title">스테이지</div>
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {stages.map((stage, i) => {
                const completed = done.includes(stage.id);
                const locked = i > done.length;
                return (
                  <div
                    key={stage.id}
                    className="ios-cell"
                    style={{
                      cursor: locked ? "default" : "pointer",
                      opacity: locked ? 0.45 : 1,
                    }}
                    onClick={() => { if (!locked) onNavigate("learn", { stageIdx: i }); }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: locked ? "rgba(0,0,0,0.06)" : stage.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {locked ? "🔒" : stage.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: locked ? "var(--label3)" : "var(--label)" }}>{stage.title}</div>
                      <div style={{ fontSize: 12, color: locked ? "var(--label3)" : stage.color, marginTop: 1 }}>{stage.subtitle}</div>
                    </div>
                    {completed
                      ? <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 700 }}>완료 ✓</span>
                      : locked
                        ? <span style={{ fontSize: 12, color: "var(--label3)" }}>미개방</span>
                        : <span style={{ fontSize: 12, color: "var(--label3)" }}>미완료</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivational */}
          <div className="ios-section">
            <div style={{ background: "linear-gradient(145deg,#f0f4ff,#f7f7ff)", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 20, padding: "24px 20px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>{badges.length === 0 ? "💪" : badges.length < 3 ? "🔥" : "🏆"}</div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, color: "var(--label)", marginBottom: 8 }}>
                {badges.length === 0 ? "첫 번째 뱃지를 획득해봐!" : badges.length < 3 ? "훌륭해! 계속 도전해봐!" : "정말 대단해!"}
              </div>
              <div style={{ fontSize: 14, color: "var(--label2)", lineHeight: 1.7 }}>
                C언어를 배운다는 건 컴퓨터와 직접 대화하는 법을 익히는 것.{"\n"}너는 지금 그 언어를 배우고 있어! ⚡
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
