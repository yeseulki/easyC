import { useState, useEffect, useRef } from "react";

const DEMO_OPTIONS = ["여기를", "눌러봐!", "탭해봐!"];

function Dots({ total, current, color }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 16 : 6, height: 6, borderRadius: 3,
          background: i === current ? color : "rgba(0,0,0,0.12)",
          transition: "all 0.25s ease",
        }} />
      ))}
    </div>
  );
}

/* ── 슬라이드 1: 토큰 탭 인터랙션 ── */
function Slide1({ color, onReady }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (tapped) return;
    const t = setInterval(() => setDemoIdx(i => (i + 1) % DEMO_OPTIONS.length), 850);
    return () => clearInterval(t);
  }, [tapped]);

  const handleTap = () => {
    setDemoIdx(i => (i + 1) % DEMO_OPTIONS.length);
    if (!tapped) { setTapped(true); onReady(); }
  };

  return (
    <>
      <div style={{ fontSize: 32, marginBottom: 10 }}>💻</div>
      <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6, letterSpacing: -0.4 }}>
        빈칸을 탭해서 골라봐
      </div>
      <div style={{ fontSize: 13, color: "#8e8e93", marginBottom: 16, lineHeight: 1.6 }}>
        코드 안 칸을 누르면 보기가 바뀌어.<br />맞는 걸 고른 뒤 확인하기를 눌러봐.
      </div>
      <div className="cf-code" style={{ marginBottom: 12, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", whiteSpace: "pre" }}>
          <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none", flexShrink: 0 }}>1</span>
          <span style={{ color: "#dcdcaa", fontFamily: "monospace", fontSize: 13 }}>printf</span>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#d4d4d4" }}>(</span>
          <span
            key={demoIdx}
            className="cf-slot"
            style={{ background: color + "20", border: `1.5px solid ${color}55`, color, animation: "iosPress 0.25s ease", cursor: "pointer" }}
            onClick={handleTap}
          >
            {DEMO_OPTIONS[demoIdx]}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#d4d4d4" }}>);</span>
        </div>
      </div>
      {!tapped
        ? <div style={{ fontSize: 13, color, fontWeight: 700 }}>👆 저 칸을 직접 눌러봐!</div>
        : <div style={{ fontSize: 13, color: "#34c759", fontWeight: 700, animation: "iosPop 0.3s ease" }}>잘했어! 이제 다음을 눌러봐.</div>
      }
    </>
  );
}

/* ── 슬라이드 2: 자연어 해석 ── */
function Slide2({ color }) {
  return (
    <>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🈯</div>
      <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6, letterSpacing: -0.4 }}>
        코드가 무슨 뜻인지 모르겠으면?
      </div>
      <div style={{ fontSize: 13, color: "#8e8e93", marginBottom: 16, lineHeight: 1.6 }}>
        코드 오른쪽 위 버튼을 눌러봐.<br />각 줄이 한국어로 바뀌어서 보여.
      </div>
      <div style={{ background: "#f2f2f7", borderRadius: 14, padding: "12px 14px", textAlign: "left", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>자연어 해석</span>
        </div>
        {[
          { code: '#include <stdio.h>', korean: '화면 출력 도구 불러오기' },
          { code: 'printf("Hello!");', korean: '"Hello!" 화면에 출력' },
        ].map((r, i) => (
          <div key={i} style={{ marginBottom: i === 0 ? 6 : 0 }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#c7c7cc" }}>{r.code}</div>
            <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>→ {r.korean}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 슬라이드 3: 저장(고정) ── */
function Slide3({ color }) {
  return (
    <>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📌</div>
      <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6, letterSpacing: -0.4 }}>
        나중에 다시 보고 싶으면?
      </div>
      <div style={{ fontSize: 13, color: "#8e8e93", marginBottom: 16, lineHeight: 1.6 }}>
        카드 오른쪽 위 📌를 누르면 저장돼.<br />프로필 탭에서 모아볼 수 있어.
      </div>
      <div style={{ background: "#f2f2f7", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Hello, World! 출력하기</div>
        <div style={{ fontSize: 22, color }}>🔖</div>
      </div>
    </>
  );
}

/* ── 메인 컴포넌트 ── */
export default function DrumTutorialOverlay({ color, onDismiss }) {
  const [slide, setSlide] = useState(0);
  const [slide1Ready, setSlide1Ready] = useState(false);
  const touchY = useRef(null);
  const TOTAL = 3;

  const slides = [
    <Slide1 key={0} color={color} onReady={() => setSlide1Ready(true)} />,
    <Slide2 key={1} color={color} />,
    <Slide3 key={2} color={color} />,
  ];

  const canNext = slide !== 0 || slide1Ready;
  const isLast = slide === TOTAL - 1;

  const handleTouchStart = e => {
    e.stopPropagation();
    touchY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = e => {
    e.stopPropagation();
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (dy > 40 && canNext) {
      isLast ? onDismiss() : setSlide(s => s + 1);
    } else if (dy < -40 && slide > 0) {
      setSlide(s => s - 1);
    }
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
        <Dots total={TOTAL} current={slide} color={color} />

        <div style={{ minHeight: 220, animation: "iosFadeIn 0.2s ease" }} key={slide}>
          {slides[slide]}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {slide > 0 && (
            <button onClick={() => setSlide(s => s - 1)} style={{
              flex: 1, padding: "13px", borderRadius: 14,
              background: "rgba(0,0,0,0.06)", color: "#000",
              fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
            }}>← 이전</button>
          )}
          <button
            onClick={isLast ? onDismiss : () => setSlide(s => s + 1)}
            disabled={!canNext}
            style={{
              flex: 2, padding: "13px", borderRadius: 14,
              background: canNext ? color : "rgba(0,0,0,0.08)",
              color: canNext ? "#fff" : "#aaa",
              fontWeight: 800, fontSize: 15, border: "none",
              cursor: canNext ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >
            {isLast ? "시작하기 →" : "다음 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
