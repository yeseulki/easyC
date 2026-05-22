import { useState, useRef } from "react";
import { stages } from "../data/curriculum";

const CHALLENGES = stages.flatMap(st =>
  st.cards.filter(c => c.type === "code").map(c => ({
    ...c, stageTitle: st.title, stageEmoji: st.emoji, color: st.color, stageId: st.id,
  }))
);

/* ── 코드 라인을 구문 강조 ── */
function SyntaxSpan({ text }) {
  const html = text
    .replace(/\b(int|float|char|void|return|if|else|for|while|include|stdio\.h|stdlib\.h)\b/g, "<span style='color:#569cd6'>$1</span>")
    .replace(/\b(printf|scanf|malloc|free|sizeof|main)\b/g, "<span style='color:#dcdcaa'>$1</span>")
    .replace(/"([^"]*)"/g, "<span style='color:#ce9178'>\"$1\"</span>")
    .replace(/\b(\d+(\.\d+)?)\b/g, "<span style='color:#b5cea8'>$1</span>")
    .replace(/\/\/(.*)/g, "<span style='color:#6a9955'>// $1</span>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── fullCode를 파싱해서 슬롯 위치에 Input 렌더링 ── */
function buildLineParts(line, slots) {
  // fixed 슬롯은 이미 코드에 표시되어 있으므로, non-fixed 슬롯만 입력 대상으로 처리
  const inputSlots = slots
    .map((s, origIdx) => ({ s, origIdx }))
    .filter(({ s }) => !s.fixed)
    .map((t, inputIdx) => ({
      inputIdx,
      val: t.s.options[t.s.correct],
    }));

  const positions = [];
  inputSlots.forEach(t => {
    const val = t.val;
    const isAlpha = /^[a-zA-Z_]/.test(val);
    const isWordChar = ch => ch !== undefined && /[a-zA-Z0-9_]/.test(ch);
    let start = 0;
    while (true) {
      const pos = line.indexOf(val, start);
      if (pos === -1) break;
      const before = line[pos - 1];
      const after = line[pos + val.length];
      if (isAlpha && (isWordChar(before) || isWordChar(after))) { start = pos + 1; continue; }
      if (!positions.some(p => p.pos === pos)) {
        positions.push({ pos, len: val.length, inputIdx: t.inputIdx, answer: val });
      }
      start = pos + val.length;
      break;
    }
  });

  positions.sort((a, b) => a.pos - b.pos);

  const parts = [];
  let cur = 0;
  for (const p of positions) {
    if (p.pos > cur) parts.push({ type: "text", content: line.slice(cur, p.pos) });
    parts.push({ type: "input", inputIdx: p.inputIdx, answer: p.answer });
    cur = p.pos + p.len;
  }
  if (cur < line.length) parts.push({ type: "text", content: line.slice(cur) });
  return parts;
}

function CodeTypingChallenge({ ch, onSolved, onCorrect, onBecameSolved, savedInputs, onSave }) {
  const slots = ch.slots;
  // fixed 슬롯은 이미 코드에 보여지므로 non-fixed 슬롯만 입력 대상
  const nonFixedSlots = slots.filter(s => !s.fixed);
  const answers = nonFixedSlots.map(s => s.options[s.correct]);
  const normalize = s => (s || "").trim().replace(/\s+/g, " ");
  const isAlreadySolved = savedInputs && savedInputs.length === answers.length &&
    answers.every((ans, i) => normalize(savedInputs[i]) === normalize(ans));

  const [inputs, setInputs] = useState(
    savedInputs && savedInputs.length === answers.length ? savedInputs : answers.map(() => "")
  );
  const [status, setStatus] = useState(isAlreadySolved ? "ok" : null);
  const [showHint, setShowHint] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const refs = useRef([]);

  const lines = ch.fullCode.split("\n");

  const handleInput = (inputIdx, val) => {
    const n = [...inputs];
    n[inputIdx] = val;
    setInputs(n);
    setStatus(null);
    onSave?.(n);
  };

  const check = () => {
    if (status === "ok") { onSolved?.(); return; }
    const ok = answers.every((ans, i) => normalize(inputs[i]) === normalize(ans));
    setStatus(ok ? "ok" : "err");
    if (ok) {
      onSave?.(inputs);
      onBecameSolved?.();
      const items = Array.from({ length: 18 }, (_, i) => ({
        id: i, x: Math.random() * 100,
        c: ["#007aff","#af52de","#ff9500","#34c759","#ff2d55"][i % 5],
        d: Math.random() * 0.3,
      }));
      setConfetti(items);
      setTimeout(() => setConfetti([]), 1100);
      onCorrect?.();
    } else {
      setTimeout(() => setStatus(null), 1500);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {confetti.map(c => (
        <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "20%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
      ))}

      {/* 코드 에디터 */}
      <div style={{ background: "#1c1c1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "8px 14px", background: "#2c2c2e", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: "#8e8e93", fontFamily: "monospace" }}>challenge.c</span>
        </div>
        <div style={{ overflowX: "auto", padding: "14px 0 14px" }}>
          {lines.map((line, li) => {
            const parts = buildLineParts(line, slots);
            const lineNum = String(li + 1).padStart(2, " ");
            return (
              <div key={li} style={{ display: "flex", alignItems: "center", whiteSpace: "pre", minWidth: "max-content", padding: "0 14px", lineHeight: "2" }}>
                <span style={{ color: "#4a4a50", fontFamily: "monospace", fontSize: 11, minWidth: 24, marginRight: 14, userSelect: "none", flexShrink: 0 }}>{lineNum}</span>
                <span style={{ fontFamily: "monospace", fontSize: 14, display: "flex", alignItems: "center", gap: 0 }}>
                  {parts.map((p, pi) =>
                    p.type === "text"
                      ? <SyntaxSpan key={pi} text={p.content} />
                      : (
                        <input
                          key={pi}
                          ref={el => refs.current[p.inputIdx] = el}
                          value={inputs[p.inputIdx]}
                          onChange={e => handleInput(p.inputIdx, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              const next = refs.current.findIndex((r, i) => i > p.inputIdx && r);
                              if (next !== -1) refs.current[next]?.focus();
                              else check();
                            }
                          }}
                          spellCheck={false}
                          placeholder={`빈칸 ${p.inputIdx + 1}`}
                          style={{
                            background: status === "ok" ? "rgba(52,199,89,0.18)" : status === "err" ? "rgba(255,59,48,0.18)" : "rgba(0,122,255,0.2)",
                            border: `1.5px solid ${status === "ok" ? "rgba(52,199,89,0.6)" : status === "err" ? "rgba(255,59,48,0.6)" : "rgba(0,122,255,0.5)"}`,
                            borderRadius: 6,
                            color: status === "ok" ? "#30d158" : status === "err" ? "#ff453a" : "#60a5fa",
                            fontFamily: "monospace",
                            fontSize: 13,
                            fontWeight: 700,
                            padding: "1px 8px",
                            outline: "none",
                            width: Math.max(60, (inputs[p.inputIdx].length || p.answer.length) * 9 + 20),
                            caretColor: "#60a5fa",
                            transition: "all 0.2s",
                          }}
                        />
                      )
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 피드백 */}
      {status === "ok" && (
        <div style={{ padding: "10px 14px", background: "rgba(52,199,89,0.1)", border: "0.5px solid rgba(52,199,89,0.3)", borderRadius: 12, fontSize: 14, color: "#30d158", textAlign: "center", marginBottom: 12, fontWeight: 700, animation: "iosPop 0.35s ease" }}>
          🎉 완벽해! 정답이야!
        </div>
      )}
      {status === "err" && (
        <div style={{ padding: "10px 14px", background: "rgba(255,59,48,0.06)", border: "0.5px solid rgba(255,59,48,0.2)", borderRadius: 12, fontSize: 14, color: "#ff453a", textAlign: "center", marginBottom: 12, animation: "iosShake 0.4s ease" }}>
          🤔 틀렸어! 다시 확인해봐.
        </div>
      )}
      {showHint && (
        <div style={{ padding: "10px 14px", background: "rgba(88,86,214,0.08)", border: "0.5px solid rgba(88,86,214,0.2)", borderRadius: 12, fontSize: 13, color: "#7c7cff", marginBottom: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>
          💡 {ch.hint}
        </div>
      )}

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{ flex: 1, padding: "12px 0", background: "rgba(0,0,0,0.06)", color: "#555", borderRadius: 12, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
          onClick={() => setShowHint(h => !h)}
        >
          {showHint ? "힌트 숨기기" : "💡 힌트"}
        </button>
        <button
          style={{ flex: 1, padding: "12px 0", background: "rgba(0,0,0,0.06)", color: "#555", borderRadius: 12, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
          onClick={() => { setInputs(slots.map(() => "")); setStatus(null); setShowHint(false); }}
        >
          ↩ 초기화
        </button>
        <button
          style={{ flex: 2, padding: "12px 0", background: status === "ok" ? "rgba(118,118,128,0.16)" : ch.color, color: status === "ok" ? "#3c3c43" : "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: status === "ok" ? "none" : `0 4px 14px ${ch.color}44` }}
          onClick={check}
        >
          {status === "ok" ? "닫기" : "확인하기 ✓"}
        </button>
      </div>
    </div>
  );
}

function Terminal({ expectedOutput }) {
  return (
    <div style={{ background: "#1c1c1e", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "8px 14px", background: "#2c2c2e", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: "#8e8e93", fontFamily: "monospace" }}>output</span>
      </div>
      <div style={{ padding: "12px 16px 14px" }}>
        <div style={{ fontSize: 11, color: "#636366", fontFamily: "monospace", marginBottom: 6 }}>$ ./program</div>
        <pre style={{ fontFamily: "monospace", fontSize: 13, color: "#30d158", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
          {expectedOutput}
        </pre>
      </div>
    </div>
  );
}

function SolveSheet({ ch, onClose, onSolved, onCorrect, savedInputs, onSaveInputs, alreadySolved }) {
  // useRef로 최신 solved 상태를 항상 참조해 클로저 stale 문제 방지
  const solvedNowRef = useRef(false);
  const [sheetHeight] = useState(() => `${Math.floor(window.innerHeight * 0.96)}px`);

  const handleNext = (e) => {
    e?.stopPropagation();
    if (solvedNowRef.current && !alreadySolved) {
      onSolved();
    } else {
      onClose();
    }
  };

  return (
    <div className="ios-sheet-bg" onClick={handleNext}>
      <div className="ios-sheet" style={{ height: sheetHeight }} onClick={e => e.stopPropagation()}>
        <div className="ios-sheet-handle" />

        {/* 헤더 */}
        <div style={{ padding: "4px 20px 16px", borderBottom: "0.5px solid var(--sep2)" }}>
          <span className="ios-badge" style={{ background: ch.color + "15", color: ch.color, display: "inline-flex", marginBottom: 10 }}>
            {ch.stageEmoji} {ch.stageTitle}
          </span>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.5, color: "var(--label)", marginBottom: 6 }}>{ch.title}</div>
          <div style={{ fontSize: 14, color: "var(--label2)", lineHeight: 1.6 }}>{ch.description}</div>
        </div>

        {/* 출력 결과 */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--label3)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>출력 결과</div>
          <Terminal expectedOutput={ch.expectedOutput} />
        </div>

        {/* 타이핑 챌린지 */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--label3)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>빈칸을 직접 입력해봐</div>
          <CodeTypingChallenge
            ch={ch}
            savedInputs={savedInputs}
            onSave={onSaveInputs}
            onBecameSolved={() => { solvedNowRef.current = true; }}
            onSolved={() => { if (!alreadySolved) onSolved(); }}
            onCorrect={onCorrect}
          />
        </div>

        <div style={{ padding: "12px 20px 4px" }}>
          <button
            style={{ width: "100%", padding: "14px 0", background: "#34c759", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 17, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(52,199,89,0.35)" }}
            onClick={handleNext}
          >다음으로</button>
        </div>
      </div>
    </div>
  );
}

function ChallengeRow({ ch, onSelect, solved }) {
  return (
    <div className="ios-cell" style={{ cursor: "pointer" }} onClick={() => onSelect(ch)}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: ch.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {solved ? "✅" : ch.stageEmoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--label)" }}>{ch.title}</div>
        <div style={{ fontSize: 12, color: "var(--label2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ch.stageTitle} · 빈칸 {ch.slots.filter(s => !s.fixed).length}개
        </div>
      </div>
      {solved
        ? <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 700 }}>완료</span>
        : <span className="ios-chevron">›</span>
      }
    </div>
  );
}

export default function CodePage({ onCorrect, onNavigate }) {
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [solved,   setSolved]   = useState(() => {
    const saved = localStorage.getItem("easycCodeSolved");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  // 챌린지별 입력 답안 저장: { [title]: string[] }
  const [challengeInputs, setChallengeInputs] = useState(() => {
    const saved = localStorage.getItem("easycCodeInputs");
    return saved ? JSON.parse(saved) : {};
  });

  const markSolved = (title) => {
    setSolved(prev => {
      const next = new Set([...prev, title]);
      localStorage.setItem("easycCodeSolved", JSON.stringify([...next]));
      return next;
    });
  };

  const saveInputs = (title, inputs) => {
    setChallengeInputs(prev => {
      const next = { ...prev, [title]: inputs };
      localStorage.setItem("easycCodeInputs", JSON.stringify(next));
      return next;
    });
  };

  const filtered = filter === "all" ? CHALLENGES : CHALLENGES.filter(c => `${c.stageId}` === filter);
  const grouped  = stages.map(st => ({ stage: st, items: filtered.filter(c => c.stageId === st.id) })).filter(g => g.items.length > 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)" }}>
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group" style={{ gap: 16 }}>
            <span className="cf-logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>easy<b>C</b></span>
            <div className="ios-nav-large-title">코딩 챌린지</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--label2)" }}>{solved.size}/{CHALLENGES.length}</div>
            <div style={{ width: 60, height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2, marginTop: 4 }}>
              <div style={{ width: `${(solved.size / CHALLENGES.length) * 100}%`, height: "100%", background: "var(--blue)", borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <div className="ios-segment"
          onMouseDown={e => { e.currentTarget._isDown = true; e.currentTarget._startX = e.pageX - e.currentTarget.offsetLeft; e.currentTarget._scrollLeft = e.currentTarget.scrollLeft; e.currentTarget.style.cursor = 'grabbing'; }}
          onMouseLeave={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseUp={e => { e.currentTarget._isDown = false; e.currentTarget.style.cursor = 'grab'; }}
          onMouseMove={e => { if (!e.currentTarget._isDown) return; e.preventDefault(); const x = e.pageX - e.currentTarget.offsetLeft; const walk = (x - e.currentTarget._startX) * 2; e.currentTarget.scrollLeft = e.currentTarget._scrollLeft - walk; }}
          onWheel={e => { if (e.deltaY !== 0) { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; } }}
        >
          <button className={`ios-seg-item ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>전체</button>
          {stages.map(st => (
            <button key={st.id} className={`ios-seg-item ${filter === `${st.id}` ? "active" : ""}`} onClick={() => setFilter(`${st.id}`)}>
              {st.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="page" style={{ padding: "16px 20px var(--nav-h)" }}>
        {grouped.map(({ stage, items }) => (
          <div key={stage.id} style={{ marginBottom: 24 }}>
            <div className="ios-subsection-title">{stage.emoji} {stage.title}</div>
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {items.map(ch => <ChallengeRow key={ch.title} ch={ch} onSelect={setSelected} solved={solved.has(ch.title)} />)}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <SolveSheet
          ch={selected}
          onClose={() => setSelected(null)}
          onSolved={() => { markSolved(selected.title); setSelected(null); }}
          onCorrect={onCorrect}
          savedInputs={challengeInputs[selected.title]}
          onSaveInputs={(inputs) => saveInputs(selected.title, inputs)}
          alreadySolved={solved.has(selected.title)}
        />
      )}
    </div>
  );
}
