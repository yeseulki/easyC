import { useState, useRef, useEffect } from "react";
import { stages } from "../data/curriculum";
import SlotCodePicker from "../components/SlotCodePicker";

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

function CodeTypingChallenge({ ch, onSolved, onWrong }) {
  const slots = ch.slots;
  const nonFixedSlots = slots.filter(s => !s.fixed);
  const answers = nonFixedSlots.map(s => s.options[s.correct]);
  const normalize = s => (s || "").trim().replace(/\s+/g, " ");

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

  return (
    <div style={{ position: "relative" }}>
      {confetti.map(c => (
        <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: "20%", width: 8, height: 8, borderRadius: 2, background: c.c, animation: `iosConfetti 0.8s ease ${c.d}s forwards`, pointerEvents: "none", zIndex: 100 }} />
      ))}

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
                <span style={{ fontFamily: "monospace", fontSize: 14, color: "#d4d4d4", display: "flex", alignItems: "center", gap: 0 }}>
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
                          fontFamily: "monospace", fontSize: 13, fontWeight: 700,
                          padding: "1px 8px", outline: "none",
                          width: Math.max(60, (inputs[p.inputIdx].length || p.answer.length) * 9 + 20),
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
          💡 {ch.hints?.[0] || ch.hint || "고정된 슬롯은 이미 맞아. 나머지를 바꿔봐!"}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ flex: 1, padding: "12px 0", background: "rgba(0,0,0,0.06)", color: "#555", borderRadius: 12, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
          onClick={() => setShowHint(h => !h)}>
          {showHint ? "힌트 숨기기" : "💡 힌트"}
        </button>
        <button style={{ flex: 1, padding: "12px 0", background: "rgba(0,0,0,0.06)", color: "#555", borderRadius: 12, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
          onClick={() => { setInputs(answers.map(() => "")); setStatus(null); setInputStatuses([]); setShowHint(false); }}>
          ↩ 초기화
        </button>
        <button style={{ flex: 2, padding: "12px 0", background: status === "ok" ? "#34c759" : "var(--blue)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
          onClick={check}>
          {status === "ok" ? "✓ 정답!" : "확인하기 ✓"}
        </button>
      </div>
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
function QuizView({ current, combo, onSolved, onWrong, onNext, onBack }) {
  // current 먼저 분해 — 아래 useEffect deps에서 format을 사용하기 때문에
  // hooks보다 먼저 선언해야 TDZ 오류 없이 deps가 올바르게 평가됨
  const { card, stage, format } = current;

  const [justSolved, setJustSolved] = useState(false);
  const [answerFlash, setAnswerFlash] = useState(null); // "ok" | "err" | null
  const [comboToast, setComboToast] = useState(null);
  const [exiting, setExiting] = useState(false);
  const touchY = useRef(null);
  const scrollRef = useRef(null);

  // 카드 바뀔 때마다 justSolved, exiting 초기화
  useEffect(() => { setJustSolved(false); setExiting(false); }, [current]);

  // 콤보 마일스톤 토스트
  useEffect(() => {
    const msgs = { 2: "🔥 2연속!", 3: "🔥 3연속!", 5: "⚡ 5연속!!", 10: "🏆 10연속!!!" };
    if (!msgs[combo]) return;
    setComboToast(msgs[combo]);
    const t = setTimeout(() => setComboToast(null), 1300);
    return () => clearTimeout(t);
  }, [combo]);

  // 정답 후 Enter 키로 다음 문제 (토큰 모드만 — 타이핑 모드는 Enter로 정답 제출하므로 충돌 방지)
  useEffect(() => {
    if (!justSolved || format === "typing") return;
    const handler = (e) => { if (e.key === "Enter") handleGoNext(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [justSolved, format]);

  const handleGoNext = () => {
    setExiting(true);
    setTimeout(() => onNext(), 120);
  };

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

  const isScrolling = useRef(false);

  const onTS = e => { touchY.current = e.touches[0].clientY; };
  const onTE = e => {
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    touchY.current = null;
    if (!justSolved || dy < 45) return;
    const sc = scrollRef.current;
    if (sc && sc.scrollHeight - sc.scrollTop > sc.clientHeight + 5) return;
    handleGoNext();
  };
  const onWheel = e => {
    if (!justSolved || e.deltaY <= 0) return;
    if (isScrolling.current) return;
    if (Math.abs(e.deltaY) < 30) return;
    const sc = scrollRef.current;
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
      {comboToast && (
        <div style={{
          position: "fixed", top: "32%", left: "50%", transform: "translateX(-50%)",
          zIndex: 9000, pointerEvents: "none",
          background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)",
          borderRadius: 22, padding: "14px 30px",
          fontSize: 22, fontWeight: 900, color: cc,
          animation: "iosPop 0.35s cubic-bezier(0.2,1,0.2,1)",
          whiteSpace: "nowrap",
          boxShadow: `0 4px 24px ${cc}44`,
        }}>
          {comboToast}
        </div>
      )}

      {/* 상단 바 — 3등분 그리드로 콤보 항상 정중앙 */}
      <div style={{ padding: "12px 20px", background: "#fff", borderBottom: "0.5px solid var(--sep)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
        <button style={{ background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 14, fontWeight: 600, color: "#3c3c43", cursor: "pointer", justifySelf: "start" }}
          onClick={onBack}>← 나가기</button>

        <div style={{ display: "flex", justifyContent: "center", opacity: exiting ? 0 : 1, transition: "opacity 0.15s ease" }}>
          {combo >= 2 && (
            <div key={combo} style={{
              fontSize: 14, fontWeight: 800, color: cc,
              background: cc + "1a",
              padding: "5px 14px", borderRadius: 100,
              animation: "iosPop 0.3s ease",
              boxShadow: `0 0 10px ${cc}33`,
              whiteSpace: "nowrap",
            }}>
              🔥 {combo}연속
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, color: "var(--label3)", fontWeight: 600, justifySelf: "end" }}>
          {format === "typing" ? "⌨️ 타이핑" : "🎰 토큰"}
        </div>
      </div>

      {/* 콘텐츠 — 다음 문제 이동 시 슬라이드아웃 */}
      <div ref={scrollRef} className="page" style={{ padding: "16px 20px var(--nav-h)", animation: exiting ? "cardSlideOutUp 0.12s ease forwards" : undefined }}>
        {/* 스테이지 뱃지 + 제목 */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: stage.color + "15", color: stage.color, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100, marginBottom: 10 }}>
            {stage.emoji} {stage.title}
          </span>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.5, color: "var(--label)", marginBottom: 6 }}>{card.title}</div>
          <div style={{ fontSize: 14, color: "var(--label2)", lineHeight: 1.6 }}>{card.description}</div>
        </div>

        {/* 출력 결과 */}
        {card.expectedOutput && <Terminal expectedOutput={card.expectedOutput} />}

        {/* 문제 형식 */}
        {format === "typing" ? (
          <CodeTypingChallenge
            key={card.title}
            ch={card}
            onSolved={handleSolvedInner}
            onWrong={handleWrongInner}
          />
        ) : (
          <SlotCodePicker
            key={card.title}
            slots={card.slots}
            color={stage.color}
            hint={card.hints?.[0] || card.hint}
            onResult={(ok) => { if (ok) handleSolvedInner(); else handleWrongInner(); }}
          />
        )}

        {/* 정답 후 스와이프 안내 */}
        {justSolved && (
          <div style={{ textAlign: "center", marginTop: 20, animation: "iosFadeIn 0.4s ease" }}>
            <div style={{ fontSize: 22, marginBottom: 6, opacity: 0.5 }}>↑</div>
            <div style={{ fontSize: 13, color: "var(--label3)", fontWeight: 600 }}>위로 스와이프해서 다음 문제</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 메인 ── */
export default function CodePage({ onCorrect, onNavigate, progress, onCardChange }) {
  const completedStages = progress?.completedStages || [];

  // mode/current/combo를 하나의 state로 묶어 atomic하게 업데이트 (다시 풀기 버그 방지)
  const [qs, setQs] = useState({ mode: "home", current: null, combo: 0 });
  const { mode, current, combo } = qs;

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
    setQs({ mode: "quiz", current: { ...p, format: fmt }, combo: 0 });
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
    const picked = pickRandom(completedStages, solved, current?.card.title);
    if (!picked) { setQs(s => ({ ...s, mode: "home", current: null })); return; }
    if (picked === "all_cleared") { setQs(s => ({ ...s, mode: "cleared" })); return; }
    setQs(s => ({ ...s, current: picked }));
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
    setQs({ mode: "quiz", current: { ...picked, format }, combo: 0 });
  };

  const handleBack = () => setQs(s => ({ ...s, mode: "home", current: null }));

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
      <div key={current.card.title} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)", animation: "cardSlideInUp 0.22s cubic-bezier(0.2,0,0,1)" }}>
        <QuizView
          current={current}
          combo={combo}
          solved={solved}
          onSolved={handleSolved}
          onWrong={handleWrong}
          onNext={handleNext}
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
