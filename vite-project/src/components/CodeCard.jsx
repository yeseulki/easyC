import { useState } from "react";
import SlotCodePicker from "./SlotCodePicker";

function colorize(line) {
  return line
    .replace(/\b(int|float|char|void|return|if|else|for|while|include|stdio\.h|stdlib\.h)\b/g, '<span class="t-kw">$1</span>')
    .replace(/\b(printf|scanf|malloc|free|sizeof|main)\b/g, '<span class="t-fn">$1</span>')
    .replace(/"([^"]*)"/g, '<span class="t-str">"$1"</span>')
    .replace(/\b(\d+)\b/g, '<span class="t-num">$1</span>')
    .replace(/\/\/(.*)/g, '<span class="t-cmt">// $1</span>');
}

function CodeViewer({ code }) {
  return (
    <div className="ios-code" style={{ maxHeight: 200, overflow: "auto" }}>
      {code.split("\n").map((line, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <span style={{ color: "#3d4451", minWidth: 18, textAlign: "right", userSelect: "none", fontSize: 11 }}>{i + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: colorize(line) }} />
        </div>
      ))}
    </div>
  );
}

export default function CodeCard({ card, color, onDrC }) {
  const [tab,     setTab]     = useState("slot");
  const [output,  setOutput]  = useState("");
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true); setOutput("");
    setTimeout(() => { setOutput(card.expectedOutput); setRunning(false); }, 700);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 14, color: "var(--ios-label2)", lineHeight: 1.7, marginBottom: 16 }}>{card.description}</p>

      {/* Segment */}
      <div className="ios-segment" style={{ marginBottom: 18 }}>
        {[["slot", "🎰 슬롯 코딩"], ["full", "📄 전체 코드"]].map(([id, label]) => (
          <button key={id} className={`ios-seg-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "slot" && (
        <div style={{ animation: "iosFadeScale 0.22s ease" }}>
          <SlotCodePicker slots={card.slots} color={color} onResult={ok => !ok && onDrC?.("wrongSlot")} />
        </div>
      )}

      {tab === "full" && (
        <div style={{ animation: "iosFadeScale 0.22s ease" }}>
          <CodeViewer code={card.fullCode} />
          <button
            className="ios-btn"
            style={{ width: "100%", marginTop: 12, marginBottom: 10, borderRadius: 14, background: running ? "var(--fill3)" : `linear-gradient(135deg,${color},${color}99)`, color: "#fff" }}
            onClick={run}
            disabled={running}
          >
            {running ? "⏳ 실행 중..." : "▶ 실행하기"}
          </button>
          {output && (
            <div style={{ background: "#0d1117", border: "0.5px solid rgba(48,209,88,0.25)", borderRadius: 12, padding: "12px 14px", animation: "iosFadeScale 0.25s ease" }}>
              <div style={{ fontSize: 11, color: "var(--ios-label3)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>출력</div>
              <pre style={{ fontFamily: "monospace", color: "var(--ios-green)", fontSize: 14 }}>{output}</pre>
            </div>
          )}
        </div>
      )}

      <button
        className="ios-btn ios-btn-tint"
        style={{ width: "100%", marginTop: 16, borderRadius: 14, fontSize: 14 }}
        onClick={() => onDrC?.("wrongSlot")}
      >
        🤖 Dr. C에게 도움 요청
      </button>
    </div>
  );
}
