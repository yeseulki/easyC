import { useState, useRef, useMemo, useEffect } from "react";

function translateLine(raw) {
  let text = raw.trim();
  if (!text) return "";
  if (text.startsWith("#include")) return text.replace(/#include\s*<(.*?)>/, "📦 $1 기능 가져오기");
  if (text.includes("int main()")) return "🚀 메인 프로그램 시작";
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

function Drum({ options, selected, onSelect, fixed, color }) {
  const startY = useRef(null);
  const label  = options[selected];

  const next = () => { if (!fixed) onSelect((selected + 1) % options.length); };
  const onTS = e => { if (!fixed) startY.current = e.touches[0].clientY; };
  const onTE = e => {
    if (fixed || startY.current == null) return;
    const dy = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 12) onSelect((selected + (dy > 0 ? 1 : -1) + options.length) % options.length);
    startY.current = null;
  };

  return (
    <div
      style={{
        position: "relative",
        height: 44,
        minWidth: Math.max(52, label.length * 9 + 22),
        background: fixed ? "rgba(0,0,0,0.04)" : "#fff",
        border: `0.5px solid ${fixed ? "rgba(0,0,0,0.08)" : color + "55"}`,
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        cursor: fixed ? "default" : "pointer",
        boxShadow: fixed ? "none" : `0 2px 8px ${color}1a`,
        flexShrink: 0,
      }}
      onClick={next} onTouchStart={onTS} onTouchEnd={onTE}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: `linear-gradient(to bottom,${fixed ? "rgba(0,0,0,0.04)" : "#fff"},transparent)`, zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: `linear-gradient(to top,${fixed ? "rgba(0,0,0,0.04)" : "#fff"},transparent)`, zIndex: 2, pointerEvents: "none" }} />
      <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: fixed ? "rgba(60,60,67,0.3)" : color, padding: "0 8px" }}>
        {label}
      </span>
      {!fixed && <div style={{ position: "absolute", bottom: 2, right: 5, fontSize: 8, color, opacity: 0.45 }}>↑↓</div>}
    </div>
  );
}

export default function SlotCodePicker({ slots, color = "var(--blue)", onResult, hint }) {
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

  const [sel,      setSel]      = useState(processedSlots.map(() => 0));
  const [result,   setResult]   = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Reset selection when slots change
  useEffect(() => {
    setSel(processedSlots.map(() => 0));
    setResult(null);
  }, [processedSlots]);

  const pick = (i, v) => { const n = [...sel]; n[i] = v; setSel(n); setResult(null); };

  const check = () => {
    const ok = processedSlots.every((s, i) => sel[i] === s.correct);
    setResult(ok ? "ok" : "err");
    if (ok) {
      const items = Array.from({ length: 16 }, (_, i) => ({ id: i, x: Math.random() * 100, c: ["#007aff","#af52de","#ff9500","#34c759","#ff2d55"][i % 5], d: Math.random() * 0.3 }));
      setConfetti(items);
      setTimeout(() => setConfetti([]), 1100);
    }
    onResult?.(ok);
  };

  const assembled = processedSlots.map((s, i) => s.options[sel[i]]).join(" ");

  return (
    <div style={{ position: "relative" }}>
      {confetti.map(c => (
        <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "30%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
      ))}

      <div style={{ fontSize: 12, color: "var(--label3)", fontWeight: 500, marginBottom: 12, textAlign: "center" }}>
        슬롯을 탭해서 올바른 코드를 조합해봐!
      </div>

      {/* Drums */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
        {processedSlots.map((s, i) => (
          <Drum key={i} options={s.options} selected={sel[i]} onSelect={v => pick(i, v)} fixed={s.fixed} color={color} />
        ))}
      </div>

      {/* Assembled preview */}
      <div style={{
        background: result === "ok" ? "rgba(52,199,89,0.08)" : result === "err" ? "rgba(255,59,48,0.08)" : "rgba(0,0,0,0.03)",
        border: `0.5px solid ${result === "ok" ? "rgba(52,199,89,0.35)" : result === "err" ? "rgba(255,59,48,0.3)" : "rgba(0,0,0,0.1)"}`,
        borderRadius: 12, padding: "11px 14px", textAlign: "center", marginBottom: 12,
        animation: result === "err" ? "iosShake 0.4s ease" : "none",
        transition: "all 0.25s",
      }}>
        <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: result === "ok" ? "var(--green)" : result === "err" ? "var(--red)" : "var(--label2)", marginBottom: 4 }}>
          {assembled}
        </div>
        <div style={{ fontSize: 12, color: color, fontWeight: 600, opacity: 0.85 }}>
          {translateLine(assembled)}
        </div>
      </div>

      {result === "ok" && (
        <div style={{ padding: "10px 14px", background: "rgba(52,199,89,0.08)", border: "0.5px solid rgba(52,199,89,0.25)", borderRadius: 12, fontSize: 14, color: "var(--green)", textAlign: "center", marginBottom: 12, fontWeight: 600, animation: "iosPop 0.35s ease" }}>
          🎉 완벽해! 정답이야!
        </div>
      )}
      {result === "err" && (
        <div style={{ padding: "10px 14px", background: "rgba(255,59,48,0.06)", border: "0.5px solid rgba(255,59,48,0.2)", borderRadius: 12, fontSize: 14, color: "var(--red)", textAlign: "center", marginBottom: 12 }}>
          🤔 다시 생각해봐!
        </div>
      )}
      {showHint && (
        <div style={{ padding: "10px 14px", background: "rgba(88,86,214,0.06)", border: "0.5px solid rgba(88,86,214,0.2)", borderRadius: 12, fontSize: 13, color: "var(--indigo)", marginBottom: 12, animation: "iosFadeScale 0.2s ease", whiteSpace: "pre-line", lineHeight: 1.6 }}>
          💡 {hint || "고정된 슬롯은 이미 맞아. 나머지 슬롯을 바꿔봐!"}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="ios-btn ios-btn-gray ios-btn-sm" style={{ flex: 1 }} onClick={() => setShowHint(h => !h)}>
          {showHint ? "힌트 숨기기" : "💡 힌트"}
        </button>
        <button className="ios-btn ios-btn-gray ios-btn-sm" onClick={() => { setSel(processedSlots.map(() => 0)); setResult(null); setShowHint(false); }}>
          ↩
        </button>
        <button className="ios-btn ios-btn-sm" style={{ flex: 1, background: color, color: "#fff" }} onClick={check}>
          확인 ✓
        </button>
      </div>
    </div>
  );
}
