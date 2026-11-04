import { useState, useRef } from "react";

/* ── 슬라이드 1: 개념 읽고 팁 탭하기 ── */
function Slide1({ color, onReady }) {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    if (!tapped) { setTapped(true); onReady(); }
  };

  return (
    <>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
      <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6, letterSpacing: -0.4 }}>
        개념 읽고 팁 확인하기
      </div>
      <div style={{ fontSize: 13, color: "#8e8e93", marginBottom: 16, lineHeight: 1.6 }}>
        내용을 읽은 뒤 아래 버튼을 탭하면<br />핵심 팁이 짠! 하고 나타나.
      </div>
      <div
        onClick={handleTap}
        style={{
          background: tapped ? color + "10" : "#fff",
          border: `1px solid ${tapped ? color + "44" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 16, padding: "14px 16px", cursor: "pointer",
          transition: "all 0.25s", marginBottom: 12,
        }}
      >
        {!tapped
          ? <div style={{ textAlign: "center", color: "#8e8e93", fontSize: 14 }}>💡 탭해서 핵심 팁 보기</div>
          : <div style={{ fontSize: 14, color, lineHeight: 1.7, animation: "iosFadeIn 0.2s ease" }}><b>핵심 팁:</b> 세미콜론(;)은 모든 문장 끝에 꼭 붙여야 해!</div>
        }
      </div>
      {!tapped
        ? <div style={{ fontSize: 13, color, fontWeight: 700 }}>👆 저 버튼을 직접 눌러봐!</div>
        : <div style={{ fontSize: 13, color: "#34c759", fontWeight: 700, animation: "iosPop 0.3s ease" }}>잘했어! 이제 시작하기를 눌러봐.</div>
      }
    </>
  );
}

/* ── 메인 컴포넌트 ── */
export default function ConceptTutorialOverlay({ color, onDismiss }) {
  const [slide1Ready, setSlide1Ready] = useState(false);
  const touchY = useRef(null);

  const canNext = slide1Ready;

  const handleTouchStart = e => {
    e.stopPropagation();
    touchY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = e => {
    e.stopPropagation();
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (dy > 40 && canNext) onDismiss();
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
        <Slide1 color={color} onReady={() => setSlide1Ready(true)} />

        <div style={{ marginTop: 20 }}>
          <button
            onClick={onDismiss}
            disabled={!canNext}
            style={{
              width: "100%", padding: "13px", borderRadius: 14,
              background: canNext ? color : "rgba(0,0,0,0.08)",
              color: canNext ? "#fff" : "#aaa",
              fontWeight: 800, fontSize: 15, border: "none",
              cursor: canNext ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >
            시작하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
