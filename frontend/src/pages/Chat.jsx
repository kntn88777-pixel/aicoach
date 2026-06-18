import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Mascot from "../components/Mascot";
import api from "../services/api";
import "../mekong-theme.css";

const USER_ID = 1;

function PlanCard({ data }) {
  return (
    <div className="mk-plan-card">
      {data.intro && <p className="mk-plan-intro">{data.intro}</p>}
      <div className="mk-timeline">
        {(data.milestones || []).map((m, i) => (
          <div key={i} className="mk-timeline-item">
            <span className="mk-timeline-dot" />
            <p className="mk-timeline-period">{m.period}</p>
            {m.weight_target && (
              <div className="mk-timeline-row"><i className="ti ti-scale" /><span>{m.weight_target}</span></div>
            )}
            {m.calories && (
              <div className="mk-timeline-row"><i className="ti ti-flame" /><span>{m.calories}</span></div>
            )}
            {m.activity && (
              <div className="mk-timeline-row"><i className="ti ti-run" /><span>{m.activity}</span></div>
            )}
          </div>
        ))}
      </div>
      {data.notes && data.notes.length > 0 && (
        <div className="mk-plan-notes">
          <p className="mk-plan-notes-title">Lưu ý</p>
          <ul>
            {data.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function MealTableCard({ data }) {
  const mealIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("sáng")) return "ti-sunrise";
    if (n.includes("trưa")) return "ti-sun";
    if (n.includes("tối") || n.includes("chiều")) return "ti-moon";
    return "ti-bowl-chopsticks";
  };

  return (
    <div className="mk-meal-card">
      {data.intro && <p className="mk-plan-intro">{data.intro}</p>}
      {(data.meals || []).map((meal, i) => (
        <div key={i} className="mk-meal-group">
          <p className="mk-meal-group-title">
            <i className={`ti ${mealIcon(meal.name)}`} />
            {meal.name}
          </p>
          <table className="mk-meal-table">
            <thead>
              <tr>
                <th>Món</th>
                <th>Calo</th>
                <th>Protein</th>
                <th>Carb</th>
                <th>Fat</th>
              </tr>
            </thead>
            <tbody>
              {(meal.items || []).map((item, j) => (
                <tr key={j}>
                  <td className="mk-meal-food">{item.food}</td>
                  <td>{item.calories}</td>
                  <td>{item.protein}</td>
                  <td>{item.carb}</td>
                  <td>{item.fat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {data.notes && data.notes.length > 0 && (
        <div className="mk-plan-notes">
          <p className="mk-plan-notes-title">Lưu ý</p>
          <ul>
            {data.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function MessageContent({ msg }) {
  if (msg.role === "user") {
    return <div className="mk-bubble user">{msg.content}</div>;
  }

  // msg.content can be a structured object ({type, ...}) or a plain string (legacy/fallback)
  const data = typeof msg.content === "string" ? { type: "text", content: msg.content } : msg.content;

  if (data.type === "plan") {
    return <PlanCard data={data} />;
  }

  if (data.type === "meal_table") {
    return <MealTableCard data={data} />;
  }

  return <div className="mk-bubble assistant">{data.content}</div>;
}

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
      setMessages(prev => [...prev, { role: "assistant", content: { type: "text", content: "Lỗi kết nối, thử lại nhé!" } }]);
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
              <MessageContent msg={msg} />
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
