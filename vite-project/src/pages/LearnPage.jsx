import { useState, useRef, useEffect, useMemo } from "react";
import { stages } from "../data/curriculum";

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
function CodeWithSlots({ card, color, sel, onSel }) {
  const slotColors = ["#007aff", "#af52de", "#ff9500", "#34c759", "#30b0c7"];
  const fullLines = card.fullCode.split("\n");

  return (
    <div className="cf-code">
      {fullLines.map((line, li) => {
        return (
          <div key={li} style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "pre" }}>
            <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none", flexShrink: 0 }}>{li + 1}</span>
            <LineWithSlots raw={line} card={card} sel={sel} onSel={onSel} color={color} slotColors={slotColors} />
          </div>
        );
      })}
    </div>
  );
}

function LineWithSlots({ raw, card, sel, onSel, color, slotColors }) {
  const nonFixed = card.slots.filter(s => !s.fixed);
  const foundSlots = [];
  
  // Find all non-fixed slots in this line
  nonFixed.forEach((slot, si) => {
    const correctVal = slot.options[slot.correct];
    let startIdx = 0;
    while (true) {
      const idx = raw.indexOf(correctVal, startIdx);
      if (idx === -1) break;
      
      // Ensure we don't pick the same occurrence twice
      if (!foundSlots.some(f => f.idx === idx)) {
        foundSlots.push({ idx, si, val: correctVal });
      }
      startIdx = idx + correctVal.length;
    }
  });

  // Sort slots by their position in the line
  foundSlots.sort((a, b) => a.idx - b.idx);

  if (foundSlots.length === 0) {
    return <SyntaxLine raw={raw} />;
  }

  const elements = [];
  let currentPos = 0;

  foundSlots.forEach((found, i) => {
    // Text before slot
    if (found.idx > currentPos) {
      elements.push(<SyntaxLine key={`text-${i}`} raw={raw.slice(currentPos, found.idx)} />);
    }
    
    // The slot itself
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

  // Remaining text after last slot
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
    `${card.title}에 대해 배워보자!`,
    `이 코드는 ${stage.subtitle} 개념을 사용해.`,
    `예상 출력: ${card.expectedOutput}`,
    card.hint,
  ].filter(Boolean);

  return (
    <div className="cf-explain">
      {bullets.map((b, i) => (
        <div key={i} className="cf-explain-item">
          <span style={{ fontSize: 16, flexShrink: 0 }}>{EXPLAIN_ICONS[i] || "•"}</span>
          <span>{b}</span>
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
function CodeLearnCard({ stage, card, cardIdx, totalCards, onNavigate, isLast, onSave, savedItems, onSolvedChange }) {
  const isSaved = savedItems?.some(i => i.title === card.title);
  const processedSlots = useMemo(() => {
    return card.slots.map(s => {
      if (s.fixed || s.options.length <= 1) return s;
      const options = [...s.options];
      const correctVal = options[s.correct];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      const newCorrect = options.indexOf(correctVal);
      return { ...s, options, correct: newCorrect };
    });
  }, [card.slots]);

  const processedCard = { ...card, slots: processedSlots };
  const nonFixed = processedSlots.filter(s => !s.fixed);
  const [sel,    setSel]    = useState(nonFixed.map(() => 0));
  const [status, setStatus] = useState(null); // null | ok | err
  const [likes,  setLikes]  = useState(Math.floor(Math.random() * 5000 + 200));
  const [liked,  setLiked]  = useState(false);

  useEffect(() => {
    setSel(nonFixed.map(() => 0));
    setStatus(null);
  }, [processedSlots]);

  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);
  const pick = (i, v) => { const n = [...sel]; n[i] = v; setSel(n); setStatus(null); };

  const check = () => {
    const ok = nonFixed.every((s, i) => sel[i] === s.correct);
    setStatus(ok ? "ok" : "err");
    if (ok) {
      onSolvedChange?.(true);
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
      <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, transition: "width 0.4s" }} />
      </div>

      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#f2f2f7" }}>
        <span style={{ fontSize: 18 }}>{stage.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>{stage.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8e8e93" }}>{cardIdx + 1} / {totalCards}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "0 16px 12px", background: "#f2f2f7", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>💻 실습</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, lineHeight: 1.3, color: "#000" }}>{card.title}</h2>
            <p style={{ fontSize: 13, color: "#8e8e93", marginTop: 6, lineHeight: 1.6 }}>{card.description}</p>
          </div>
          <div className="cf-action-btn" onClick={() => onSave?.(card)} style={{ marginTop: 10 }}>
            <div className="cf-action-icon" style={{ width: 38, height: 38, fontSize: 18, color: isSaved ? stage.color : "#000" }}>{isSaved ? "🔖" : "📌"}</div>
          </div>
        </div>

        <div style={{ margin: "0 16px", position: "relative" }}>
          <div className="cf-card">
            <div className="cf-dots"><div className="cf-dot red" /><div className="cf-dot yellow" /><div className="cf-dot green" /></div>
            <CodeWithSlots card={processedCard} color={stage.color} sel={sel} onSel={pick} />
          </div>
          <div style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div className="cf-action-btn" onClick={() => { setLiked(l => !l); setLikes(n => liked ? n - 1 : n + 1); }}>
              <div className="cf-action-icon" style={{ color: liked ? "#ff2d55" : "#000" }}>{liked ? "❤️" : "🤍"}</div>
              <span className="cf-action-label">{(likes / 1000).toFixed(1)}k</span>
            </div>
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

      <div style={{ position: "sticky", bottom: 0, background: "#f2f2f7", padding: "12px 16px 16px", borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
        <button className={`cf-cta ${status === "ok" ? "success" : status === "err" ? "error" : ""}`} onClick={check} style={{ width: "100%" }}>
          {status === "ok" ? "✓ 정답이야! 완벽해!" : status === "err" ? "✗ 다시 생각해봐!" : "확인하기"}
        </button>
      </div>
    </div>
  );
}

/* ── Concept card ── */
function ConceptLearnCard({ stage, card, cardIdx, totalCards, onNavigate, isLast, onSave, savedItems }) {
  const [flipped, setFlipped] = useState(false);
  const isSaved = savedItems?.some(i => i.title === card.title);
  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

  const handleNavigate = () => {
    onNavigate("code");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>📖 개념</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.3, color: "#000", marginBottom: 16, borderLeft: `3px solid ${stage.color}`, paddingLeft: 12 }}>{card.title}</h2>
          </div>
          <div className="cf-action-btn" onClick={() => onSave?.(card)} style={{ marginTop: 4 }}>
            <div className="cf-action-icon" style={{ width: 38, height: 38, fontSize: 18, color: isSaved ? stage.color : "#000" }}>{isSaved ? "🔖" : "📌"}</div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>🧠 비유로 이해하기</div>
          <pre style={{ fontFamily: "monospace", fontSize: 13, color: stage.color, lineHeight: 1.85, margin: 0, whiteSpace: "pre-wrap" }}>{card.metaphor}</pre>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <p style={{ fontSize: 15, color: "#3c3c43", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{card.content}</p>
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

/* ── Project card ── */
function ProjectLearnCard({ stage, card, cardIdx, totalCards, onBadge, onNavigate, isLast, onSolvedChange }) {
  const [claimed, setClaimed] = useState(false);
  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

  const handleNavigate = () => {
    onNavigate("code");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>🚀 프로젝트</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.3, color: "#000", marginBottom: 10 }}>{card.title}</h2>
        <p style={{ fontSize: 14, color: "#8e8e93", lineHeight: 1.7, marginBottom: 16 }}>{card.description}</p>

        <div style={{ margin: "0 0 16px" }}>
          <div className="cf-card">
            <div className="cf-dots"><div className="cf-dot red" /><div className="cf-dot yellow" /><div className="cf-dot green" /></div>
            <div className="ios-code" style={{ borderRadius: 0, maxHeight: 240, overflow: "auto" }}>
              {card.example.split("\n").map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: "#4d5566", minWidth: 18, textAlign: "right", userSelect: "none", fontSize: 11, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ color: "#abb2bf" }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          style={{ width: "100%", padding: "16px", borderRadius: 16, background: claimed ? "rgba(52,199,89,0.12)" : `linear-gradient(135deg, ${stage.color}, ${stage.color}bb)`, color: claimed ? "var(--green)" : "#fff", fontWeight: 800, fontSize: 17, border: "none", cursor: "pointer", boxShadow: claimed ? "none" : `0 4px 16px ${stage.color}44`, transition: "all 0.3s" }}
          onClick={() => { setClaimed(true); onBadge(card.badge); onSolvedChange?.(true); }}
        >
          {claimed ? `${card.badge} 획득!` : `🏆 ${card.badge} 획득하기`}
        </button>

        {isLast && claimed && (
          <div style={{ marginTop: 24, paddingBottom: 20 }}>
            <button onClick={handleNavigate} className="ios-btn ios-btn-fill" style={{ width: "100%", background: "var(--blue)", borderRadius: 16, padding: "18px", fontSize: 18, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,122,255,0.25)" }}>
              학습 완료! 코딩 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main LearnPage ── */
export default function LearnPage({ initialStage = 0, onBadge, onComplete, onNavigate, onSave, savedItems }) {
  const [stageIdx, setStageIdx] = useState(initialStage);
  const [cardIdx,  setCardIdx]  = useState(0);
  const [key,      setKey]      = useState(0);
  const [solved,   setSolved]   = useState(false);
  const touchY = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => { setStageIdx(initialStage); setCardIdx(0); }, [initialStage]);

  const stage = stages[stageIdx];
  const total = stage.cards.length;
  const card  = stage.cards[cardIdx];

  // Robust auto-solve logic for non-quiz cards
  useEffect(() => {
    if (card.type !== "code") {
      setSolved(true);
    } else {
      setSolved(false);
    }
  }, [stageIdx, cardIdx, card.type]);

  const go = (d) => {
    if (d > 0 && card.type === "code" && !solved) {
      alert("문제를 맞혀야 다음으로 넘어갈 수 있어! 💪");
      return;
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

  const onTS = e => { touchY.current = e.touches[0].clientY; };
  const onTE = e => {
    if (!touchY.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 45) go(dy > 0 ? 1 : -1);
    touchY.current = null;
  };

  const onWheel = e => {
    if (isScrolling.current) return;
    if (Math.abs(e.deltaY) < 30) return;
    isScrolling.current = true;
    go(e.deltaY > 0 ? 1 : -1);
    setTimeout(() => { isScrolling.current = false; }, 600);
  };

  const isFirst = stageIdx === 0 && cardIdx === 0;
  const isLast  = stageIdx === stages.length - 1 && cardIdx === total - 1;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", paddingBottom: "var(--nav-h)" }} onTouchStart={onTS} onTouchEnd={onTE} onWheel={onWheel}>
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "10px 16px", flexShrink: 0 }}>
        <div className="ios-hscroll">
          {stages.map((st, i) => (
            <button key={st.id} className={`cf-tab ${i === stageIdx ? "active" : "inactive"}`} style={i === stageIdx ? { background: st.color } : {}} onClick={() => { if (i <= stageIdx) { setStageIdx(i); setCardIdx(0); setKey(k => k + 1); } }}>
              {st.emoji} {st.title}
            </button>
          ))}
        </div>
      </div>

      <div key={key} style={{ flex: 1, overflow: "hidden", animation: "iosFadeScale 0.24s ease" }}>
        {card.type === "concept" && <ConceptLearnCard stage={stage} card={card} cardIdx={cardIdx} totalCards={total} onNavigate={onNavigate} isLast={isLast} onSave={onSave} savedItems={savedItems} />}
        {card.type === "code"    && <CodeLearnCard key={`code-${stageIdx}-${cardIdx}`} stage={stage} card={card} cardIdx={cardIdx} totalCards={total} onNavigate={onNavigate} isLast={isLast} onSave={onSave} savedItems={savedItems} onSolvedChange={setSolved} />}
        {card.type === "project" && <ProjectLearnCard stage={stage} card={card} cardIdx={cardIdx} totalCards={total} onBadge={onBadge} onNavigate={onNavigate} isLast={isLast} onSolvedChange={setSolved} />}
      </div>

      <div style={{ position: "fixed", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 50 }}>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", opacity: isFirst ? 0.2 : 0.9 }} onClick={() => go(-1)} disabled={isFirst}>↑</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {stage.cards.map((_, i) => (
            <div key={i} style={{ width: 4, height: i === cardIdx ? 16 : 4, borderRadius: 2, background: i === cardIdx ? stage.color : "rgba(0,0,0,0.15)", transition: "all 0.3s" }} />
          ))}
        </div>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", opacity: (card.type === "code" && !solved) || isLast ? 0.2 : 0.9 }} onClick={() => go(1)} disabled={isLast}>↓</button>
      </div>
    </div>
  );
}
