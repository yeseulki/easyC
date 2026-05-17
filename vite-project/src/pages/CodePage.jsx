import { useState } from "react";
import { stages } from "../data/curriculum";
import SlotCodePicker from "../components/SlotCodePicker";

const CHALLENGES = stages.flatMap(st =>
  st.cards.filter(c => c.type === "code").map(c => ({
    ...c, stageTitle: st.title, stageEmoji: st.emoji, color: st.color, stageId: st.id,
  }))
);

function ChallengeRow({ ch, onSelect, solved }) {
  return (
    <div className="ios-cell" style={{ cursor: "pointer" }} onClick={() => onSelect(ch)}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: ch.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {solved ? "✅" : ch.stageEmoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--label)" }}>{ch.title}</div>
        <div style={{ fontSize: 12, color: "var(--label2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ch.stageTitle} · 슬롯 {ch.slots.length}개
        </div>
      </div>
      {solved
        ? <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 700 }}>완료</span>
        : <span className="ios-chevron">›</span>
      }
    </div>
  );
}

function SolveSheet({ ch, onClose, onSolved, onCorrect }) {
  return (
    <div className="ios-sheet-bg" onClick={onClose}>
      <div className="ios-sheet" onClick={e => e.stopPropagation()}>
        <div className="ios-sheet-handle" />
        <div style={{ padding: "0 20px 16px", borderBottom: "0.5px solid var(--sep2)" }}>
          <span className="ios-badge" style={{ background: ch.color + "15", color: ch.color, display: "inline-flex", marginBottom: 10 }}>
            {ch.stageEmoji} {ch.stageTitle}
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: "var(--label)", marginBottom: 6 }}>{ch.title}</div>
          <div style={{ fontSize: 14, color: "var(--label2)", lineHeight: 1.65 }}>{ch.description}</div>
        </div>
        <div style={{ padding: "20px 20px 0" }}>
          <SlotCodePicker slots={ch.slots} color={ch.color} hint={ch.hint} onResult={ok => { if (ok) { setTimeout(onSolved, 700); onCorrect?.(); } }} />
        </div>
        <div style={{ margin: "16px 20px 0" }}>
          <div style={{ fontSize: 12, color: "var(--label3)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>도움말 (힌트)</div>
          <div style={{ background: ch.color + "10", borderRadius: 12, padding: "12px 14px", border: `1px dashed ${ch.color}44` }}>
            <span style={{ color: "var(--label)", fontSize: 14, lineHeight: 1.5 }}>{ch.hint}</span>
          </div>
        </div>
        <div style={{ margin: "16px 20px 0" }}>
          <div style={{ fontSize: 12, color: "var(--label3)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>예상 출력</div>
          <div style={{ background: "#1c1c1e", borderRadius: 12, padding: "12px 14px" }}>
            <span style={{ fontFamily: "monospace", color: "#30d158", fontSize: 14 }}>{ch.expectedOutput}</span>
          </div>
        </div>
        <div style={{ padding: "16px 20px 0" }}>
          <button className="ios-btn ios-btn-gray" style={{ width: "100%", borderRadius: 14 }} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default function CodePage({ onCorrect }) {
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [solved,   setSolved]   = useState(new Set());

  const filtered = filter === "all" ? CHALLENGES : CHALLENGES.filter(c => `${c.stageId}` === filter);
  const grouped  = stages.map(st => ({ stage: st, items: filtered.filter(c => c.stageId === st.id) })).filter(g => g.items.length > 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)" }}>
      {/* Nav */}
      <div className="ios-nav">
        <div className="ios-nav-row">
          <div className="ios-nav-title-group" style={{ gap: 16 }}>
            <span className="cf-logo">easy<b>C</b></span>
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

      {/* Filter Card - Simplified */}
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

      {/* List */}
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
        <SolveSheet ch={selected} onClose={() => setSelected(null)} onSolved={() => { setSolved(s => new Set([...s, selected.title])); setSelected(null); }} onCorrect={onCorrect} />
      )}
    </div>
  );
}
