import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const USER_ID = 1;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/chat-history/${USER_ID}`).then(res => {
      setMessages(res.data.map(m => ({
        role: m.role,
        content: m.message
      })));
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        user_id: USER_ID,
        message: input
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Lỗi kết nối, thử lại nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: "flex", background: "#f9fafb", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>

        <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-robot" style={{ fontSize: "18px", color: "#534AB7" }} />
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>AI Coach</p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Powered by Gemini 2.0 Flash</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "4rem", color: "#9ca3af" }}>
              <i className="ti ti-message-circle" style={{ fontSize: "40px", display: "block", marginBottom: "8px" }} />
              <p style={{ fontSize: "14px" }}>Hỏi tôi về dinh dưỡng và tập luyện nhé!</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role !== "user" && (
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px", flexShrink: 0, alignSelf: "flex-end" }}>
                  <i className="ti ti-robot" style={{ fontSize: "14px", color: "#534AB7" }} />
                </div>
              )}
              <div style={{
                maxWidth: "70%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? "#534AB7" : "#fff",
                color: msg.role === "user" ? "#fff" : "#111",
                border: msg.role === "user" ? "none" : "1px solid #e5e7eb",
                fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-robot" style={{ fontSize: "14px", color: "#534AB7" }} />
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "10px 16px", fontSize: "14px", color: "#9ca3af" }}>
                Đang soạn...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Nhập tin nhắn... (Enter để gửi)"
            style={{
              flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "12px",
              fontSize: "14px", resize: "none", outline: "none", fontFamily: "inherit",
              lineHeight: "1.5", maxHeight: "120px", overflow: "auto"
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
            width: "40px", height: "40px", borderRadius: "10px", border: "none",
            background: loading || !input.trim() ? "#e5e7eb" : "#534AB7",
            color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <i className="ti ti-send" style={{ fontSize: "16px" }} />
          </button>
        </div>

      </div>
    </div>
  );
}