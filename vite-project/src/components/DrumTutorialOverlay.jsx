import { useState, useEffect } from "react";

const DEMO_OPTIONS = ["여기를", "눌러봐!", "탭해봐!"];

export default function DrumTutorialOverlay({ color, onDismiss }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (tapped) return;
    const t = setInterval(() => setDemoIdx(i => (i + 1) % DEMO_OPTIONS.length), 850);
    return () => clearInterval(t);
  }, [tapped]);

  const handleTap = () => {
    setDemoIdx(i => (i + 1) % DEMO_OPTIONS.length);
    setTapped(true);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "iosFadeScale 0.25s ease",
      padding: "0 24px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "28px 24px",
        maxWidth: 340, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💻</div>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8, letterSpacing: -0.4 }}>
          이렇게 풀면 돼!
        </div>
        <div style={{ fontSize: 14, color: "#8e8e93", marginBottom: 20, lineHeight: 1.6 }}>
          코드 안의 칸을 탭하면 보기가 바뀌어.<br />
          맞는 걸 골라봐!
        </div>

        {/* 실제 코드 슬롯과 동일한 데모 */}
        <div className="cf-code" style={{ marginBottom: 16, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", whiteSpace: "pre" }}>
            <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none", flexShrink: 0 }}>1</span>
            <span style={{ color: "#dcdcaa", fontFamily: "monospace", fontSize: 13 }}>printf</span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#d4d4d4" }}>(</span>
            <span
              key={demoIdx}
              className="cf-slot"
              style={{
                background: color + "20",
                border: `1.5px solid ${color}55`,
                color,
                animation: "iosPress 0.25s ease",
              }}
              onClick={handleTap}
            >
              {DEMO_OPTIONS[demoIdx]}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#d4d4d4" }}>);</span>
          </div>
        </div>

        {!tapped ? (
          <div style={{ fontSize: 13, color, fontWeight: 700, marginBottom: 24 }}>
            👆 저 칸을 직접 눌러봐!
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, color: "#34c759", fontWeight: 700, marginBottom: 16, animation: "iosPop 0.3s ease" }}>
              🎉 잘했어! 이제 문제를 풀어봐!
            </div>
            <button
              onClick={onDismiss}
              style={{
                width: "100%",
                padding: "14px",
                background: color,
                color: "#fff",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                animation: "iosPop 0.3s ease",
              }}
            >
              시작하기 →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
