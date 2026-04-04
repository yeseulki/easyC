import { useState, useRef, useEffect } from "react";
import { drCResponses } from "../data/curriculum";
import "../App.css";

const DR_C_AVATAR = "🤖";

function Message({ msg, isNew }) {
  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      animation: isNew ? "fadeInUp 0.3s ease" : "none",
      marginBottom: 12,
    }}>
      {msg.from === "dr" ? (
        <>
          <div style={styles.avatar}>{DR_C_AVATAR}</div>
          <div style={{ maxWidth: "78%" }}>
            <div style={{
              ...styles.bubble,
              background: "linear-gradient(135deg, #1e1e3a, #2a1e3a)",
              borderTopLeftRadius: 4,
            }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{msg.text}</div>
              {msg.hint && (
                <div style={styles.hint}>
                  <span style={{ marginRight: 4 }}>💡</span>{msg.hint}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ marginLeft: "auto", maxWidth: "78%", display: "flex", flexDirection: "row-reverse" }}>
          <div style={{
            ...styles.bubble,
            background: "linear-gradient(135deg, #6C63FF, #a78bfa)",
            borderTopRightRadius: 4,
          }}>
            {msg.text}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DrC({ trigger, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  // Auto-respond to trigger events
  useEffect(() => {
    if (!trigger) return;
    const res = drCResponses[trigger] || drCResponses.wrongSlot;
    setTyping(true);
    const initMsg = {
      id: Date.now(),
      from: "dr",
      text: res.message,
      hint: res.hint,
    };
    setTimeout(() => {
      setMessages([initMsg]);
      setTyping(false);
    }, 800);
  }, [trigger]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    // Simple keyword-based response
    const lower = input.toLowerCase();
    let responseKey = "wrongSlot";
    if (lower.includes(";") || lower.includes("세미콜론")) responseKey = "semicolon";
    else if (lower.includes("배열") || lower.includes("범위") || lower.includes("[")) responseKey = "arrayOutOfBounds";
    else if (lower.includes("포인터") || lower.includes("주소") || lower.includes("ptr")) responseKey = "uninitializedPointer";
    else if (lower.includes("맞") || lower.includes("됐") || lower.includes("성공")) responseKey = "correct";

    const res = drCResponses[responseKey];
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "dr", text: res.message, hint: res.hint },
      ]);
      setTyping(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>{DR_C_AVATAR}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Dr. C</div>
            <div style={{ fontSize: 11, color: "#a78bfa" }}>AI 튜터 · 항상 응원해!</div>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && !typing && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
            <div style={{ color: "#8888aa", fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
              안녕! 나는 Dr. C야.<br />
              막히는 거 있으면 언제든 물어봐!<br />
              <span style={{ color: "#6C63FF" }}>정답은 안 알려주지만</span>,<br />
              함께 생각해볼게 😊
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={msg.id} msg={msg} isNew={i === messages.length - 1} />
        ))}

        {typing && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={styles.avatar}>{DR_C_AVATAR}</div>
            <div style={styles.typingIndicator}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div style={styles.quickBtns}>
        {["세미콜론 오류?", "배열 범위 초과?", "포인터 오류?"].map((q) => (
          <button
            key={q}
            style={styles.quickBtn}
            onClick={() => { setInput(q); }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Dr. C에게 질문해봐..."
        />
        <button style={styles.sendBtn} onClick={sendMessage}>→</button>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70vh",
    background: "#0d0d1a",
    borderRadius: "24px 24px 0 0",
    border: "1px solid rgba(108,99,255,0.3)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    animation: "fadeInUp 0.3s ease",
    boxShadow: "0 -8px 40px rgba(108,99,255,0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6C63FF, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.06)",
    color: "#aaa",
    width: 32,
    height: 32,
    borderRadius: "50%",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 16px 8px",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 16,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#f0f0f8",
  },
  hint: {
    marginTop: 8,
    padding: "6px 10px",
    background: "rgba(167,139,250,0.1)",
    borderRadius: 8,
    fontSize: 12,
    color: "#a78bfa",
    display: "flex",
    alignItems: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  typingIndicator: {
    display: "flex",
    gap: 5,
    padding: "10px 14px",
    background: "linear-gradient(135deg, #1e1e3a, #2a1e3a)",
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  quickBtns: {
    display: "flex",
    gap: 8,
    padding: "8px 16px",
    overflowX: "auto",
  },
  quickBtn: {
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(108,99,255,0.12)",
    color: "#a78bfa",
    fontSize: 12,
    border: "1px solid rgba(108,99,255,0.25)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "10px 16px 20px",
  },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6C63FF, #a78bfa)",
    color: "#fff",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
