import { useState } from "react";
import MemoryVisualizer from "./MemoryVisualizer";

export default function ConceptCard({ card, color }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Metaphor */}
      <div style={{ background: color + "0e", border: `0.5px solid ${color}33`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>🧠 비유로 이해하기</div>
        <pre style={{ fontFamily: "monospace", fontSize: 13, color, lineHeight: 1.85, margin: 0, whiteSpace: "pre-wrap" }}>{card.metaphor}</pre>
      </div>
      {/* Content */}
      <p style={{ fontSize: 15, color: "var(--label2)", lineHeight: 1.8, fontWeight: 400, whiteSpace: "pre-wrap" }}>{card.content}</p>
      {/* Tip */}
      <div
        style={{ background: flipped ? color + "0d" : "rgba(0,0,0,0.03)", border: `0.5px solid ${flipped ? color + "33" : "rgba(0,0,0,0.08)"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "all 0.25s", minHeight: 52, display: "flex", alignItems: "center", justifyContent: flipped ? "flex-start" : "center" }}
        onClick={() => setFlipped(f => !f)}
      >
        {!flipped
          ? <span style={{ fontSize: 14, color: "var(--label3)" }}>💡 탭해서 핵심 팁 보기</span>
          : <span style={{ fontSize: 14, color, lineHeight: 1.6, animation: "iosFadeIn 0.2s ease" }}><b>핵심 팁:</b> {card.tip}</span>
        }
      </div>
      {card.visualization && <MemoryVisualizer type={card.visualization} />}
    </div>
  );
}
