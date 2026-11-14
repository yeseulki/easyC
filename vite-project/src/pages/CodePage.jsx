import { useState, useRef, useEffect } from "react";
import { stages } from "../data/curriculum";
import SlotCodePicker from "../components/SlotCodePicker";
import { useIsWide, splitGrid, wideSide } from "../hooks/useIsWide";
import { useKeydown, isTypingTarget, isButtonTarget } from "../hooks/useKeydown";

// useSlotPlaceholders 카드는 제외 (fullCode가 __SLOT__ 형식이라 타이핑/토큰 모두 불가)
const ALL_CODE_CARDS = stages.flatMap(st =>
  st.cards
    .filter(c => c.type === "code" && !c.useSlotPlaceholders)
    .map(c => ({ card: c, stage: st }))
);

/* ── 구문 강조 ── */
function SyntaxSpan({ text }) {
  const html = text
    .replace(/\b(int|float|char|void|return|if|else|for|while|include|stdio\.h|stdlib\.h)\b/g, "<span style='color:#569cd6'>$1</span>")
    .replace(/\b(printf|scanf|malloc|free|sizeof|main)\b/g, "<span style='color:#dcdcaa'>$1</span>")
    .replace(/"([^"]*)"/g, "<span style='color:#ce9178'>\"$1\"</span>")
    .replace(/\b(\d+(\.\d+)?)\b/g, "<span style='color:#b5cea8'>$1</span>")
    .replace(/\/\/(.*)/g, "<span style='color:#6a9955'>// $1</span>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── fullCode에서 슬롯 위치에 Input 렌더링 ── */
function buildLineParts(line, slots) {
  const inputSlots = slots
    .map((s, origIdx) => ({ s, origIdx }))
    .filter(({ s }) => !s.fixed)
    .map((t, inputIdx) => ({ inputIdx, val: t.s.options[t.s.correct] }));

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

/* 코딩 탭 글자·칸 크기 — 가로 화면에선 조금 크게 해서 아래 빈 공간을 채움 (세로는 기존 값 그대로) */
const SIZE = {
  normal: { code: 14, lineH: "2", lineNum: 11, input: 13, charW: 9, codePad: 14, termText: 13, termLineH: 1.8, termPrompt: 11, termPad: "12px 16px 14px", btnPad: "12px 0", btnFont: 14, btnMain: 15, msg: 14, hint: 13, msgPad: "10px 14px" },
  wide:   { code: 16, lineH: "2.4", lineNum: 12.5, input: 15, charW: 10.5, codePad: 20, termText: 15, termLineH: 2, termPrompt: 12.5, termPad: "16px 18px 18px", btnPad: "15px 0", btnFont: 15.5, btnMain: 16.5, msg: 15.5, hint: 14.5, msgPad: "12px 16px" },
};

function Terminal({ expectedOutput, wide = false }) {
  const sz = wide ? SIZE.wide : SIZE.normal;
  return (
    <div className="code-window" style={{ background: "#1c1c1e", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "8px 14px", background: "#2c2c2e", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: "#8e8e93", fontFamily: "monospace" }}>output</span>
      </div>
      <div style={{ padding: sz.termPad }}>
        <div style={{ fontSize: sz.termPrompt, color: "#636366", fontFamily: "monospace", marginBottom: 6 }}>$ ./program</div>
        <pre style={{ fontFamily: "monospace", fontSize: sz.termText, color: "#30d158", lineHeight: sz.termLineH, margin: 0, whiteSpace: "pre-wrap" }}>
          {expectedOutput}
        </pre>
      </div>
    </div>
  );
}

function CodeTypingChallenge({ ch, onSolved, onWrong, wide = false, asideTop = null, asideBottom = null }) {
  const slots = ch.slots;
  const nonFixedSlots = slots.filter(s => !s.fixed);
  const answers = nonFixedSlots.map(s => s.options[s.correct]);
  const normalize = s => (s || "").trim().replace(/\s+/g, " ");
  const sz = wide ? SIZE.wide : SIZE.normal;

  const [inputs, setInputs] = useState(answers.map(() => ""));
  const [status, setStatus] = useState(null);
  const [inputStatuses, setInputStatuses] = useState([]); // 칸별 "ok"/"err"
  const [showHint, setShowHint] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const refs = useRef([]);

  const lines = ch.fullCode.split("\n");

  const handleInput = (inputIdx, val) => {
    const n = [...inputs]; n[inputIdx] = val;
    setInputs(n); setStatus(null); setInputStatuses([]);
  };

  const check = () => {
    if (status === "ok") return;
    const statuses = answers.map((ans, i) => normalize(inputs[i]) === normalize(ans) ? "ok" : "err");
    setInputStatuses(statuses);
    const ok = statuses.every(s => s === "ok");
    setStatus(ok ? "ok" : "err");
    if (ok) {
      const items = Array.from({ length: 18 }, (_, i) => ({
        id: i, x: Math.random() * 100,
        c: ["#007aff","#af52de","#ff9500","#34c759","#ff2d55"][i % 5],
        d: Math.random() * 0.3,
      }));
      setConfetti(items);
      setTimeout(() => setConfetti([]), 1100);
      onSolved?.();
    } else {
      onWrong?.();
      setTimeout(() => setStatus(null), 1500);
    }
  };

  useKeydown(e => {
    if (e.key !== "Enter" || e.repeat || isTypingTarget(e) || isButtonTarget(e)) return;
    if (status === "ok") return;
    e.preventDefault();
    check();
  });

  const confettiEls = confetti.map(c => (
    <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "20%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
  ));

  // 문제(코드) 부분 — code-window: 가로 화면에서 점 줄은 위에 두고 코드만 세로 가운데
  const codeArea = (
      <div className="code-window" style={{ background: "#1c1c1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "8px 14px", background: "#2c2c2e", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: "#8e8e93", fontFamily: "monospace" }}>challenge.c</span>
        </div>
        <div style={{ overflowX: "auto", padding: `${sz.codePad}px 0` }}>
          {lines.map((line, li) => {
            const parts = buildLineParts(line, slots);
            const lineNum = String(li + 1).padStart(2, " ");
            return (
              <div key={li} style={{ display: "flex", alignItems: "center", whiteSpace: "pre", minWidth: "max-content", padding: "0 14px", lineHeight: sz.lineH }}>
                <span style={{ color: "#4a4a50", fontFamily: "monospace", fontSize: sz.lineNum, minWidth: 24, marginRight: 14, userSelect: "none", flexShrink: 0 }}>{lineNum}</span>
                <span style={{ fontFamily: "monospace", fontSize: sz.code, color: "#d4d4d4", display: "flex", alignItems: "center", gap: 0 }}>
                  {parts.map((p, pi) => {
                    if (p.type === "text") return <SyntaxSpan key={pi} text={p.content} />;
                    const is = inputStatuses[p.inputIdx] ?? null;
                    return (
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
                          background: is === "ok" ? "rgba(52,199,89,0.18)" : is === "err" ? "rgba(255,59,48,0.18)" : "rgba(0,122,255,0.2)",
                          border: `1.5px solid ${is === "ok" ? "rgba(52,199,89,0.6)" : is === "err" ? "rgba(255,59,48,0.6)" : "rgba(0,122,255,0.5)"}`,
                          borderRadius: 6, color: is === "ok" ? "#30d158" : is === "err" ? "#ff453a" : "#60a5fa",
                          fontFamily: "monospace", fontSize: sz.input, fontWeight: 700,
                          padding: "1px 8px", outline: "none",
                          width: Math.max(60, (inputs[p.inputIdx].length || p.answer.length) * sz.charW + 20),
                          caretColor: "#60a5fa", transition: "all 0.2s",
                        }}
                      />
                    );
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
  );

  // 정답 메시지
  const okMsg = (
    <div style={{ padding: sz.msgPad, background: "rgba(52,199,89,0.1)", border: "0.5px solid rgba(52,199,89,0.3)", borderRadius: 12, fontSize: sz.msg, color: "#30d158", textAlign: "center", marginBottom: 12, fontWeight: 700, animation: "iosPop 0.35s ease" }}>
      🎉 완벽해! 정답이야!
    </div>
  );

  // 정답/오답 메시지 + 힌트 — 가로 화면에선 2단 아래에 전체 폭으로 (wide-msgs)
  const feedback = (
    <>
      {status === "ok" && okMsg}
      {status === "err" && (
        <div style={{ padding: sz.msgPad, background: "rgba(255,59,48,0.06)", border: "0.5px solid rgba(255,59,48,0.2)", borderRadius: 12, fontSize: sz.msg, color: "#ff453a", textAlign: "center", marginBottom: 12, animation: "iosShake 0.4s ease" }}>
          🤔 틀렸어! 다시 확인해봐.
        </div>
      )}
      {showHint && (
        <div style={{ padding: sz.msgPad, background: "rgba(88,86,214,0.08)", border: "0.5px solid rgba(88,86,214,0.2)", borderRadius: 12, fontSize: sz.hint, color: "#7c7cff", marginBottom: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>
          💡 {ch.hints?.[0] || ch.hint || "고정된 슬롯은 이미 맞아. 나머지를 바꿔봐!"}
        </div>
      )}
    </>
  );

  const buttons = (
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ flex: 1, padding: sz.btnPad, background: "rgba(0,0,0,0.06)", color: "#555", borderRadius: 12, fontWeight: 600, fontSize: sz.btnFont, border: "none", cursor: "pointer" }}
          onClick={() => setShowHint(h => !h)}>
          {showHint ? "힌트 숨기기" : "💡 힌트"}
        </button>
        <button style={{ flex: 1, padding: sz.btnPad, background: "rgba(0,0,0,0.06)", color: "#555", borderRadius: 12, fontWeight: 600, fontSize: sz.btnFont, border: "none", cursor: "pointer" }}
          onClick={() => { setInputs(answers.map(() => "")); setStatus(null); setInputStatuses([]); setShowHint(false); }}>
          ↩ 초기화
        </button>
        <button style={{ flex: 2, padding: sz.btnPad, background: status === "ok" ? "#34c759" : "var(--blue)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: sz.btnMain, border: "none", cursor: "pointer" }}
          onClick={check}>
          {status === "ok" ? "✓ 정답!" : "확인하기 ✓"}
        </button>
      </div>
  );

  // 가로 화면: 왼쪽 = 코드 / 오른쪽 = asideTop(출력 결과) → 버튼(아래 끝)
  // 그 아래 전체 폭으로 정답·오답·힌트, 마지막에 asideBottom(스와이프 안내) 가운데
  if (wide) {
    return (
      <>
        <div style={{ position: "relative", ...splitGrid }}>
          {confettiEls}
          <div className="split-col grow-last">{codeArea}</div>
          <div className="split-col">
            {asideTop}
            <div style={{ flex: 1 }} />
            {buttons}
          </div>
        </div>
        <div className="wide-msgs">{feedback}</div>
        {asideBottom}
      </>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {confettiEls}
      {codeArea}
      {feedback}
      {buttons}
    </div>
  );
}

/* ── 랜덤 문제 선택 ── */
// allCleared: true면 이미 다 풀었을 때 순환용 (다음 문제 버튼 누를 때만)
function pickRandom(completedStages, solved, currentTitle, allowLoop = false) {
  const pool = ALL_CODE_CARDS.filter(c => completedStages.includes(c.stage.id));
  if (pool.length === 0) return null;
  const uncleared = pool.filter(c => !solved.has(c.card.title) && c.card.title !== currentTitle);
  if (uncleared.length === 0 && !allowLoop) return "all_cleared"; // 모두 풀었음
  const candidates = uncleared.length > 0 ? uncleared : pool.filter(c => c.card.title !== currentTitle);
  const target = candidates.length > 0 ? candidates : pool;
  const picked = target[Math.floor(Math.random() * target.length)];
  const format = picked.card.tokenOnly ? "token" : (Math.random() < 0.5 ? "typing" : "token");
  return { ...picked, format };
}

/* ── 콤보 색상 ── */
function comboColor(combo) {
  if (combo >= 10) return "#ff2d55";
  if (combo >= 5)  return "#af52de";
  if (combo >= 3)  return "#ff9500";
  return "#ffcc00";
}

/* ── 퀴즈 화면 ── */
function QuizView({ current, combo, onSolved, onWrong, onNext, onPrev, canPrev, onBack }) {
  // current 먼저 분해 — 아래 useEffect deps에서 format을 사용하기 때문에
  // hooks보다 먼저 선언해야 TDZ 오류 없이 deps가 올바르게 평가됨
  const { card, stage, format } = current;
  const isWide = useIsWide();

  // 전 문제로 돌아온 경우 이미 푼 문제면 바로 다음으로 넘어갈 수 있게 (wasSolved)
  const [justSolved, setJustSolved] = useState(!!current.wasSolved);
  const exitDir = useRef(1); // 1=다음(위로 퇴장), -1=이전(아래로 퇴장)
  const [answerFlash, setAnswerFlash] = useState(null); // "ok" | "err" | null
  const [comboToast, setComboToast] = useState(null);
  const [comboFading, setComboFading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const touchY = useRef(null);
  const scrollRef = useRef(null);

  // 카드 바뀔 때마다 justSolved, exiting 초기화
  useEffect(() => { setJustSolved(!!current.wasSolved); setExiting(false); }, [current]);

  // 콤보 마일스톤 토스트 — 이 문제에서 콤보가 새로 올라갔을 때만 (다음 문제로 넘어가 화면이 새로 그려질 땐 다시 안 띄움)
  const mountCombo = useRef(combo);
  useEffect(() => {
    const msgs = { 2: "🔥 2연속!", 3: "🔥 3연속!", 5: "⚡ 5연속!!", 10: "🏆 10연속!!!" };
    if (combo === mountCombo.current) return;
    if (!msgs[combo]) return;
    // "성공!" 토스트(App.jsx showToast)와 똑같이: 2초 보여주고 → 사라지는 효과 → 0.45초 뒤 제거
    setComboFading(false);
    setComboToast(msgs[combo]);
    const t1 = setTimeout(() => setComboFading(true), 2000);
    const t2 = setTimeout(() => { setComboToast(null); setComboFading(false); }, 2450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [combo]);

  // 정답 후 Enter 키로 다음 문제 (토큰 모드만 — 타이핑 모드는 Enter로 정답 제출하므로 충돌 방지)
  useEffect(() => {
    if (!justSolved || format === "typing") return;
    const handler = (e) => { if (e.key === "Enter") handleGoNext(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [justSolved, format]);

  const handleGoNext = () => {
    exitDir.current = 1;
    setExiting(true);
    setTimeout(() => onNext(), 120);
  };

  // 전 문제로 — 지금 문제를 풀었는지도 같이 넘겨서, 다시 앞으로 올 때 그대로 유지
  const handleGoPrev = () => {
    if (!canPrev) return;
    exitDir.current = -1;
    setExiting(true);
    setTimeout(() => onPrev(justSolved), 120);
  };

  // ↑/↓ 키 → 전 문제 / 다음 문제 (스와이프와 같음, 입력 중엔 제외)
  useKeydown(e => {
    if (e.repeat || isTypingTarget(e) || exiting) return;
    if (e.key === "ArrowDown") { e.preventDefault(); if (justSolved) handleGoNext(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); handleGoPrev(); }
  });

  const handleSolvedInner = () => {
    if (justSolved) return;
    setJustSolved(true);
    setAnswerFlash("ok");
    setTimeout(() => setAnswerFlash(null), 600);
    onSolved();
  };

  const handleWrongInner = () => {
    setAnswerFlash("err");
    setTimeout(() => setAnswerFlash(null), 400);
    onWrong();
  };

  const cc = comboColor(combo);

  const terminalEl = card.expectedOutput ? <Terminal expectedOutput={card.expectedOutput} wide={isWide} /> : null;
  const swipeGuideEl = justSolved ? (
    <div style={{ textAlign: "center", marginTop: isWide ? 32 : 20, animation: "iosFadeIn 0.4s ease" }}>
      <div style={{ fontSize: 22, marginBottom: 6, opacity: 0.5 }}>↑</div>
      <div style={{ fontSize: 13, color: "var(--label3)", fontWeight: 600 }}>위로 스와이프해서 다음 문제</div>
    </div>
  ) : null;

  const isScrolling = useRef(false);

  const onTS = e => { touchY.current = e.touches[0].clientY; };
  const onTE = e => {
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    touchY.current = null;
    const sc = scrollRef.current;
    // 아래로 스와이프(맨 위에서) → 전 문제
    if (dy < -45) {
      if (sc && sc.scrollTop > 5) return;
      handleGoPrev();
      return;
    }
    if (!justSolved || dy < 45) return;
    if (sc && sc.scrollHeight - sc.scrollTop > sc.clientHeight + 5) return;
    handleGoNext();
  };
  const onWheel = e => {
    if (isScrolling.current) return;
    if (Math.abs(e.deltaY) < 30) return;
    const sc = scrollRef.current;
    if (e.deltaY < 0) {
      // 위로 휠(맨 위에서) → 전 문제
      if (!canPrev || (sc && sc.scrollTop > 5)) return;
      isScrolling.current = true;
      handleGoPrev();
      setTimeout(() => { isScrolling.current = false; }, 600);
      return;
    }
    if (!justSolved) return;
    if (sc && sc.scrollHeight - sc.scrollTop > sc.clientHeight + 5) return;
    isScrolling.current = true;
    handleGoNext();
    setTimeout(() => { isScrolling.current = false; }, 600);
  };

  return (
    <div onTouchStart={onTS} onTouchEnd={onTE} onWheel={onWheel} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* 정답/오답 플래시 오버레이 */}
      {answerFlash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500, pointerEvents: "none",
          background: answerFlash === "ok" ? "rgba(52,199,89,0.18)" : "rgba(255,59,48,0.14)",
          animation: "flashFade 0.5s ease forwards",
        }} />
      )}

      {/* 콤보 마일스톤 토스트 */}
      {/* 가운데 정렬은 바깥 div(flex)가, 튀는 애니메이션은 안쪽 div가 담당 — 애니메이션의 transform이 가운데 정렬을 덮어쓰지 않게 */}
      {comboToast && (
        <div style={{ position: "fixed", top: isWide ? "26%" : "32%", left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9000, pointerEvents: "none" }}>
          <div style={{
            background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)",
            borderRadius: 22, padding: "14px 30px",
            fontSize: 22, fontWeight: 900, color: cc,
            animation: comboFading ? "iosToastOut 0.1s ease forwards" : "iosPop 0.35s cubic-bezier(0.2,1,0.2,1)",
            whiteSpace: "nowrap",
            boxShadow: `0 4px 24px ${cc}44`,
          }}>
            {comboToast}
          </div>
        </div>
      )}

      {/* 콘텐츠 — 다음 문제 이동 시 슬라이드아웃 */}
      <div ref={scrollRef} className="page" style={{ padding: isWide ? "40px 20px 40px" : "16px 20px var(--nav-h)", ...wideSide(isWide, 20), animation: exiting ? `${exitDir.current < 0 ? "cardSlideOutDown" : "cardSlideOutUp"} 0.12s ease forwards` : undefined }}>
        {/* 스테이지 뱃지 · 콤보 · 문제 형식 + 오른쪽 위 작은 나가기 버튼 (상단 바 없앰) */}
        <div style={{ marginBottom: isWide ? 48 : 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isWide ? 14 : 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: stage.color + "15", color: stage.color, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>
              {stage.emoji} {stage.title}
            </span>
            {combo >= 2 && (
              <span key={combo} style={{
                fontSize: 12, fontWeight: 800, color: cc,
                background: cc + "1a",
                padding: "4px 10px", borderRadius: 100,
                animation: combo !== mountCombo.current ? "iosPop 0.3s ease" : "none", // 넘어온 직후엔 안 튐
                boxShadow: `0 0 10px ${cc}33`,
                whiteSpace: "nowrap",
              }}>
                🔥 {combo}연속
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--label3)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {format === "typing" ? "⌨️ 타이핑" : "🎰 토큰"}
            </span>
            <button style={{ marginLeft: "auto", background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#3c3c43", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={onBack}>나가기</button>
          </div>
          <div style={{ fontSize: isWide ? 22 : 19, fontWeight: 800, letterSpacing: -0.5, color: "var(--label)", marginBottom: 6 }}>{card.title}</div>
          <div style={{ fontSize: isWide ? 15.5 : 14, color: "var(--label2)", lineHeight: 1.6 }}>{card.description}</div>
        </div>

        {/* 출력 결과 — 가로 화면에선 오른쪽 열 맨 위 */}
        {!isWide && terminalEl}

        {/* 문제 형식 — 가로 화면에선 왼쪽 코드 / 오른쪽 출력·메시지·힌트·버튼 */}
        {format === "typing" ? (
          <CodeTypingChallenge
            key={card.title}
            ch={card}
            onSolved={handleSolvedInner}
            onWrong={handleWrongInner}
            wide={isWide}
            asideTop={terminalEl}
            asideBottom={swipeGuideEl}
          />
        ) : (
          <SlotCodePicker
            key={card.title}
            slots={card.slots}
            color={stage.color}
            hint={card.hints?.[0] || card.hint}
            onResult={(ok) => { if (ok) handleSolvedInner(); else handleWrongInner(); }}
            wide={isWide}
            enterToCheck
            gridStyle={splitGrid}
            asideTop={terminalEl}
            asideBottom={swipeGuideEl}
          />
        )}

        {/* 정답 후 스와이프 안내 — 가로 화면에선 오른쪽 열 맨 아래 */}
        {!isWide && swipeGuideEl}
      </div>
    </div>
  );
}

/* ── 메인 ── */
export default function CodePage({ onCorrect, onNavigate, progress, onCardChange }) {
  const completedStages = progress?.completedStages || [];

  // mode/current/combo를 하나의 state로 묶어 atomic하게 업데이트 (다시 풀기 버그 방지)
  // history: 지나온 문제들, forward: 전 문제로 돌아갔을 때 다시 앞으로 갈 문제들, dir: 카드 진입 방향(1=아래에서 위, -1=위에서 아래)
  const [qs, setQs] = useState({ mode: "home", current: null, combo: 0, history: [], forward: [], dir: 1 });
  const { mode, current, combo, history, dir } = qs;

  const [solved, setSolved] = useState(() => {
    const saved = localStorage.getItem("easycCodeSolved");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const pool = ALL_CODE_CARDS.filter(c => completedStages.includes(c.stage.id));
  const poolSolvedCount = pool.filter(c => solved.has(c.card.title)).length;

  const markSolved = (title) => {
    setSolved(prev => {
      const next = new Set([...prev, title]);
      localStorage.setItem("easycCodeSolved", JSON.stringify([...next]));
      return next;
    });
  };

  const startQuiz = () => {
    if (pool.length === 0) return;
    // 다 풀었으면 solved 초기화 후 처음부터 다시
    const needsReset = solved.size >= pool.length;
    if (needsReset) {
      setSolved(new Set());
      localStorage.setItem("easycCodeSolved", JSON.stringify([]));
    }
    const effectiveSolved = needsReset ? new Set() : solved;
    const candidates = pool.filter(c => !effectiveSolved.has(c.card.title));
    const target = candidates.length > 0 ? candidates : pool;
    const p = target[Math.floor(Math.random() * target.length)];
    const fmt = p.card.tokenOnly ? "token" : (Math.random() < 0.5 ? "typing" : "token");
    setQs({ mode: "quiz", current: { ...p, format: fmt }, combo: 0, history: [], forward: [], dir: 1 });
  };

  const handleSolved = () => {
    if (!current) return;
    markSolved(current.card.title);
    setQs(s => ({ ...s, combo: s.combo + 1 }));
    onCorrect?.();
  };

  const handleWrong = () => setQs(s => ({ ...s, combo: 0 }));

  const handleNext = () => {
    onCardChange?.();
    // 전 문제로 돌아갔다가 다시 앞으로 가는 거면, 원래 보던 문제로 돌아감
    if (qs.forward.length > 0) {
      setQs(s => {
        const fwd = [...s.forward];
        const nextCur = fwd.pop();
        return { ...s, current: nextCur, forward: fwd, history: [...s.history, { ...s.current, wasSolved: true }], dir: 1 };
      });
      return;
    }
    const picked = pickRandom(completedStages, solved, current?.card.title);
    if (!picked) { setQs(s => ({ ...s, mode: "home", current: null })); return; }
    if (picked === "all_cleared") { setQs(s => ({ ...s, mode: "cleared" })); return; }
    setQs(s => ({ ...s, current: picked, history: [...s.history, { ...s.current, wasSolved: true }], dir: 1 }));
  };

  // 전 문제로 (curSolved: 지금 보던 문제를 풀었는지 — 다시 앞으로 올 때 유지)
  const handlePrev = (curSolved) => {
    if (history.length === 0) return;
    onCardChange?.();
    setQs(s => {
      const hist = [...s.history];
      const prev = hist.pop();
      return { ...s, current: prev, history: hist, forward: [...s.forward, { ...s.current, wasSolved: curSolved }], dir: -1 };
    });
  };

  const handleLoopAgain = () => {
    // solved 초기화 → 전체 문제 다시 처음부터
    const emptySolved = new Set();
    setSolved(emptySolved);
    localStorage.setItem("easycCodeSolved", JSON.stringify([]));
    const availablePool = ALL_CODE_CARDS.filter(c => completedStages.includes(c.stage.id));
    if (availablePool.length === 0) return;
    const picked = availablePool[Math.floor(Math.random() * availablePool.length)];
    const format = picked.card.tokenOnly ? "token" : (Math.random() < 0.5 ? "typing" : "token");
    setQs({ mode: "quiz", current: { ...picked, format }, combo: 0, history: [], forward: [], dir: 1 });
  };

  const handleBack = () => setQs(s => ({ ...s, mode: "home", current: null, history: [], forward: [] }));

  if (mode === "cleared") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)", animation: "iosFadeIn 0.3s ease" }}>
        <div className="ios-nav">
          <div className="ios-nav-row">
            <div className="ios-nav-title-group" style={{ gap: 16 }}>
              <span className="cf-logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>easy<b>C</b></span>
              <div className="ios-nav-large-title">코딩 챌린지</div>
            </div>
          </div>
        </div>
        <div className="page" style={{ padding: "60px 20px var(--nav-h)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center" }}>
          <div style={{ fontSize: 64, animation: "iosBounce 1.2s ease infinite" }}>🏆</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: "var(--label)" }}>다 풀었어!</div>
          <div style={{ fontSize: 15, color: "var(--label2)", lineHeight: 1.7 }}>
            배운 개념 문제를 모두 맞혔어.<br />한 번 더 돌아볼래?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button
              style={{ width: "100%", padding: "15px 0", background: "var(--blue)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,122,255,0.3)" }}
              onClick={handleLoopAgain}
            >
              🔄 다시 풀기
            </button>
            <button
              style={{ width: "100%", padding: "15px 0", background: "rgba(0,0,0,0.06)", color: "var(--label)", borderRadius: 14, fontWeight: 600, fontSize: 16, border: "none", cursor: "pointer" }}
              onClick={() => setQs(s => ({ ...s, mode: "home", current: null }))}
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "quiz" && current) {
    return (
      <div key={current.card.title} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)", animation: `${dir < 0 ? "cardSlideInDown" : "cardSlideInUp"} 0.22s cubic-bezier(0.2,0,0,1)` }}>
        <QuizView
          current={current}
          combo={combo}
          solved={solved}
          onSolved={handleSolved}
          onWrong={handleWrong}
          onNext={handleNext}
          onPrev={handlePrev}
          canPrev={history.length > 0}
          onBack={handleBack}
        />
      </div>
    );
  }

  const hasPool = pool.length > 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)" }}>
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group" style={{ gap: 16 }}>
            <span className="cf-logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>easy<b>C</b></span>
            <div className="ios-nav-large-title">코딩 챌린지</div>
          </div>
          {hasPool && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--label2)" }}>{poolSolvedCount}/{pool.length}</div>
              <div style={{ width: 60, height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: `${pool.length > 0 ? (poolSolvedCount / pool.length) * 100 : 0}%`, height: "100%", background: "var(--blue)", borderRadius: 2 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page" style={{ padding: "32px 20px var(--nav-h)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        {hasPool ? (
          <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎲</div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: "var(--label)", marginBottom: 8 }}>랜덤 코딩 챌린지</div>
              <div style={{ fontSize: 15, color: "var(--label2)", lineHeight: 1.7 }}>
                지금까지 배운 개념을<br />랜덤으로 테스트해봐!
              </div>
            </div>

            <div style={{ width: "100%", background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "var(--label)", marginBottom: 10 }}>
                <span>풀었던 문제</span>
                <span style={{ color: "var(--blue)" }}>{poolSolvedCount} / {pool.length}</span>
              </div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pool.length > 0 ? (poolSolvedCount / pool.length) * 100 : 0}%`, background: "var(--blue)", borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--label3)" }}>
                {stages.filter(s => completedStages.includes(s.id)).map(s => s.emoji).join("  ")} 챕터 기준
              </div>
            </div>

            <button
              style={{ width: "100%", padding: "16px 0", background: "var(--blue)", color: "#fff", borderRadius: 16, fontWeight: 800, fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,122,255,0.3)" }}
              onClick={startQuiz}
            >
              🎲 랜덤 문제 시작
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📚</div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: "var(--label)", marginBottom: 8 }}>아직 완료한 챕터가 없어</div>
              <div style={{ fontSize: 15, color: "var(--label2)", lineHeight: 1.7 }}>
                학습탭에서 챕터를 먼저 완료하면<br />여기서 테스트할 수 있어!
              </div>
            </div>
            <button
              style={{ padding: "14px 32px", background: "var(--blue)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}
              onClick={() => onNavigate("learn")}
            >
              학습하러 가기 →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
