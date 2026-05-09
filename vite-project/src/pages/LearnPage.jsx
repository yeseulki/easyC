import { useState, useRef, useEffect } from "react";
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

  // Build code lines — replace slot positions with components
  const fullLines = card.fullCode.split("\n");
  const slotsByLine = {};

  // Simple slot insertion: place first non-fixed slots on the key lines
  let slotIdx = 0;
  const nonFixed = card.slots.filter(s => !s.fixed);

  return (
    <div className="cf-code">
      {fullLines.map((line, li) => {
        // Highlight syntax
        const colored = line
          .replace(/\b(int|float|char|void|return|if|else|for|while|include)\b/g, '<kw>$1</kw>')
          .replace(/\b(printf|scanf|malloc|free|sizeof|main)\b/g, '<fn>$1</fn>')
          .replace(/"([^"]*)"/g, '<str>"$1"</str>')
          .replace(/\b(\d+)\b/g, '<num>$1</num>');

        return (
          <div key={li} style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "pre" }}>
            <span style={{ color: "#c7c7cc", minWidth: 22, textAlign: "right", marginRight: 14, fontSize: 11, userSelect: "none", flexShrink: 0 }}>{li + 1}</span>
            <LineWithSlots raw={line} colored={colored} lineIdx={li} card={card} sel={sel} onSel={onSel} color={color} slotColors={slotColors} />
          </div>
        );
      })}
    </div>
  );
}

