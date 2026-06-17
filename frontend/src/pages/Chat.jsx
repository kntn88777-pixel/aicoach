import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Mascot from "../components/Mascot";
import api from "../services/api";
import "../mekong-theme.css";

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
    <div style={{ display: "flex", background: "var(--mk-cream)", minHeight: "100vh" }}>
      <Sidebar />
      <div className="mk-chat-page">

        <div className="mk-chat-header">
          <Mascot size={40} />
          <div>
            <p className="mk-chat-header-name">AI Coach miền Tây</p>
            <p className="mk-chat-header-sub">Sẵn sàng hỗ trợ bạn 24/7</p>
          </div>
        </div>

        <div className="mk-chat-body">
          {messages.length === 0 && (
            <div className="mk-chat-empty">
              <i className="ti ti-message-circle" style={{ fontSize: "40px", display: "block", marginBottom: "8px" }} />
              <p style={{ fontSize: "14px" }}>Hỏi tôi về dinh dưỡng và tập luyện nhé!</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mk-bubble-row ${msg.role}`}>
              {msg.role !== "user" && (
                <div style={{ marginRight: "8px", flexShrink: 0, alignSelf: "flex-end" }}>
                  <Mascot size={28} />
                </div>
              )}
              <div className={`mk-bubble ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Mascot size={28} />
              <div className="mk-typing">Đang soạn...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="mk-chat-input-bar">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Nhập tin nhắn... (Enter để gửi)"
            className="mk-chat-textarea"
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="mk-send-btn">
            <i className="ti ti-send" style={{ fontSize: "16px" }} />
          </button>
        </div>

      </div>
    </div>
  );
}
