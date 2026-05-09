import { useState, useRef, useEffect } from "react";
import { stages } from "../data/curriculum";
import ConceptCard from "./ConceptCard";
import CodeCard from "./CodeCard";
import DrC from "./DrC";

const CARD_TYPES = { concept: "개념", code: "실습", project: "프로젝트" };
const CARD_ICONS = { concept: "📖", code: "💻", project: "🚀" };

function ProjectCard({ card, color, onBadge }) {
  const [claimed, setClaimed] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>{card.description}</p>

      <div style={{
        background: "#0d1117",
        borderRadius: 12,
        padding: 12,
        maxHeight: 200,
        overflow: "auto",
      }}>
        <pre style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#abb2bf",
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          margin: 0,
        }}>
          {card.example}
        </pre>
      </div>

      <button
        style={{
          padding: "12px",
          borderRadius: 14,
          background: claimed
            ? "rgba(74,222,128,0.1)"
            : `linear-gradient(135deg, ${color}, ${color}cc)`,
          border: claimed ? "1px solid #4ade80" : "none",
          color: claimed ? "#4ade80" : "#fff",
          fontSize: 14,
          fontWeight: 700,
          animation: claimed ? "none" : "pulse 2s infinite",
          transition: "all 0.3s",
        }}
        onClick={() => { setClaimed(true); onBadge && onBadge(card.badge); }}
      >
        {claimed ? `${card.badge} 획득!` : `🏆 ${card.badge} 받기`}
      </button>
    </div>
  );
}

