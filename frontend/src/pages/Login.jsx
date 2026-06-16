import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "8px 12px",
  border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px",
  outline: "none", background: "#fff", color: "#111"
};

const labelStyle = {
  fontSize: "12px", color: "#6b7280", marginBottom: "5px", display: "block"
};

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
        name: res.data.name
      }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <i className="ti ti-barbell" style={{ fontSize: "20px", color: "#534AB7" }} />
          </div>
          <p style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 4px" }}>Đăng nhập</p>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>AI Weight Coach</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem" }}>

          {error && (
            <div style={{ background: "#FEEEEE", color: "#E24B4A", fontSize: "13px", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <span style={labelStyle}>Email</span>
            <input
              type="email" required style={inputStyle}
              placeholder="ban@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={labelStyle}>Mật khẩu</span>
            <input
              type="password" required style={inputStyle}
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "10px", borderRadius: "8px", border: "none",
            background: loading ? "#AFA9EC" : "#534AB7",
            color: "#fff", fontSize: "14px", fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer", marginTop: "4px"
          }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", margin: "12px 0 0" }}>
            Chưa có tài khoản?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "#534AB7", cursor: "pointer" }}>
              Đăng ký ngay
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