function LineWithSlots({ raw, lineIdx, card, sel, onSel, color, slotColors }) {
  // Find if any non-fixed slot keyword appears on this line
  const nonFixed = card.slots.filter(s => !s.fixed);

  // Detect which slot values appear on this line
  const parts = [];
  let remaining = raw;

  nonFixed.forEach((slot, si) => {
    const correctVal = slot.options[slot.correct];
    if (remaining.includes(correctVal) && !parts.some(p => p.slotIdx === si)) {
      const idx = remaining.indexOf(correctVal);
      parts.push({ idx, slotIdx: si, val: correctVal, before: remaining.slice(0, idx), after: remaining.slice(idx + correctVal.length) });
    }
  });

  if (parts.length === 0) {
    return <SyntaxLine raw={raw} />;
  }

  const part = parts[0];
  const sc = slotColors[nonFixed.findIndex(s => s === card.slots.filter(x => !x.fixed)[part.slotIdx]) % slotColors.length] || color;

  return (
    <>
      <SyntaxLine raw={part.before} />
      <InlineSlot
        options={card.slots.filter(x => !x.fixed)[part.slotIdx]?.options || [part.val]}
        selected={sel[part.slotIdx] || 0}
        onSelect={v => onSel(part.slotIdx, v)}
        color={sc}
      />
      <SyntaxLine raw={part.after} />
    </>
  );
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
function CodeLearnCard({ stage, card, cardIdx, totalCards }) {
  const nonFixed = card.slots.filter(s => !s.fixed);
  const [sel,    setSel]    = useState(nonFixed.map(() => 0));
  const [status, setStatus] = useState(null); // null | ok | err
  const [likes,  setLikes]  = useState(Math.floor(Math.random() * 5000 + 200));
  const [liked,  setLiked]  = useState(false);
  const [saved,  setSaved]  = useState(false);

  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

  const pick = (i, v) => { const n = [...sel]; n[i] = v; setSel(n); setStatus(null); };

  const check = () => {
    const ok = nonFixed.every((s, i) => sel[i] === s.correct);
    setStatus(ok ? "ok" : "err");
    if (!ok) setTimeout(() => setStatus(null), 1500);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f2f2f7", position: "relative" }}>
      {/* Progress */}
      <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, transition: "width 0.4s" }} />
      </div>

      {/* Stage badge */}
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#f2f2f7" }}>
        <span style={{ fontSize: 18 }}>{stage.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>{stage.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8e8e93" }}>{cardIdx + 1} / {totalCards}</span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Card title */}
        <div style={{ padding: "0 16px 12px", background: "#f2f2f7" }}>
          <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>💻 실습</div>
          <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, lineHeight: 1.3, color: "#000" }}>{card.title}</h2>
          <p style={{ fontSize: 13, color: "#8e8e93", marginTop: 6, lineHeight: 1.6 }}>{card.description}</p>
        </div>

        {/* Code card — CFeed style */}
        <div style={{ margin: "0 16px", position: "relative" }}>
          <div className="cf-card">
            {/* Traffic lights */}
            <div className="cf-dots">
              <div className="cf-dot red" />
              <div className="cf-dot yellow" />
              <div className="cf-dot green" />
            </div>
            {/* Code with inline slots */}
            <CodeWithSlots card={card} color={stage.color} sel={sel} onSel={pick} />
          </div>

          {/* Side actions */}
          <div style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div className="cf-action-btn" onClick={() => { setLiked(l => !l); setLikes(n => liked ? n - 1 : n + 1); }}>
              <div className="cf-action-icon" style={{ color: liked ? "#ff2d55" : "#000" }}>
                {liked ? "❤️" : "🤍"}
              </div>
              <span className="cf-action-label">{(likes / 1000).toFixed(1)}k</span>
            </div>
            <div className="cf-action-btn" onClick={() => setSaved(s => !s)}>
              <div className="cf-action-icon">{saved ? "🔖" : "📌"}</div>
              <span className="cf-action-label">저장</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div style={{ margin: "12px 16px 0" }}>
          <div className="cf-card">
            <Explanations card={card} stage={stage} />
          </div>
        </div>

        {/* Spacer for CTA */}
        <div style={{ height: 100 }} />
      </div>

      {/* Confirm button */}
      <div style={{ position: "sticky", bottom: 0, background: "#f2f2f7", padding: "12px 16px 16px", borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
        <button
          className={`cf-cta ${status === "ok" ? "success" : status === "err" ? "error" : ""}`}
          onClick={check}
          style={{ width: "100%" }}
        >
          {status === "ok" ? "✓ 정답이야! 완벽해!" : status === "err" ? "✗ 다시 생각해봐!" : "확인하기"}
        </button>
      </div>
    </div>
  );
}

/* ── Concept card ── */
function ConceptLearnCard({ stage, card, cardIdx, totalCards }) {
  const [flipped, setFlipped] = useState(false);
  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

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
        <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>📖 개념</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.3, color: "#000", marginBottom: 16, borderLeft: `3px solid ${stage.color}`, paddingLeft: 12 }}>{card.title}</h2>

        {/* Metaphor */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 11, color: stage.color, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>🧠 비유로 이해하기</div>
          <pre style={{ fontFamily: "monospace", fontSize: 13, color: stage.color, lineHeight: 1.85, margin: 0, whiteSpace: "pre-wrap" }}>{card.metaphor}</pre>
        </div>

        {/* Content */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <p style={{ fontSize: 15, color: "#3c3c43", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{card.content}</p>
        </div>

        {/* Tip flip */}
        <div
          style={{ background: flipped ? stage.color + "10" : "#fff", border: `1px solid ${flipped ? stage.color + "44" : "rgba(0,0,0,0.08)"}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.25s", marginBottom: 24 }}
          onClick={() => setFlipped(f => !f)}
        >
          {!flipped
            ? <div style={{ textAlign: "center", color: "#8e8e93", fontSize: 14 }}>💡 탭해서 핵심 팁 보기</div>
            : <div style={{ fontSize: 14, color: stage.color, lineHeight: 1.7, animation: "iosFadeIn 0.2s ease" }}><b>핵심 팁:</b> {card.tip}</div>
          }
        </div>
      </div>
    </div>
  );
}

/* ── Project card ── */
function ProjectLearnCard({ stage, card, cardIdx, totalCards, onBadge }) {
  const [claimed, setClaimed] = useState(false);
  const pct = Math.round(((cardIdx + 1) / totalCards) * 100);

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
          onClick={() => { setClaimed(true); onBadge(card.badge); }}
        >
          {claimed ? `${card.badge} 획득!` : `🏆 ${card.badge} 획득하기`}
        </button>
      </div>
    </div>
  );
}

/* ── Main LearnPage ── */
export default function LearnPage({ initialStage = 0, onBadge, onComplete }) {
  const [stageIdx, setStageIdx] = useState(initialStage);
  const [cardIdx,  setCardIdx]  = useState(0);
  const [key,      setKey]      = useState(0);
  const touchY = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => { setStageIdx(initialStage); setCardIdx(0); }, [initialStage]);

  const stage = stages[stageIdx];
  const total = stage.cards.length;
  const card  = stage.cards[cardIdx];

  const go = (d) => {
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
    
    setTimeout(() => {
      isScrolling.current = false;
    }, 600);
  };

  const isFirst = stageIdx === 0 && cardIdx === 0;
  const isLast  = stageIdx === stages.length - 1 && cardIdx === total - 1;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", paddingBottom: "var(--nav-h)" }}
      onTouchStart={onTS} onTouchEnd={onTE} onWheel={onWheel}>

      {/* Category tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "10px 16px", flexShrink: 0 }}>
        <div className="ios-hscroll">
          {stages.map((st, i) => (
            <button key={st.id} className={`cf-tab ${i === stageIdx ? "active" : "inactive"}`}
              style={i === stageIdx ? { background: st.color } : {}}
              onClick={() => { setStageIdx(i); setCardIdx(0); setKey(k => k + 1); }}>
              {st.emoji} {st.title}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div key={key} style={{ flex: 1, overflow: "hidden", animation: "iosFadeScale 0.24s ease" }}>
        {card.type === "concept" && <ConceptLearnCard stage={stage} card={card} cardIdx={cardIdx} totalCards={total} />}
        {card.type === "code"    && <CodeLearnCard    stage={stage} card={card} cardIdx={cardIdx} totalCards={total} />}
        {card.type === "project" && <ProjectLearnCard stage={stage} card={card} cardIdx={cardIdx} totalCards={total} onBadge={onBadge} />}
      </div>

      {/* Side nav dots */}
      <div style={{ position: "fixed", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 50 }}>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", opacity: isFirst ? 0.2 : 0.9 }}
          onClick={() => go(-1)} disabled={isFirst}>↑</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {stage.cards.map((_, i) => (
            <div key={i} style={{ width: 4, height: i === cardIdx ? 16 : 4, borderRadius: 2, background: i === cardIdx ? stage.color : "rgba(0,0,0,0.15)", transition: "all 0.3s" }} />
          ))}
        </div>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", opacity: isLast ? 0.2 : 0.9 }}
          onClick={() => go(1)} disabled={isLast}>↓</button>
      </div>
    </div>
  );
}
