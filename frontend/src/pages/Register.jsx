import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Mascot from "../components/Mascot";
import "../mekong-theme.css";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    name: "", age: "", gender: "male",
    weight: "", height: "",
    goal_weight: "", goal_loss: "",
    specialty: "", email: "", password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (role === "user") {
        const res = await api.post("/users", {
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          weight: Number(form.weight),
          height: Number(form.height),
          goal_weight: Number(form.goal_weight),
          goal_loss: Number(form.goal_loss),
          email: form.email,
          password: form.password
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify({
          user_id: res.data.user_id, role: res.data.role, name: form.name
        }));
        navigate("/");
      } else {
        const res = await api.post("/trainers", {
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          weight: Number(form.weight),
          height: Number(form.height),
          specialty: form.specialty,
          email: form.email,
          password: form.password
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify({
          user_id: res.data.trainer_id, role: res.data.role, name: form.name
        }));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Có lỗi xảy ra, kiểm tra lại thông tin nhé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mk-page">
      <div className="mk-checker-strip" />
      <div className="mk-card-wrap" style={{ maxWidth: "480px" }}>

        <div className="mk-brand">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <Mascot size={88} />
          </div>
          <p className="mk-title">Tạo tài khoản</p>
          <p className="mk-subtitle">AI Coach Health</p>
        </div>

        <form onSubmit={handleSubmit} className="mk-card">

          {error && <div className="mk-error">{error}</div>}

          <p className="mk-section-label">Bạn là</p>
          <div className="mk-role-grid">
            <div
              className={`mk-role-card ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
            >
              <i className="ti ti-user" />
              <p className="mk-role-title">Người dùng</p>
              <p className="mk-role-sub">Theo dõi sức khỏe</p>
            </div>
            <div
              className={`mk-role-card ${role === "trainer" ? "active" : ""}`}
              onClick={() => setRole("trainer")}
            >
              <i className="ti ti-trophy" />
              <p className="mk-role-title">Huấn luyện viên</p>
              <p className="mk-role-sub">Quản lí tập luyện</p>
            </div>
          </div>

          <div className="mk-row mk-field">
            <div>
              <span className="mk-label">Họ và tên</span>
              <input name="name" className="mk-input" placeholder="Nguyễn Văn A" onChange={handleChange} />
            </div>
            <div>
              <span className="mk-label">Tuổi</span>
              <input name="age" type="number" className="mk-input" placeholder="25" onChange={handleChange} />
            </div>
          </div>

          <div className="mk-field">
            <span className="mk-label">Giới tính</span>
            <select name="gender" className="mk-select" onChange={handleChange}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="mk-row mk-field">
            <div>
              <span className="mk-label">Cân nặng (kg)</span>
              <input name="weight" type="number" className="mk-input" placeholder="70" onChange={handleChange} />
            </div>
            <div>
              <span className="mk-label">Chiều cao (cm)</span>
              <input name="height" type="number" className="mk-input" placeholder="170" onChange={handleChange} />
            </div>
          </div>

          <div className="mk-field">
            <span className="mk-label">Email</span>
            <input name="email" type="email" className="mk-input" placeholder="ban@email.com" onChange={handleChange} />
          </div>

          <div className="mk-field">
            <span className="mk-label">Mật khẩu</span>
            <input name="password" type="password" className="mk-input" placeholder="••••••••" onChange={handleChange} />
          </div>

          {role === "user" && (
            <div className="mk-row mk-field">
              <div>
                <span className="mk-label">Mục tiêu cân (kg)</span>
                <input name="goal_weight" type="number" className="mk-input" placeholder="65" onChange={handleChange} />
              </div>
              <div>
                <span className="mk-label">Giảm/tuần (kg)</span>
                <input name="goal_loss" type="number" step="0.1" className="mk-input" placeholder="0.5" onChange={handleChange} />
              </div>
            </div>
          )}

          {role === "trainer" && (
            <div className="mk-field">
              <span className="mk-label">Chứng chỉ / chuyên môn</span>
              <input name="specialty" className="mk-input" placeholder="VD: PT cấp 3, Yoga, CrossFit..." onChange={handleChange} />
            </div>
          )}

          <button type="submit" disabled={loading} className="mk-btn">
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>

          <p className="mk-footer-text">
            Đã có tài khoản?{" "}
            <span onClick={() => navigate("/login")} className="mk-link">
              Đăng nhập
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
