import { useRef } from "react";

/* 실제 입력 칸과 같은 색 (App.css .cf-input-slot / .cf-input-slot.free) */
const PURPLE = { bg: "#e8ecff", border: "#7b8cff", text: "#4a55c7" };
const SKY    = { bg: "#eaf2f5", border: "#7db3cb", text: "#3d7088" };
const cellStyle = c => ({
  display: "inline-block", background: c.bg, border: `1.5px solid ${c.border}`,
  borderRadius: 4, padding: "2px 8px", color: c.text, fontSize: 12, fontWeight: 700,
});

/* ── 메인 컴포넌트 ── */
export default function ProjectTutorialOverlay({ color, onDismiss }) {
  const touchY = useRef(null);

  const handleTouchStart = e => {
    e.stopPropagation();
    touchY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = e => {
    e.stopPropagation();
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (dy > 40) onDismiss();
    touchY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={e => e.stopPropagation()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "iosFadeScale 0.25s ease",
        padding: "0 24px",
      }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "24px 24px 20px",
        maxWidth: 340, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>⌨️</div>
        <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6, letterSpacing: -0.4 }}>
          빈칸에 직접 타이핑해봐
        </div>
        <div style={{ fontSize: 13, color: "#8e8e93", marginBottom: 16, lineHeight: 1.6 }}>
          이번엔 선택지 없이 직접 입력하는 거야.<br />빈 칸을 탭하면 키보드가 올라와.
        </div>
        <div style={{ background: "#f2f2f7", borderRadius: 14, padding: "12px 14px", textAlign: "left", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 13 }}>
            <span style={cellStyle(PURPLE)}>printf</span>
            <span style={{ color: "#555" }}>(</span>
            <span style={cellStyle(PURPLE)}>"</span>
            <span style={{ ...cellStyle(SKY), minWidth: 48 }}>이름</span>
            <span style={cellStyle(PURPLE)}>"</span>
            <span style={{ color: "#555" }}>);</span>
          </div>
        </div>
        {/* 칸 색 설명 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", fontSize: 13, color: "#3c3c43", marginBottom: 20, lineHeight: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...cellStyle(PURPLE), width: 22, height: 16, padding: 0, flexShrink: 0 }} />
            <span>보라색 칸은 정답이 정해져 있어.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...cellStyle(SKY), width: 22, height: 16, padding: 0, flexShrink: 0 }} />
            <span>하늘색 칸은 정답이 없어! 네 이름처럼 마음대로 써도 돼.</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            width: "100%", padding: "13px", borderRadius: 14,
            background: color, color: "#fff",
            fontWeight: 800, fontSize: 15, border: "none",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          시작하기 →
        </button>
      </div>
    </div>
  );
}
