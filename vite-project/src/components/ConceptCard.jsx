import { useState } from "react";
import MemoryVisualizer from "./MemoryVisualizer";

export default function ConceptCard({ card, color }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Metaphor */}
      <div style={{
        background: color + "0e",
        border: `0.5px solid ${color}33`,
        borderRadius: 14,
        padding: "16px 20px",
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: color, marginBottom: 8, opacity: 0.8, letterSpacing: 0.5 }}>METAPHOR</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{card.metaphor}</div>
        <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6 }}>{card.metaphorDesc}</div>
      </div>

      {/* Main Description */}
      <div style={{ padding: "0 4px" }}>
        <p style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: "#fff",
          margin: 0,
          fontWeight: 400,
          letterSpacing: -0.01em
        }}>
          {card.description}
        </p>
      </div>

      {/* Visual / Key Info */}
      <div 
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16,
          padding: 20,
          minHeight: 180,
          cursor: "pointer",
          perspective: 1000,
          position: "relative",
          overflow: "hidden"
        }}
        onClick={() => setFlipped(!flipped)}
      >
        <div style={{ 
          fontSize: 12, 
          color: "#888", 
          marginBottom: 12, 
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 1
        }}>
          {flipped ? "Memory View" : "Concept View"}
        </div>
        
        <div style={{
          transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          height: "100%"
        }}>
          {/* Front: Key Concept */}
          <div style={{
            backfaceVisibility: "hidden",
            display: flipped ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12
          }}>
            <div style={{ fontSize: 48 }}>{card.emoji}</div>
            <div style={{ fontSize: 14, color: "#fff", textAlign: "center", fontWeight: 500 }}>{card.keyConcept}</div>
            <div style={{ fontSize: 12, color: color, fontWeight: 700 }}>탭하여 메모리 구조 보기</div>
          </div>

          {/* Back: Visualizer */}
          <div style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: flipped ? "flex" : "none",
            flexDirection: "column"
          }}>
             <MemoryVisualizer type={card.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