// Single full-screen card (one swipe unit)
function ReelsCard({ stageIdx, cardIdx, totalCards, onDrC, onBadge }) {
  const stage = stages[stageIdx];
  const card = stage.cards[cardIdx];
  const progress = ((cardIdx + 1) / totalCards) * 100;

  return (
    <div style={styles.reelsCard}>
      {/* Stage header */}
      <div style={styles.stageHeader}>
        <span style={{ fontSize: 20 }}>{stage.emoji}</span>
        <div>
          <div style={{ fontSize: 12, color: "#8888aa" }}>Stage {stage.id}</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{stage.title}</div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: stage.color + "22",
          color: stage.color,
          padding: "4px 10px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {CARD_ICONS[card.type]} {CARD_TYPES[card.type]}
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBg}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${stage.color}, ${stage.color}99)`,
          borderRadius: 3,
          transition: "width 0.5s ease",
          animation: "progressFill 0.8s ease",
        }} />
      </div>

      {/* Card title */}
      <h2 style={{
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.4,
        color: "#fff",
        marginBottom: 16,
        borderLeft: `3px solid ${stage.color}`,
        paddingLeft: 12,
      }}>
        {card.title}
      </h2>

      {/* Card content */}
      <div style={styles.cardBody}>
        {card.type === "concept" && (
          <ConceptCard card={card} color={stage.color} colorLight={stage.colorLight} />
        )}
        {card.type === "code" && (
          <CodeCard card={card} color={stage.color} onDrC={onDrC} />
        )}
        {card.type === "project" && (
          <ProjectCard card={card} color={stage.color} onBadge={onBadge} />
        )}
      </div>
    </div>
  );
}

// Stage map (home screen)
function StageMap({ onSelect, badges }) {
  return (
    <div style={styles.stageMap}>
      <div style={styles.stageMapHeader}>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
          easy<span style={{ color: "#6C63FF" }}>C</span>
        </div>
        <div style={{ fontSize: 13, color: "#8888aa", marginTop: 4 }}>
          C언어를 쉽고 재미있게 배워보자! 🎵
        </div>
        {badges.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {badges.map((b, i) => (
              <div key={i} style={styles.badgePill}>{b}</div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.stageList}>
        {stages.map((stage) => (
          <div
            key={stage.id}
            style={{
              ...styles.stageItem,
              borderColor: stage.color + "44",
              background: `linear-gradient(135deg, ${stage.color}0a, transparent)`,
            }}
            onClick={() => onSelect(stage.id - 1)}
          >
            <div style={{ fontSize: 32 }}>{stage.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#8888aa" }}>Stage {stage.id}</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{stage.title}</div>
              <div style={{ fontSize: 12, color: stage.color, marginTop: 2 }}>{stage.subtitle}</div>
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
              {stage.cards.length}개 카드 →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReelsContainer() {
  const [screen, setScreen] = useState("map"); // map | reels
  const [stageIdx, setStageIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [drCTrigger, setDrCTrigger] = useState(null);
  const [showDrC, setShowDrC] = useState(false);
  const [badges, setBadges] = useState([]);
  const [showBadge, setShowBadge] = useState(null);

  const touchStartY = useRef(null);
  const stage = stages[stageIdx];
  const totalCards = stage.cards.length;

  const goNext = () => {
    if (cardIdx < totalCards - 1) {
      setCardIdx((c) => c + 1);
    } else if (stageIdx < stages.length - 1) {
      setStageIdx((s) => s + 1);
      setCardIdx(0);
    } else {
      setScreen("map");
    }
  };

  const goPrev = () => {
    if (cardIdx > 0) {
      setCardIdx((c) => c - 1);
    } else if (stageIdx > 0) {
      setStageIdx((s) => s - 1);
      setCardIdx(stages[stageIdx - 1].cards.length - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) {
      dy > 0 ? goNext() : goPrev();
    }
    touchStartY.current = null;
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > 30) {
      e.deltaY > 0 ? goNext() : goPrev();
    }
  };

  const openDrC = (trigger) => {
    setDrCTrigger(trigger);
    setShowDrC(true);
  };

  const handleBadge = (badge) => {
    setBadges((b) => [...new Set([...b, badge])]);
    setShowBadge(badge);
    setTimeout(() => setShowBadge(null), 2500);
  };

  if (screen === "map") {
    return (
      <div style={styles.root}>
        <StageMap
          onSelect={(idx) => { setStageIdx(idx); setCardIdx(0); setScreen("reels"); }}
          badges={badges}
        />
      </div>
    );
  }

  return (
    <div
      style={styles.root}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Reels card */}
      <div style={styles.reelsWrap} key={`${stageIdx}-${cardIdx}`}>
        <ReelsCard
          stageIdx={stageIdx}
          cardIdx={cardIdx}
          totalCards={totalCards}
          onDrC={openDrC}
          onBadge={handleBadge}
        />
      </div>

      {/* Navigation */}
      <div style={styles.navBar}>
        <button style={styles.navBtn} onClick={() => setScreen("map")}>🗺️</button>
        <button style={styles.navBtn} onClick={goPrev} disabled={stageIdx === 0 && cardIdx === 0}>↑</button>
        <button
          style={{ ...styles.navBtn, background: stage.color + "22", color: stage.color }}
          onClick={() => openDrC("wrongSlot")}
        >
          🤖
        </button>
        <button style={styles.navBtn} onClick={goNext}>↓</button>
        <div style={{ ...styles.navDots }}>
          {stage.cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: i === cardIdx ? 18 : 6,
                borderRadius: 3,
                background: i === cardIdx ? stage.color : "rgba(255,255,255,0.2)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Swipe hint */}
      <div style={styles.swipeHint}>
        스크롤 또는 스와이프로 넘기기
      </div>

      {/* Dr. C overlay */}
      {showDrC && (
        <DrC trigger={drCTrigger} onClose={() => setShowDrC(false)} />
      )}

      {/* Badge toast */}
      {showBadge && (
        <div style={styles.badgeToast}>
          <div style={{ fontSize: 32, animation: "floatBadge 0.5s ease" }}>{showBadge}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>획득!</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    background: "var(--bg)",
    overflow: "hidden",
  },
  reelsWrap: {
    flex: 1,
    overflow: "hidden",
    animation: "fadeInUp 0.35s ease",
  },
  reelsCard: {
    height: "100%",
    overflowY: "auto",
    padding: "16px 16px 80px",
    display: "flex",
    flexDirection: "column",
  },
  stageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  progressBg: {
    width: "100%",
    height: 4,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardBody: {
    flex: 1,
  },
  navBar: {
    position: "fixed",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    zIndex: 50,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  navDots: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "6px 0",
  },
  swipeHint: {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 11,
    color: "#444",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  stageMap: {
    height: "100%",
    overflowY: "auto",
    padding: "24px 16px",
  },
  stageMapHeader: {
    textAlign: "center",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  stageList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  stageItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px",
    border: "1px solid",
    borderRadius: 16,
    cursor: "pointer",
    transition: "transform 0.15s",
    active: { transform: "scale(0.98)" },
  },
  badgePill: {
    background: "rgba(108,99,255,0.15)",
    border: "1px solid rgba(108,99,255,0.3)",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 12,
    color: "#a78bfa",
  },
  badgeToast: {
    position: "fixed",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(13,13,26,0.95)",
    border: "1px solid rgba(108,99,255,0.4)",
    borderRadius: 20,
    padding: "20px 32px",
    textAlign: "center",
    zIndex: 200,
    animation: "floatBadge 0.5s ease",
    backdropFilter: "blur(16px)",
    boxShadow: "0 0 40px rgba(108,99,255,0.3)",
  },
};
