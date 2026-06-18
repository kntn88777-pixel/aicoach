import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Mascot from "../components/Mascot";
import "../mekong-theme.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({
        user_id: res.data.user_id,
        role: res.data.role,
        name: res.data.name,
        specialty: res.data.specialty
      }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Email hoặc mật khẩu chưa đúng, thử lại nhé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mk-page">
      <div className="mk-checker-strip" />
      <div className="mk-card-wrap">

        <div className="mk-brand">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <Mascot size={88} />
          </div>
          <p className="mk-title">AI Coach Health</p>
          <p className="mk-subtitle">Sống khỏe · Tập chất · Miền Tây thiệt!</p>
        </div>

        <form onSubmit={handleSubmit} className="mk-card">

          {error && <div className="mk-error">{error}</div>}

          <div className="mk-field">
            <span className="mk-label">Email</span>
            <input
              type="email" required className="mk-input"
              placeholder="ban@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mk-field">
            <span className="mk-label">Mật khẩu</span>
            <input
              type="password" required className="mk-input"
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="mk-btn">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="mk-footer-text">
            Chưa có tài khoản?{" "}
            <span onClick={() => navigate("/register")} className="mk-link">
              Tạo tài khoản ngay
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
