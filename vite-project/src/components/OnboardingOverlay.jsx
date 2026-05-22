import { useState, useRef } from "react";

const SLIDES = [
  {
    emoji: "👋",
    title: "easyC에 오신 것을\n환영해요!",
    desc: "숏폼처럼 화면을 위로 넘기며\nC언어를 세상에서 가장 쉽게 배워보세요!",
    accent: "#007aff",
  },
  {
    emoji: "💻",
    title: "설치 없이\n폰에서 바로 코딩!",
    desc: "컴퓨터 없이도, 복잡한 프로그램 설치 없이도\n스마트폰 브라우저에서 즉시 코드를 실행해요.",
    accent: "#5856d6",
  },
  {
    emoji: "🚀",
    title: "3가지 학습으로\n완성해요",
    desc: "📖 개념 학습으로 이해하고\n💻 실습으로 손에 익히고\n🏆 프로젝트로 완성해요!",
    accent: "#ff9500",
  },
];

export default function OnboardingOverlay({ onComplete }) {
  const [phase, setPhase] = useState("slides"); // "slides" | "nickname"
  const [slideIdx, setSlideIdx] = useState(0);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const touchStartY = useRef(null);
  const wheelLocked = useRef(false);

  const isLast = slideIdx === SLIDES.length - 1;
  const accent = SLIDES[slideIdx].accent;

  const goNext = () => { if (slideIdx < SLIDES.length - 1) setSlideIdx(s => s + 1); };
  const goPrev = () => { if (slideIdx > 0) setSlideIdx(s => s - 1); };

  const handleWheel = (e) => {
    e.preventDefault();
    if (wheelLocked.current) return;
    wheelLocked.current = true;
    setTimeout(() => { wheelLocked.current = false; }, 600);
    if (e.deltaY > 20) goNext();
    else if (e.deltaY < -20) goPrev();
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 40) goNext();
    else if (diff < -40) goPrev();
    touchStartY.current = null;
  };

  const handleStart = () => {
    if (!nickname.trim()) { setError("닉네임을 입력해주세요!"); return; }
    onComplete(nickname.trim());
  };

  /* ── 닉네임 입력 화면 ── */
  if (phase === "nickname") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "#fff",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 32px",
      }}>
        <div style={{ maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 68, marginBottom: 28 }}>🧑‍💻</div>

          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, color: "#000", textAlign: "center", lineHeight: 1.25, marginBottom: 10 }}>
            당신의 개발자 닉네임을<br />입력하세요!
          </div>
          <div style={{ fontSize: 15, color: "#8e8e93", marginBottom: 36, textAlign: "center" }}>
            easyC에서 사용할 이름이에요
          </div>

          <input
            type="text"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            placeholder="닉네임 입력..."
            maxLength={16}
            autoFocus
            style={{
              width: "100%", padding: "16px 18px",
              fontSize: 18, fontWeight: 700,
              border: `2px solid ${error ? "#ff3b30" : "#e5e5ea"}`,
              borderRadius: 16, outline: "none",
              textAlign: "center",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
          />
          {error && (
            <div style={{ fontSize: 13, color: "#ff3b30", fontWeight: 600, marginTop: 8 }}>{error}</div>
          )}

          <button
            onClick={handleStart}
            style={{
              width: "100%", padding: "16px 0", marginTop: 20,
              background: "var(--blue)", color: "#fff",
              borderRadius: 16, fontWeight: 800, fontSize: 17,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,122,255,0.35)",
              letterSpacing: -0.3,
            }}
          >
            easyC 시작하기 🚀
          </button>
        </div>
      </div>
    );
  }

  /* ── 슬라이드 화면 ── */
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#f2f2f7", overflow: "hidden" }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes bounce-hint {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%       { transform: translateY(-7px); opacity: 0.6; }
        }
      `}</style>

      {/* 슬라이드 컨테이너 */}
      <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
        <div style={{
          display: "flex", flexDirection: "column",
          height: `${SLIDES.length * 100}%`,
          transform: `translateY(-${(slideIdx / SLIDES.length) * 100}%)`,
          transition: "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>
          {SLIDES.map((slide, i) => (
            <div key={i} style={{
              height: `${100 / SLIDES.length}%`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "40px 32px",
            }}>
              <div style={{ maxWidth: 380, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* 이모지 원형 */}
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: slide.accent + "15",
                  border: `2.5px solid ${slide.accent}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 56, marginBottom: 36,
                  boxShadow: `0 8px 36px ${slide.accent}22`,
                }}>
                  {slide.emoji}
                </div>

                {/* 제목 */}
                <div style={{
                  fontSize: 30, fontWeight: 900, letterSpacing: -1,
                  color: "#000", textAlign: "center",
                  marginBottom: 18, lineHeight: 1.2,
                  whiteSpace: "pre-line",
                }}>
                  {slide.title}
                </div>

                {/* 설명 */}
                <div style={{
                  fontSize: 16, color: "#3c3c43",
                  textAlign: "center", lineHeight: 1.85,
                  whiteSpace: "pre-line", fontWeight: 500,
                }}>
                  {slide.desc}
                </div>

                {/* 마지막 슬라이드: 다음 버튼 */}
                {i === SLIDES.length - 1 && (
                  <button
                    onClick={() => setPhase("nickname")}
                    style={{
                      marginTop: 44,
                      padding: "15px 52px",
                      background: slide.accent,
                      color: "#fff", borderRadius: 16,
                      fontWeight: 800, fontSize: 17,
                      border: "none", cursor: "pointer",
                      boxShadow: `0 4px 20px ${slide.accent}44`,
                      letterSpacing: -0.3,
                    }}
                  >
                    다음 →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 점 인디케이터 */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 8,
        pointerEvents: "none",
      }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            width: slideIdx === i ? 22 : 8,
            height: 8, borderRadius: 4,
            background: slideIdx === i ? accent : "rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      {/* 스와이프 힌트 */}
      {!isLast && (
        <div style={{
          position: "absolute", bottom: 32, left: 0, right: 0,
          textAlign: "center", fontSize: 14, color: "#8e8e93", fontWeight: 600,
          animation: "bounce-hint 1.8s ease-in-out infinite",
          pointerEvents: "none",
        }}>
          위로 넘겨보세요 👆
        </div>
      )}
    </div>
  );
}
