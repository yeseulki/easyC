import { useState, useRef, useEffect } from "react";
import { stages } from "../data/curriculum";

/* 🧩 CFeed-style inline slot inside code 🧩 */
function InlineSlot({ options, selected, onSelect, color }) {
  const colors = {
    bg:     color + "20",
    border: color + "55",
    text:   color,
  };
  return (
    <span
      className="cf-slot"
      style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.text }}
      onClick={() => onSelect((selected + 1) % options.length)}
    >
      {options[selected]}
    </span>
  );
}

/* 💻 Build code lines with inline slots 💻 */
function CodeWithSlots({ card, color, sel, onSel }) {
  // Build code lines – replace slot positions with components
  const fullLines = card.fullCode.split("\n");

  return (
    <div className="cf-code">
      {fullLines.map((line, li) => {
        // Highlight syntax
        const colored = line
          .replace(/\b(int|float|char|void|return|if|else|for|while|include)\b/g, '<kw>$1</kw>')
          .replace(/\b(printf|scanf|malloc|free|sizeof|main)\b/g, '<fn>$1</fn>')
          .replace(/"([^"]*)"/g, '<str>"$1"</str>')
          .replace(/\b(\d+)\b/g, '<num>$1</num>');

        return (
          <div key={li} style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "pre" }}>
            <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none" }}>{li + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: colored }} />
          </div>
        );
      })}
    </div>
  );
}

export default function LearnPage({ initialStage = 0, onBadge, onComplete, onGoToCode }) {
  const [stageIdx, setStageIdx] = useState(initialStage);
  const [cardIdx, setCardIdx]   = useState(0);
  const [sel, setSel]           = useState({}); // { slotId: index }

  const stage = stages[stageIdx];
  const card  = stage.cards[cardIdx];
  const total = stage.cards.length;
  const pct   = Math.round(((cardIdx + 1) / total) * 100);

  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    setStageIdx(initialStage);
    setCardIdx(0);
    setClaimed(false);
  }, [initialStage]);

  const go = (dir) => {
    if (dir === 1 && cardIdx < total - 1) setCardIdx(c => c + 1);
    if (dir === -1 && cardIdx > 0) setCardIdx(c => c - 1);
    setClaimed(false);
  };

  const handleClaim = () => {
    setClaimed(true);
    if (card.badge) onBadge(card.badge);
    if (cardIdx === total - 1) onComplete(stage.id);
  };

  const isLastCardOfLastStage = stageIdx === stages.length - 1 && cardIdx === total - 1;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f2f2f7" }}>
      {/* Progress */}
      <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, transition: "width 0.4s" }} />       
      </div>

      {/* Stage badge */}
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#f2f2f7" }}>    
        <span style={{ fontSize: 18 }}>{stage.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>{stage.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8e8e93" }}>{cardIdx + 1} / {total}</span>      
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        {/* Card title */}
        <div style={{ padding: "0 16px 12px", background: "#f2f2f7" }}>
          <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
            {card.type === "concept" ? "Concept" : "Project"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.8, color: "#000", margin: 0 }}>{card.title}</h1>
        </div>

        <div style={{ padding: 16 }}>
          {card.type === "concept" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                 <p style={{ fontSize: 16, lineHeight: 1.6, color: "#3a3a3c", margin: 0 }}>{card.content}</p>
               </div>
               {card.visual && (
                 <div style={{ background: "#000", borderRadius: 20, padding: 20, color: "#fff", fontSize: 13, fontFamily: "monospace" }}>
                   {card.visual}
                 </div>
               )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                 <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 12 }}>{card.description}</p>
                 <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 16, overflowX: "auto" }}>
                    <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{card.example}</pre>
                 </div>
               </div>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <button 
              style={{ 
                width: "100%", padding: "16px", borderRadius: 16, 
                background: claimed ? "#f2f2f7" : stage.color, 
                color: claimed ? "#8e8e93" : "#fff",
                fontWeight: 700, fontSize: 16, border: claimed ? "1px solid rgba(0,0,0,0.05)" : "none"
              }}
              onClick={handleClaim}
              disabled={claimed}
            >
              {claimed ? "배지 획득 완료" : `${card.badge} 배지 받기`}
            </button>

            {isLastCardOfLastStage && claimed && (
              <button 
                style={{ 
                  width: "100%", padding: "16px", borderRadius: 16, 
                  background: "#007aff", color: "#fff",
                  fontWeight: 800, fontSize: 17, border: "none",
                  marginTop: 12, boxShadow: "0 4px 14px rgba(0,122,255,0.3)",
                  animation: "iosPop 0.4s ease-out"
                }}
                onClick={onGoToCode}
              >
                🚀 코딩하러 가기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "16px", display: "flex", gap: 10, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderTop: "0.5px solid rgba(0,0,0,0.05)" }}>
        <button style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", fontWeight: 600 }} onClick={() => go(-1)} disabled={cardIdx === 0}>이전</button>
        <button style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", fontWeight: 600 }} onClick={() => go(1)} disabled={cardIdx === total - 1}>다음</button>
      </div>
    </div>
  );
}
