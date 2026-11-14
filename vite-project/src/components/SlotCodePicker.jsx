import { useState, useRef, useMemo, useEffect } from "react";
import { useKeydown, isButtonTarget } from "../hooks/useKeydown";

function translateLine(raw) {
  let text = raw.trim();
  if (!text) return "";
  if (text.startsWith("#include")) return text.replace(/#include\s*<(.*?)>/, "📦 $1 기능 가져오기");
  if (text.includes("int main()")) return "▶️ 메인 프로그램 시작";
  if (text.includes("return 0;")) return "🏁 프로그램 정상 종료";
  if (text.startsWith("printf")) {
    let content = text.match(/printf\("([^"]*)"/);
    return `🖨️ 화면에 ${content ? '"'+content[1].replace(/\\n/g, ' [줄바꿈]')+'"' : ''} 출력하기`;
  }
  if (text.startsWith("scanf")) return "⌨️ 사용자로부터 입력받기";
  if (text.startsWith("struct")) return "📂 새로운 데이터 꾸러미(구조체) 정의하기";
  if (text.startsWith("int") || text.startsWith("float") || text.startsWith("char")) {
    if (text.includes("[]") || text.includes("[")) return "🏢 여러 값을 담는 배열 만들기";
    if (text.includes("*")) return "🗺️ 메모리 주소를 담는 포인터 만들기";
    return "📦 새로운 변수(저장 공간) 만들기";
  }
  if (text.includes("malloc")) return "🏗️ 필요한 만큼 메모리 공간 빌리기";
  if (text.includes("free(")) return "🧹 다 쓴 메모리 공간 반납하기";
  if (text.includes("fopen")) return "📖 파일 열기";
  if (text.includes("fprintf")) return "✍️ 파일에 내용 쓰기";
  if (text.includes("fclose")) return "📕 파일 닫기";
  if (text.includes("strcpy")) return "✏️ 글자(문자열) 복사해서 넣기";
  if (text.startsWith("for")) return "🔃 ~로 시작해서 ~일때까지 반복하기, ~씩 증가하면서!";
  if (text.startsWith("while")) return "🚪 조건이 참인 동안 계속 반복하기";
  if (text.startsWith("if")) return "🚦 만약 조건이 맞다면";
  if (text.startsWith("else if")) return "🚦 아니면 만약 조건이 맞다면";
  if (text.startsWith("else")) return "🚦 그 외의 경우라면";
  if (text.includes("=")) return "✏️ 변수에 새로운 값 저장하기";
  if (text === "}" || text === "};") return "블록 닫기";
  return "👉 코드 실행";
}

function Drum({ options, selected, onSelect, fixed, color, status, big = false }) {
  const startY = useRef(null);
  const label  = options[selected];
  const [tick, setTick] = useState(0);
  // 같은 슬롯의 모든 선지 중 가장 긴 것으로 너비 고정
  const fixedWidth = big
    ? Math.max(62, ...options.map(o => o.length * 10.5 + 28))   // 가로 화면: 조금 크게
    : Math.max(52, ...options.map(o => o.length * 9 + 22));

  const next = () => { if (!fixed) { onSelect((selected + 1) % options.length); setTick(t => t + 1); } };
  const onTS = e => { if (!fixed) startY.current = e.touches[0].clientY; };
  const onTE = e => {
    if (fixed || startY.current == null) return;
    const dy = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 12) { onSelect((selected + (dy > 0 ? 1 : -1) + options.length) % options.length); setTick(t => t + 1); }
    startY.current = null;
  };

  const statusColor = status === "ok" ? "#34c759" : status === "err" ? "#ff3b30" : null;
  const displayColor = fixed ? null : (statusColor ?? color);

  return (
    <div
      key={`drum-${tick}`}
      className={fixed ? undefined : "drum-btn"}
      style={{
        position: "relative",
        height: big ? 54 : 44,
        width: fixedWidth,
        background: fixed ? "rgba(0,0,0,0.04)" : status === "ok" ? "rgba(52,199,89,0.08)" : status === "err" ? "rgba(255,59,48,0.06)" : "#fff",
        border: `${status ? "1.5px" : "0.5px"} solid ${fixed ? "rgba(0,0,0,0.08)" : status === "ok" ? "rgba(52,199,89,0.6)" : status === "err" ? "rgba(255,59,48,0.5)" : color + "55"}`,
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        cursor: fixed ? "default" : "pointer",
        boxShadow: fixed ? "none" : status ? "none" : `0 2px 8px ${color}1a`,
        flexShrink: 0,
        userSelect: "none",
        WebkitUserSelect: "none",
        animation: tick > 0 ? "drumPop 0.22s cubic-bezier(0.2,1,0.2,1)" : "none",
        transition: "border 0.2s, background 0.2s",
      }}
      onClick={next} onTouchStart={onTS} onTouchEnd={onTE}
    >
      {/* 드럼 느낌의 위·아래 흰 그라데이션 — 정답/오답 색이 칠해졌을 땐 끝까지 칠해지도록 숨김 */}
      {!status && <>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: `linear-gradient(to bottom,${fixed ? "rgba(0,0,0,0.04)" : "#fff"},transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: `linear-gradient(to top,${fixed ? "rgba(0,0,0,0.04)" : "#fff"},transparent)`, zIndex: 2, pointerEvents: "none" }} />
      </>}
      <span style={{ fontFamily: "monospace", fontSize: big ? 16.5 : 14, fontWeight: 700, color: fixed ? "rgba(60,60,67,0.3)" : (displayColor ?? color), padding: "0 8px", display: "inline-block" }}>
        {label}
      </span>
      {!fixed && <div style={{ position: "absolute", bottom: 2, right: 5, fontSize: 8, color: displayColor ?? color, opacity: 0.45 }}>↑↓</div>}
    </div>
  );
}

// wide/gridStyle/asideTop/asideBottom: 코딩 탭 가로 화면 2단용 (안 넘기면 기존과 똑같이 동작)
export default function SlotCodePicker({ slots, color = "var(--blue)", onResult, hint, wide = false, gridStyle, asideTop = null, asideBottom = null, enterToCheck = false }) {
  const processedSlots = useMemo(() => {
    return slots.map(s => {
      if (s.fixed || s.options.length <= 1) return s;
      const options = [...s.options];
      const correctVal = options[s.correct];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      return { ...s, options, correct: options.indexOf(correctVal) };
    });
  }, [slots]);

  const [sel,          setSel]          = useState(processedSlots.map(() => 0));
  const [result,       setResult]       = useState(null);
  const [slotStatuses, setSlotStatuses] = useState([]);
  const [showHint,     setShowHint]     = useState(false);
  const [confetti,     setConfetti]     = useState([]);

  // Reset selection when slots change
  useEffect(() => {
    setSel(processedSlots.map(() => 0));
    setResult(null);
    setSlotStatuses([]);
  }, [processedSlots]);

  const pick = (i, v) => { const n = [...sel]; n[i] = v; setSel(n); setResult(null); setSlotStatuses([]); };

  const check = () => {
    const statuses = processedSlots.map((s, i) => s.fixed ? null : (sel[i] === s.correct ? "ok" : "err"));
    setSlotStatuses(statuses);
    const ok = processedSlots.every((s, i) => sel[i] === s.correct);
    setResult(ok ? "ok" : "err");
    if (ok) {
      const items = Array.from({ length: 16 }, (_, i) => ({ id: i, x: Math.random() * 100, c: ["#007aff","#af52de","#ff9500","#34c759","#ff2d55"][i % 5], d: Math.random() * 0.3 }));
      setConfetti(items);
      setTimeout(() => setConfetti([]), 1100);
    }
    onResult?.(ok);
  };

  // Enter → 확인 (코딩 탭에서만 켬). 이미 맞힌 뒤엔 코딩 탭이 Enter로 다음 문제로 넘김
  useKeydown(e => {
    if (!enterToCheck || e.key !== "Enter" || e.repeat || isButtonTarget(e) || result === "ok") return;
    e.preventDefault();
    check();
  });

  // 전체 조합 (translateLine용) — 비고정 슬롯 선택값만
  const assembled = processedSlots.filter(s => !s.fixed).map((s, i) => {
    const globalIdx = processedSlots.indexOf(s);
    return s.options[sel[globalIdx]];
  }).join(" ");
  // 화면에 보여줄 조합 — 전체 슬롯
  const assembledDisplay = processedSlots.map((s, i) => s.options[sel[i]]).join("");

  const confettiEls = confetti.map(c => (
    <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "30%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
  ));

  // 문제(슬롯) 부분
  const pickerArea = (
    <>
      <div style={{ fontSize: wide ? 13.5 : 12, color: "var(--label3)", fontWeight: 500, marginBottom: 16, textAlign: "center" }}>
        슬롯을 탭해서 올바른 코드를 조합해봐!
      </div>

      {/* Drums */}
      <div style={{ display: "flex", gap: wide ? 8 : 6, justifyContent: "center", flexWrap: "wrap", marginBottom: wide ? 14 : 24 }}>
        {processedSlots.map((s, i) => (
          <Drum key={i} options={s.options} selected={sel[i]} onSelect={v => pick(i, v)} fixed={s.fixed} color={color} status={slotStatuses[i] ?? null} big={wide} />
        ))}
      </div>
    </>
  );

  // 정답 메시지
  const okMsg = (
    <div style={{ padding: wide ? "12px 16px" : "10px 14px", background: "rgba(52,199,89,0.08)", border: "0.5px solid rgba(52,199,89,0.25)", borderRadius: 12, fontSize: wide ? 15.5 : 14, color: "var(--green)", textAlign: "center", marginBottom: 16, fontWeight: 600, animation: "iosPop 0.35s ease" }}>
      🎉 완벽해! 정답이야!
    </div>
  );

  // 정답/오답 메시지 + 힌트 — 가로 화면에선 2단 아래에 전체 폭으로 (wide-msgs)
  const feedback = (
    <>
      {result === "ok" && okMsg}
      {result === "err" && (
        <div style={{ padding: wide ? "12px 16px" : "10px 14px", background: "rgba(255,59,48,0.06)", border: "0.5px solid rgba(255,59,48,0.2)", borderRadius: 12, fontSize: wide ? 15.5 : 14, color: "var(--red)", textAlign: "center", marginBottom: 16, animation: "iosShake 0.4s ease" }}>
          <div style={{ fontWeight: 700 }}>🤔 틀렸어!</div>
          {/* 해석이 안 되는 경우의 기본 문구("👉 코드 실행")는 도움이 안 돼서 안 보여줌 */}
          {translateLine(assembled) !== "👉 코드 실행" && (
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4, color: "var(--red)" }}>{translateLine(assembled)}</div>
          )}
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>다시 생각해봐.</div>
        </div>
      )}
      {showHint && (
        <div style={{ padding: wide ? "12px 16px" : "10px 14px", background: "rgba(88,86,214,0.06)", border: "0.5px solid rgba(88,86,214,0.2)", borderRadius: 12, fontSize: wide ? 14.5 : 13, color: "var(--indigo)", marginBottom: 16, animation: "iosFadeScale 0.2s ease", whiteSpace: "pre-line", lineHeight: 1.6 }}>
          💡 {hint || "고정된 슬롯은 이미 맞아. 나머지 슬롯을 바꿔봐!"}
        </div>
      )}
    </>
  );

  const bigBtn = wide ? { padding: "12px 18px", fontSize: 15.5 } : {};
  const buttons = (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="ios-btn ios-btn-gray ios-btn-sm" style={{ flex: 1, ...bigBtn }} onClick={() => setShowHint(h => !h)}>
          {showHint ? "힌트 숨기기" : "💡 힌트"}
        </button>
        <button className="ios-btn ios-btn-gray ios-btn-sm" style={bigBtn} onClick={() => { setSel(processedSlots.map(() => 0)); setResult(null); setSlotStatuses([]); setShowHint(false); }}>
          ↩
        </button>
        <button className="ios-btn ios-btn-sm" style={{ flex: 1, background: color, color: "#fff", ...bigBtn }} onClick={check}>
          확인 ✓
        </button>
      </div>
  );

  // 가로 화면: 왼쪽 = asideTop(출력 결과 등) / 오른쪽 = 슬롯 문제(흰 박스)
  // 그 아래 전체 폭으로 버튼 → 정답·오답·힌트 → asideBottom(스와이프 안내) 가운데. 슬롯 칸이 넓은 쪽(1.15fr)에 오도록 열 비율도 뒤집음
  if (wide) {
    return (
      <>
        <div style={{ position: "relative", ...gridStyle, gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)" }}>
          {confettiEls}
          <div className="split-col grow-first">
            {asideTop}
          </div>
          <div className="split-col grow-first">
            <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "20px 16px 6px" /* 슬롯 줄 아래 margin 14px 고려 → 위아래 여백 같게 */ }}>
              {pickerArea}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>{buttons}</div>
        <div className="wide-msgs">{feedback}</div>
        {asideBottom}
      </>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {confettiEls}
      {pickerArea}
      {feedback}
      {buttons}
    </div>
  );
}
