import { useState, useRef, useEffect, useMemo } from "react";
import { stages } from "../data/curriculum";

function translateLine(raw) {
  let text = raw.trim();
  if (!text) return "";
  text = text.replace(/__SLOT_\d+__/g, "빈칸");
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
  if (text.startsWith("for")) return "🔃 정해진 횟수/조건만큼 반복하기";
  if (text.startsWith("while")) return "🚪 조건이 참인 동안 계속 반복하기";
  if (text.startsWith("if")) return "🚦 만약 조건이 맞다면";
  if (text.startsWith("else if")) return "🚦 아니면 만약 조건이 맞다면";
  if (text.startsWith("else")) return "🚦 그 외의 경우라면";
  if (text.includes("=")) return "✏️ 변수에 새로운 값 저장하기";
  if (text === "}" || text === "};") return "블록 닫기";
  return "👉 코드 실행";
}

/* ── Memory Map Component ── */
function MemoryMap({ color }) {
  const [activeAddr, setActiveAddr] = useState(null);
  const cells = [
    { addr: "0x100", name: "age", type: "int", val: "15", size: 4 },
    { addr: "0x104", name: "(empty)", type: "-", val: "??", size: 4 },
    { addr: "0x108", name: "pi", type: "float", val: "3.14", size: 4 },
    { addr: "0x10C", name: "grade", type: "char", val: "'A'", size: 1 },
    { addr: "0x10D", name: "(empty)", type: "-", val: "??", size: 3 },
  ];

  return (
    <div style={{ background: "#1c1c1e", borderRadius: 20, padding: "20px", marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
      <div style={{ fontSize: 11, color: "#8e8e93", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>💻 컴퓨터의 메모리 내부 (RAM)</div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {cells.map((c, i) => (
          <div 
            key={i} 
            onClick={() => setActiveAddr(activeAddr === c.addr ? null : c.addr)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              background: activeAddr === c.addr ? color + "33" : "rgba(255,255,255,0.05)",
              border: `1px solid ${activeAddr === c.addr ? color : "transparent"}`,
              padding: "12px 16px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ fontFamily: "monospace", color: "#8e8e93", fontSize: 12, width: 50 }}>{c.addr}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: c.name.startsWith("(") ? "#48484a" : "#fff", fontWeight: 700, fontSize: 14 }}>{c.name}</span>
              {!c.name.startsWith("(") && <span style={{ color, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{c.type}</span>}
            </div>
            <div style={{ fontFamily: "monospace", color: activeAddr === c.addr ? "#fff" : color, fontWeight: 700 }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, fontSize: 13, color: "#c7c7cc", lineHeight: 1.5 }}>
        {activeAddr ? (
          <div style={{ animation: "iosFadeIn 0.3s ease" }}>
            <b>주소 {activeAddr}</b>: 이 칸에 데이터가 저장되어 있어. C언어는 이런 주소를 직접 다룰 수 있는 아주 강력한 언어야! 🚀
          </div>
        ) : (
          <div style={{ textAlign: "center", opacity: 0.6 }}>주소를 클릭해서 상세 정보를 확인해봐!</div>
        )}
      </div>
    </div>
  );
}

/* ── CFeed-style inline slot inside code ── */
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

/* ── Build code lines with inline slots ── */
function CodeWithSlots({ card, color, sel, onSel, showKorean }) {
  const slotColors = ["#007aff", "#af52de", "#ff9500", "#34c759", "#30b0c7"];
  const fullLines = card.fullCode.split("\n");

  return (
    <div className="cf-code"
      onMouseDown={e => { 
        if (e.clientY - e.currentTarget.getBoundingClientRect().top >= e.currentTarget.clientHeight) return;
        e.currentTarget._isDown = true; e.currentTarget._startX = e.pageX - e.currentTarget.offsetLeft; e.currentTarget._scrollLeft = e.currentTarget.scrollLeft; e.currentTarget.style.cursor = 'grabbing'; 
      }}
      onMouseLeave={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
      onMouseUp={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
      onMouseMove={e => { if (!e.currentTarget._isDown) return; e.preventDefault(); const x = e.pageX - e.currentTarget.offsetLeft; const walk = (x - e.currentTarget._startX) * 2; e.currentTarget.scrollLeft = e.currentTarget._scrollLeft - walk; }}
      onWheel={e => { if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) { e.stopPropagation(); e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
      style={{ cursor: 'grab', userSelect: 'none' }}
    >
      {fullLines.map((line, li) => {
        return (
          <div key={li} style={{ display: "flex", flexDirection: "column", width: "max-content", minWidth: "100%", marginBottom: showKorean ? 8 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "pre" }}>
              <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none", flexShrink: 0 }}>{li + 1}</span>
              <LineWithSlots raw={line} card={card} sel={sel} onSel={onSel} color={color} slotColors={slotColors} />
            </div>
            {showKorean && line.trim() !== "" && (
              <div style={{ paddingLeft: 36, marginTop: 2, fontSize: 12, color: "var(--blue)", fontWeight: 600, opacity: 0.8, animation: "iosFadeIn 0.3s ease" }}>
                {translateLine(line)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LineWithSlots({ raw, card, sel, onSel, color, slotColors }) {
  const nonFixed = card.slots.filter(s => !s.fixed);
  const foundSlots = [];
  
  nonFixed.forEach((slot, si) => {
    const correctVal = slot.options[slot.correct];
    let startIdx = 0;
    while (true) {
      const idx = raw.indexOf(correctVal, startIdx);
      if (idx === -1) break;
      if (!foundSlots.some(f => f.idx === idx)) {
        foundSlots.push({ idx, si, val: correctVal });
      }
      startIdx = idx + correctVal.length;
    }
  });

  foundSlots.sort((a, b) => a.idx - b.idx);

  if (foundSlots.length === 0) {
    return <SyntaxLine raw={raw} />;
  }

  const elements = [];
  let currentPos = 0;

  foundSlots.forEach((found, i) => {
    if (found.idx > currentPos) {
      elements.push(<SyntaxLine key={`text-${i}`} raw={raw.slice(currentPos, found.idx)} />);
    }
    const sc = slotColors[found.si % slotColors.length] || color;
    elements.push(
      <InlineSlot
        key={`slot-${found.si}`}
        options={nonFixed[found.si].options}
        selected={sel[found.si] || 0}
        onSelect={v => onSel(found.si, v)}
        color={sc}
      />
    );
    currentPos = found.idx + found.val.length;
  });

  if (currentPos < raw.length) {
    elements.push(<SyntaxLine key="text-end" raw={raw.slice(currentPos)} />);
  }

  return <>{elements}</>;
}

function SyntaxLine({ raw }) {
  const html = raw
    .replace(/\b(int|float|char|void|return|if|else|for|while|include|stdio\.h|stdlib\.h)\b/g, '<span class="t-kw">$1</span>')
    .replace(/\b(printf|scanf|malloc|free|sizeof|main)\b/g, '<span class="t-fn">$1</span>')
    .replace(/"([^"]*)"/g, '<span class="t-str">"$1"</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="t-num">$1</span>')
    .replace(/\/\/(.*)/g, '<span class="t-cmt">// $1</span>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── Explanation bullets ── */
const EXPLAIN_ICONS = ["❓", "🔁", "📊", "💡", "⚠️"];
function Explanations({ card, stage }) {
  const bullets = [
    `${card.title}`,
    `이 코드는 ${stage.subtitle} 개념을 사용해.`,
    card.expectedOutput ? `예상 출력: ${card.expectedOutput}` : null,
    card.hint,
  ].filter(Boolean);

  return (
    <div className="cf-explain">
      {bullets.map((b, i) => (
        <div key={i} className="cf-explain-item">
          <span style={{ fontSize: 16, flexShrink: 0 }}>{EXPLAIN_ICONS[i] || "•"}</span>
          <span style={{ whiteSpace: "pre-wrap" }}>{b.replace("예상 출력: ", "")}</span>
        </div>
      ))}
      <div className="cf-tags">
        <span className="cf-tag">#{stage.subtitle.replace(/\s/g, "")}</span>
        <span className="cf-tag">#{stage.title}</span>
        <span className="cf-tag">#C언어</span>
      </div>
    </div>
  );
}

/* ── One full code card ── */
function CodeLearnCard({ stage, card, cardIdx, stageIdx, totalCards, onNavigate, isLast, onSave, savedItems, onSolvedChange, onCorrect, initialAnswer, onUpdateAnswer, scrollRef }) {
  const isSaved = savedItems?.some(i => i.title === card.title);
  const [showKorean, setShowKorean] = useState(false);
  const processedSlots = useMemo(() => {
    return card.slots.map(s => {
      if (s.fixed || s.options.length <= 1) return s;
      const options = [...s.options].sort(); // Stable sort to avoid shuffle issues with persistence
      const correctVal = s.options[s.correct];
      const newCorrect = options.indexOf(correctVal);
      return { ...s, options, correct: newCorrect };
    });
  }, [card.slots]);

  const processedCard = { ...card, slots: processedSlots };
  const nonFixed = processedSlots.filter(s => !s.fixed);
  const [sel,    setSel]    = useState(initialAnswer || nonFixed.map(() => 0));
  const [status, setStatus] = useState(() => {
    if (!initialAnswer) return null;
    const ok = nonFixed.every((s, i) => initialAnswer[i] === s.correct);
    return ok ? "ok" : null;
  });
  const [confetti, setConfetti] = useState([]);

  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);
  const pick = (i, v) => { 
    const n = [...sel]; 
    n[i] = v; 
    setSel(n); 
    setStatus(null); 
    onUpdateAnswer(stage.id, cardIdx, n);
  };

  const check = () => {
    const ok = nonFixed.every((s, i) => sel[i] === s.correct);
    setStatus(ok ? "ok" : "err");
    if (ok) {
      const items = Array.from({ length: 16 }, (_, i) => ({ id: i, x: Math.random() * 100, c: ["#007aff","#af52de","#ff9500","#34c759","#ff2d55"][i % 5], d: Math.random() * 0.3 }));
      setConfetti(items);
      setTimeout(() => setConfetti([]), 1100);
      onSolvedChange?.(true);
      onCorrect?.();
    } else {
      setTimeout(() => setStatus(null), 1500);
    }
  };

  const handleNavigate = () => {
    onNavigate("code");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f2f2f7", position: "relative" }}>
      {confetti.map(c => (
        <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "30%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
      ))}
      <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, transition: "width 0.4s" }} />
      </div>

      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#f2f2f7" }}>
        <span style={{ fontSize: 18 }}>{stage.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>{stage.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8e8e93" }}>{cardIdx + 1} / {totalCards}</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "0 16px 12px", background: "#f2f2f7", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>💻 실습</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, lineHeight: 1.3, color: "#000" }}>{card.title}</h2>
            <p style={{ fontSize: 13, color: "#8e8e93", marginTop: 6, lineHeight: 1.6 }}>{card.description}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <button onClick={() => setShowKorean(!showKorean)} style={{ background: showKorean ? stage.color : "rgba(0,0,0,0.06)", color: showKorean ? "#fff" : "#000", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, transition: "all 0.2s", border: "none", cursor: "pointer" }}>
              {showKorean ? "💡 원본 코드" : "💡 자연어 해석"}
            </button>
            <div className="cf-action-btn" onClick={() => onSave?.(card, stageIdx, cardIdx)}>
              <div className="cf-action-icon" style={{ width: 38, height: 38, fontSize: 18, color: isSaved ? stage.color : "#000" }}>{isSaved ? "🔖" : "📌"}</div>
            </div>
          </div>
        </div>

        <div style={{ margin: "0 16px", position: "relative" }}>
          <div className="cf-card">
            <div className="cf-dots"><div className="cf-dot red" /><div className="cf-dot yellow" /><div className="cf-dot green" /></div>
            <CodeWithSlots card={processedCard} color={stage.color} sel={sel} onSel={pick} showKorean={showKorean} />
          </div>
        </div>

        <div style={{ margin: "12px 16px 0" }}>
          <div className="cf-card"><Explanations card={card} stage={stage} /></div>
        </div>

        {isLast && status === "ok" && (
          <div style={{ margin: "24px 16px 0", paddingBottom: 20 }}>
            <button onClick={handleNavigate} className="ios-btn ios-btn-fill" style={{ width: "100%", background: "var(--blue)", borderRadius: 16, padding: "18px", fontSize: 18, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,122,255,0.25)" }}>
              학습 완료! 코딩 시작하기
            </button>
          </div>
        )}
        <div style={{ height: 100 }} />
      </div>

      <div style={{ position: "sticky", bottom: 0, background: "#f2f2f7", padding: "12px 16px 16px", borderTop: "0.5px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "center" }}>
        <button className={`cf-cta ${status === "ok" ? "success" : status === "err" ? "error" : ""}`} onClick={check}>
          {status === "ok" ? "✓ 정답이야! 완벽해!" : status === "err" ? "✗ 다시 생각해봐!" : "확인하기"}
        </button>
      </div>
    </div>
  );
}

/* ── Concept card ── */
function ConceptLearnCard({ stage, card, cardIdx, stageIdx, totalCards, onNavigate, isLast, onSave, savedItems, scrollRef }) {
  const [flipped, setFlipped] = useState(false);
  const isSaved = savedItems?.some(i => i.title === card.title);
  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

  const handleNavigate = () => {
    onNavigate("code");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const highlight = (text) => {
    return text.split("\n").map((line, i) => (
      <span key={i} style={{ display: "block", marginBottom: 8 }}>
        {line.split(/(세미콜론|;|printf|변수|상자|int|float|char|if|for|while|배열|포인터|메모리 주소|&|\*|구조체|파일|fopen|fclose|fprintf|연결 리스트|노드)/g).map((part, j) => {
          const isKeyword = /(세미콜론|;|printf|변수|상자|int|float|char|if|for|while|배열|포인터|메모리 주소|&|\*|구조체|파일|fopen|fclose|fprintf|연결 리스트|노드)/.test(part);
          return isKeyword ? <b key={j} style={{ color: stage.color, fontWeight: 800 }}>{part}</b> : part;
        })}
      </span>
    ));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f2f2f7" }}>
      <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, transition: "width 0.4s" }} />
      </div>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#f2f2f7" }}>
        <span style={{ fontSize: 18 }}>{stage.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>{stage.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8e8e93" }}>{cardIdx + 1} / {totalCards}</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>📖 개념</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.3, color: "#000", marginBottom: 16, borderLeft: `3px solid ${stage.color}`, paddingLeft: 12 }}>{card.title}</h2>
          </div>
          <div className="cf-action-btn" onClick={() => onSave?.(card, stageIdx, cardIdx)} style={{ marginTop: 4 }}>
            <div className="cf-action-icon" style={{ width: 38, height: 38, fontSize: 18, color: isSaved ? stage.color : "#000" }}>{isSaved ? "🔖" : "📌"}</div>
          </div>
        </div>

        {card.visualization === "memory" && <MemoryMap color={stage.color} />}

        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>🧠 비유로 이해하기</div>
          <pre style={{ fontFamily: "monospace", fontSize: 13, color: stage.color, lineHeight: 1.85, margin: 0, whiteSpace: "pre-wrap" }}>{card.metaphor}</pre>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 15, color: "#3c3c43", lineHeight: 1.8 }}>{highlight(card.content)}</div>
        </div>

        <div style={{ background: flipped ? stage.color + "10" : "#fff", border: `1px solid ${flipped ? stage.color + "44" : "rgba(0,0,0,0.08)"}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.25s", marginBottom: 24 }} onClick={() => setFlipped(f => !f)}>
          {!flipped ? <div style={{ textAlign: "center", color: "#8e8e93", fontSize: 14 }}>💡 탭해서 핵심 팁 보기</div> : <div style={{ fontSize: 14, color: stage.color, lineHeight: 1.7, animation: "iosFadeIn 0.2s ease" }}><b>핵심 팁:</b> {card.tip}</div>}
        </div>

        {isLast && (
          <div style={{ marginTop: 8, paddingBottom: 24 }}>
            <button onClick={handleNavigate} className="ios-btn ios-btn-fill" style={{ width: "100%", background: "var(--blue)", borderRadius: 16, padding: "18px", fontSize: 18, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,122,255,0.25)" }}>
              학습 완료! 코딩 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}




/* ── Project Card Supporting Components ── */
function InlineTypingSlot({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => {
        e.stopPropagation();
        onChange(e.target.value);
      }}
      spellCheck="false"
      className="cf-input-slot"
      style={{ minWidth: Math.max(30, value.length * 8 + 10) }}
    />  );
}
function LineWithTypingSlots({ raw, onInputChange, inputs }) {
  const parts = raw.split(/(__SLOT_\d+__)/g);
  let slotIndex = -1; 
  
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/__SLOT_(\d+)__/);
        if (match) {
          slotIndex++;
          const currentIndex = slotIndex;
          return (
            <InlineTypingSlot
              key={`slot-${currentIndex}`}
              value={inputs[currentIndex] || ""}
              onChange={val => onInputChange(currentIndex, val)}
            />
          );
        }
        return <SyntaxLine key={`text-${i}`} raw={part} />;
      })}
    </>
  );
}

function CodeWithTypingSlots({ card, inputs, onInputChange, showKorean }) {
  const fullLines = card.fullCode.split("\n");
  let slotCounter = 0;

  return (
    <div className="cf-code"
      onMouseDown={e => { e.currentTarget._isDown = true; e.currentTarget._startX = e.pageX - e.currentTarget.offsetLeft; e.currentTarget._scrollLeft = e.currentTarget.scrollLeft; e.currentTarget.style.cursor = 'grabbing'; }}
      onMouseLeave={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
      onMouseUp={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
      onMouseMove={e => { if (!e.currentTarget._isDown) return; e.preventDefault(); const x = e.pageX - e.currentTarget.offsetLeft; const walk = (x - e.currentTarget._startX) * 2; e.currentTarget.scrollLeft = e.currentTarget._scrollLeft - walk; }}
      onWheel={e => { if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }}
      style={{ cursor: 'grab', userSelect: 'none' }}
    >
      {fullLines.map((line, li) => {
        const currentSlotStart = slotCounter;
        const slotsInLine = (line.match(/__SLOT_\d+__/g) || []).length;
        const lineInputs = inputs.slice(currentSlotStart, currentSlotStart + slotsInLine);
        const handleLineInputChange = (indexInLine, value) => {
          onInputChange(currentSlotStart + indexInLine, value);
        };
        slotCounter += slotsInLine;
        
        return (
          <div key={li} style={{ display: "flex", flexDirection: "column", width: "max-content", minWidth: "100%", marginBottom: showKorean ? 8 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "pre" }}>
              <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none", flexShrink: 0 }}>{li + 1}</span>
              <LineWithTypingSlots
                raw={line}
                onInputChange={handleLineInputChange}
                inputs={lineInputs}
              />
            </div>
            {showKorean && line.trim() !== "" && (
              <div style={{ paddingLeft: 36, marginTop: 2, fontSize: 12, color: "var(--blue)", fontWeight: 600, opacity: 0.8, animation: "iosFadeIn 0.3s ease" }}>
                {translateLine(line)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Project card ── */
function ProjectLearnCard({ stage, card, cardIdx, stageIdx, totalCards, onBadge, onNavigate, isLast, onSolvedChange, onCorrect, initialAnswer, onUpdateAnswer, badges, scrollRef }) {
  const isClaimed = badges?.includes(card.badge);
  const [showKorean, setShowKorean] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [inputs, setInputs] = useState(initialAnswer || Array(card.slots.length).fill(""));
  const [status, setStatus] = useState(() => {
    if (!initialAnswer) return null;
    const isCorrect = card.slots.every((slot, i) => (initialAnswer[i] || "") === slot.answer);
    return isCorrect ? "ok" : null;
  });
  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    setStatus(null);
    onUpdateAnswer(stage.id, cardIdx, newInputs);
  };

  const check = () => {
    const isCorrect = card.slots.every((slot, i) => inputs[i].trim() === slot.answer.trim());
    setStatus(isCorrect ? "ok" : "err");
    if (isCorrect) {
      onSolvedChange?.(true);
      onCorrect?.();
    } else {
      setTimeout(() => setStatus(null), 1500);
    }
  };

  const handleClaim = () => {
    if (status !== "ok") {
      alert("먼저 '정답 확인' 버튼을 눌러 코드를 완성해야 해!");
      return;
    }
    const items = Array.from({ length: 16 }, (_, i) => ({ id: i, x: Math.random() * 100, c: ["#007aff","#af52de","#ff9500","#34c759","#ff2d55"][i % 5], d: Math.random() * 0.3 }));
    setConfetti(items);
    setTimeout(() => setConfetti([]), 1100);
    onBadge(card.badge);
    onSolvedChange?.(true); // Redundant but safe
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f2f2f7", position: "relative" }}>
      {confetti.map(c => (
        <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "30%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
      ))}
      <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, transition: "width 0.4s" }} />
      </div>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#f2f2f7" }}>
        <span style={{ fontSize: 18 }}>{stage.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>{stage.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8e8e93" }}>{cardIdx + 1} / {totalCards}</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ paddingTop: 12, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>🚀 프로젝트</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.3, color: "#000", marginBottom: 10 }}>{card.title}</h2>
            <p style={{ fontSize: 14, color: "#8e8e93", lineHeight: 1.7, marginBottom: 16, whiteSpace: "pre-line" }}>{card.description}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <button onClick={() => setShowKorean(!showKorean)} style={{ background: showKorean ? stage.color : "rgba(0,0,0,0.06)", color: showKorean ? "#fff" : "#000", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, transition: "all 0.2s", border: "none", cursor: "pointer" }}>
              {showKorean ? "💡 원본 코드" : "💡 자연어 해석"}
            </button>
          </div>
        </div>

        <div className="cf-card" style={{ marginBottom: 16 }}>
          <div className="cf-dots"><div className="cf-dot red" /><div className="cf-dot yellow" /><div className="cf-dot green" /></div>
          <CodeWithTypingSlots card={card} inputs={inputs} onInputChange={handleInputChange} showKorean={showKorean} />
        </div>
        
        <div style={{ padding: '0 0 16px', display: 'flex', justifyContent: 'center' }}>
          <button className={`cf-cta ${status === "ok" ? "success" : status === "err" ? "error" : ""}`} onClick={check} style={{ width: '100%'}}>
            {status === "ok" ? "✓ 정답 확인 완료!" : status === "err" ? "✗ 다시 생각해봐!" : "정답 확인"}
          </button>
        </div>
        
        <div className="cf-card" style={{ marginBottom: 16 }}>
          <Explanations card={card} stage={stage} />
        </div>

        <button
          style={{ width: "100%", padding: "16px", borderRadius: 16, background: isClaimed ? "rgba(52,199,89,0.12)" : (status === "ok" ? `linear-gradient(135deg, ${stage.color}, ${stage.color}bb)` : "#8e8e93"), color: isClaimed ? "var(--green)" : "#fff", fontWeight: 800, fontSize: 17, border: "none", cursor: status === "ok" ? "pointer" : "default", boxShadow: isClaimed || status !== "ok" ? "none" : `0 4px 16px ${stage.color}44`, transition: "all 0.3s" }}
          onClick={handleClaim}
          disabled={isClaimed}
        >
          {isClaimed ? `✓ ${card.badge} 획득!` : `🏆 ${card.badge} 획득하기`}
        </button>

        {isLast && isClaimed && (
          <div style={{ marginTop: 24, paddingBottom: 20 }}>
            <button onClick={() => onNavigate("code")} className="ios-btn ios-btn-fill" style={{ width: "100%", background: "var(--blue)", borderRadius: 16, padding: "18px", fontSize: 18, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,122,255,0.25)" }}>
              학습 완료! 코딩 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main LearnPage ── */
export default function LearnPage({ initialStage = 0, initialCard = 0, onBadge, onCorrect, onComplete, onNavigate, onSave, savedItems, onUpdateAnswer, progress, badges }) {
  const [stageIdx, setStageIdx] = useState(initialStage);
  const [cardIdx,  setCardIdx]  = useState(initialCard);
  const [key,      setKey]      = useState(0);
  const [solved,   setSolved]   = useState(false);
  const touchY = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => { 
    setStageIdx(initialStage); 
    setCardIdx(initialCard); 
  }, [initialStage, initialCard]);

  const stage = stages[stageIdx];
  const total = stage.cards.length;
  const card  = stage.cards[cardIdx];

  useEffect(() => {
    if (card.type === "concept") {
      setSolved(true);
    } else if (card.type === "code") {
      const saved = progress.cardAnswers[`${stage.id}-${cardIdx}`];
      if (saved) {
        // We need to check if the saved indices are correct against the STABLE sorted options
        const processedSlots = card.slots.map(s => {
          if (s.fixed || s.options.length <= 1) return s;
          const options = [...s.options].sort();
          const correctVal = s.options[s.correct];
          const newCorrect = options.indexOf(correctVal);
          return { ...s, options, correct: newCorrect };
        });
        const nonFixed = processedSlots.filter(s => !s.fixed);
        const ok = nonFixed.every((s, i) => saved[i] === s.correct);
        setSolved(ok);
      } else {
        setSolved(false);
      }
    } else if (card.type === "project") {
      setSolved(badges.includes(card.badge));
    }
  }, [stageIdx, cardIdx, card.type, progress.cardAnswers, badges, stage.id]);

  const go = (d) => {
    const scrollableContent = scrollRef.current;
    if (d > 0 && scrollableContent) {
      const isAtBottom = scrollableContent.scrollHeight - scrollableContent.scrollTop <= scrollableContent.clientHeight + 1; // 1px tolerance
      if (!isAtBottom) {
        scrollableContent.scrollBy({ top: 200, behavior: 'smooth' });
        return;
      }
    }

    if (d > 0) {
      if (card.type === "code" && !solved) {
        alert("문제를 맞혀야 다음으로 넘어갈 수 있어!");
        return;
      }
      if (card.type === "project" && !badges.includes(card.badge)) {
        alert(`${card.badge}를 획득해야 다음 단계로 넘어갈 수 있어!`);
        return;
      }
    }
    setKey(k => k + 1);
    if (d > 0) {
      if (cardIdx < total - 1)               { setCardIdx(c => c + 1); }
      else if (stageIdx < stages.length - 1) { onComplete?.(stage.id); setStageIdx(s => s + 1); setCardIdx(0); }
      else                                   { onComplete?.(stage.id); }
    } else {
      if (cardIdx > 0)                       { setCardIdx(c => c - 1); }
      else if (stageIdx > 0)                 { setStageIdx(s => s - 1); setCardIdx(stages[stageIdx - 1].cards.length - 1); }
    }
  };

  const onTS = e => { 
    const scrollableContent = scrollRef.current;
    if (scrollableContent && scrollableContent.scrollTop > 0) {
      // If content is scrolled, don't initiate card swipe
      touchY.current = null;
      return;
    }
    touchY.current = e.touches[0].clientY; 
  };
  const onTE = e => {
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 45) go(dy > 0 ? 1 : -1);
    touchY.current = null;
  };

  const onWheel = e => {
    if (isScrolling.current) return;
    if (Math.abs(e.deltaY) < 30) return;
    
    const scrollableContent = scrollRef.current;
    if (scrollableContent) {
      const isAtBottom = scrollableContent.scrollHeight - scrollableContent.scrollTop <= scrollableContent.clientHeight + 1;
      const isAtTop = scrollableContent.scrollTop === 0;

      if (e.deltaY > 0 && !isAtBottom) { // Scrolling down, but not at bottom
        return; // Allow native scroll
      }
      if (e.deltaY < 0 && !isAtTop) { // Scrolling up, but not at top
        return; // Allow native scroll
      }
    }

    isScrolling.current = true;
    go(e.deltaY > 0 ? 1 : -1);
    setTimeout(() => { isScrolling.current = false; }, 600);
  };

  const isFirst = stageIdx === 0 && cardIdx === 0;
  const isLast  = stageIdx === stages.length - 1 && cardIdx === total - 1;
  const scrollRef = useRef(null);

  return (
    <div className="learn-page-container" onTouchStart={onTS} onTouchEnd={onTE} onWheel={onWheel}>
      {/* Unified Nav */}
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group" style={{ gap: 16 }}>
            <span className="cf-logo">easy<b>C</b></span>
            <div className="ios-nav-large-title">학습하기</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--label2)" }}>{cardIdx + 1}/{total}</div>
            <div style={{ width: 60, height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2, marginTop: 4 }}>
              <div style={{ width: `${((cardIdx + 1) / total) * 100}%`, height: "100%", background: stage.color, borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "10px 16px", flexShrink: 0 }}>
        <div className="ios-hscroll"
          onMouseDown={e => { e.currentTarget._isDown = true; e.currentTarget._startX = e.pageX - e.currentTarget.offsetLeft; e.currentTarget._scrollLeft = e.currentTarget.scrollLeft; e.currentTarget.style.cursor = 'grabbing'; }}
          onMouseLeave={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseUp={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseMove={e => { if (!e.currentTarget._isDown) return; e.preventDefault(); const x = e.pageX - e.currentTarget.offsetLeft; const walk = (x - e.currentTarget._startX) * 2; e.currentTarget.scrollLeft = e.currentTarget._scrollLeft - walk; }}
          onWheel={e => { if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }}
          style={{ cursor: 'grab' }}
        >
          {stages.map((st, i) => (
            <button key={st.id} className={`cf-tab ${i === stageIdx ? "active" : "inactive"}`} style={i === stageIdx ? { background: st.color } : {}} onClick={() => { if (i <= stageIdx) { setStageIdx(i); setCardIdx(0); setKey(k => k + 1); } }}>
              {st.emoji} {st.title}
            </button>
          ))}
        </div>
      </div>

      <div key={key} style={{ flex: 1, overflow: "hidden", animation: "iosFadeScale 0.24s ease" }}>
        {card.type === "concept" && <ConceptLearnCard scrollRef={scrollRef} stage={stage} card={card} cardIdx={cardIdx} stageIdx={stageIdx} totalCards={total} onNavigate={onNavigate} isLast={isLast} onSave={onSave} savedItems={savedItems} />}
        {card.type === "code"    && <CodeLearnCard scrollRef={scrollRef} key={`code-${stageIdx}-${cardIdx}`} stage={stage} card={card} cardIdx={cardIdx} stageIdx={stageIdx} totalCards={total} onNavigate={onNavigate} isLast={isLast} onSave={onSave} savedItems={savedItems} onSolvedChange={setSolved} onCorrect={onCorrect} initialAnswer={progress.cardAnswers[`${stage.id}-${cardIdx}`]} onUpdateAnswer={onUpdateAnswer} />}
        {card.type === "project" && <ProjectLearnCard scrollRef={scrollRef} stage={stage} card={card} cardIdx={cardIdx} stageIdx={stageIdx} totalCards={total} onBadge={onBadge} onNavigate={onNavigate} isLast={isLast} onSolvedChange={setSolved} onCorrect={onCorrect} initialAnswer={progress.cardAnswers[`${stage.id}-${cardIdx}`]} onUpdateAnswer={onUpdateAnswer} badges={badges} />}
      </div>

      <div style={{ position: "fixed", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 50 }}>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", opacity: isFirst ? 0.2 : 0.9 }} onClick={() => go(-1)} disabled={isFirst}>↑</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {stage.cards.map((_, i) => (
            <div key={i} style={{ width: 4, height: i === cardIdx ? 16 : 4, borderRadius: 2, background: i === cardIdx ? stage.color : "rgba(0,0,0,0.15)", transition: "all 0.3s" }} />
          ))}
        </div>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", opacity: (card.type === "code" && !solved) || (card.type === "project" && !badges.includes(card.badge)) || isLast ? 0.2 : 0.9 }} onClick={() => go(1)} disabled={isLast}>↓</button>
      </div>
    </div>
  );
}