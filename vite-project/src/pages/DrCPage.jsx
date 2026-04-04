import { useState, useRef, useEffect } from "react";
import { drCResponses } from "../data/curriculum";

const QUICK = ["세미콜론이 뭐야?", "포인터 설명해줘", "배열 범위 오류?", "malloc이 뭐야?", "for문 어떻게 써?"];
const INTRO = { id: 0, from: "dr", text: "안녕! 나는 Dr. C야 🤖\n막히는 게 있으면 뭐든 물어봐!\n정답은 바로 안 알려주지만, 함께 생각해볼게 😊", hint: "세미콜론, 포인터, 배열… 궁금한 거 다 물어봐!" };

function kw(t) {
  const l = t.toLowerCase();
  if (l.includes(";") || l.includes("세미콜론")) return "semicolon";
  if (l.includes("배열") || l.includes("범위") || l.includes("[")) return "arrayOutOfBounds";
  if (l.includes("포인터") || l.includes("ptr") || l.includes("*") || l.includes("주소")) return "uninitializedPointer";
  if (l.includes("맞") || l.includes("성공") || l.includes("고마")) return "correct";
  return "wrongSlot";
}

function Bubble({ msg, animate }) {
  const isDr = msg.from === "dr";
  return (
    <div style={{ display: "flex", gap: 10, flexDirection: isDr ? "row" : "row-reverse", marginBottom: 10, animation: animate ? "iosFadeScale 0.22s ease" : "none" }}>
      {isDr && (
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#007aff,#5856d6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🤖</div>
      )}
      <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", gap: 5, alignItems: isDr ? "flex-start" : "flex-end" }}>
        <div style={{
          padding: "10px 14px",
          borderRadius: isDr ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          background: isDr ? "#e9e9eb" : "var(--blue)",
          fontSize: 15, lineHeight: 1.55,
          color: isDr ? "#000" : "#fff",
          whiteSpace: "pre-wrap",
          boxShadow: isDr ? "none" : "0 2px 10px rgba(0,122,255,0.3)",
        }}>
          {msg.text}
        </div>
        {msg.hint && (
          <div style={{ padding: "7px 12px", background: "rgba(88,86,214,0.08)", border: "0.5px solid rgba(88,86,214,0.2)", borderRadius: 12, fontSize: 13, color: "var(--indigo)", lineHeight: 1.5 }}>
            💡 {msg.hint}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DrCPage() {
  const [msgs,   setMsgs]   = useState([INTRO]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput("");
    setMsgs(m => [...m, { id: Date.now(), from: "user", text: t }]);
    setTyping(true);
    const res = drCResponses[kw(t)];
    setTimeout(() => {
      setMsgs(m => [...m, { id: Date.now() + 1, from: "dr", text: res.message, hint: res.hint }]);
      setTyping(false);
    }, 900 + Math.random() * 500);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "var(--nav-h)", background: "#fff" }}>
      {/* Nav */}
      <div style={{ background: "rgba(242,242,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(0,0,0,0.1)", padding: "54px 20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#007aff,#5856d6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "var(--label)" }}>Dr. C</div>
            <div style={{ fontSize: 12, color: typing ? "var(--green)" : "var(--label3)", fontWeight: 500 }}>
              {typing ? "입력 중..." : "AI 튜터 · 항상 응원해!"}
            </div>
          </div>
          <button style={{ marginLeft: "auto", fontSize: 14, color: "var(--blue)", fontWeight: 500 }} onClick={() => setMsgs([INTRO])}>초기화</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 8px", background: "#fff" }}>
        {msgs.map((msg, i) => <Bubble key={msg.id} msg={msg} animate={i === msgs.length - 1 && msg.from === "dr"} />)}
        {typing && (
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#007aff,#5856d6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🤖</div>
            <div style={{ padding: "12px 16px", background: "#e9e9eb", borderRadius: "4px 18px 18px 18px", display: "flex", gap: 5, alignItems: "center" }}>
              <div className="ios-dot" /><div className="ios-dot" /><div className="ios-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick pills */}
      <div style={{ padding: "8px 16px", borderTop: "0.5px solid var(--sep2)", background: "#fff" }}>
        <div className="ios-hscroll">
          {QUICK.map(q => (
            <button key={q} style={{ padding: "7px 14px", borderRadius: 100, background: "var(--fill3)", color: "var(--label2)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }} onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, padding: "10px 16px 14px", background: "#fff" }}>
        <input
          className="ios-input"
          style={{ flex: 1, fontSize: 15, padding: "11px 16px", borderRadius: 100 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Dr. C에게 질문해봐..."
        />
        <button style={{ width: 44, height: 44, borderRadius: "50%", background: input.trim() ? "var(--blue)" : "var(--fill3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: input.trim() ? "#fff" : "var(--label3)", flexShrink: 0, transition: "background 0.2s" }} onClick={() => send()}>
          ↑
        </button>
      </div>
    </div>
  );
}
