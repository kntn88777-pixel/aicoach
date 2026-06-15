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

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    name: "", age: "", gender: "male",
    weight: "", height: "",
    goal_weight: "", goal_loss: "",
    specialty: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
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
          goal_loss: Number(form.goal_loss)
        });
        alert(`Tạo tài khoản thành công! ID = ${res.data.user_id}`);
        navigate("/");
      } else {
        const res = await api.post("/trainers", {
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          weight: Number(form.weight),
          height: Number(form.height),
          specialty: form.specialty
        });
        alert(`Tạo tài khoản huấn luyện viên thành công! ID = ${res.data.trainer_id}`);
        navigate("/");
      }
    } catch (err) {
      alert("Lỗi tạo tài khoản: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const roleCard = (value, icon, title, sub) => (
    <div onClick={() => setRole(value)} style={{
      flex: 1, padding: "14px", textAlign: "center", cursor: "pointer",
      border: `1.5px solid ${role === value ? "#534AB7" : "#e5e7eb"}`,
      borderRadius: "12px",
      background: role === value ? "#EEEDFE" : "#fff",
      transition: "all 0.15s"
    }}>
      <i className={`ti ${icon}`} style={{
        fontSize: "20px", color: role === value ? "#534AB7" : "#9ca3af",
        display: "block", marginBottom: "6px"
      }} />
      <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 2px",
        color: role === value ? "#3C3489" : "#111" }}>{title}</p>
      <p style={{ fontSize: "11px", margin: 0,
        color: role === value ? "#534AB7" : "#9ca3af" }}>{sub}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <i className="ti ti-barbell" style={{ fontSize: "20px", color: "#534AB7" }} />
          </div>
          <p style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 4px" }}>Tạo tài khoản</p>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>AI Weight Coach</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem" }}>

          <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 8px" }}>Loại tài khoản</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem" }}>
            {roleCard("user", "ti-user", "Người dùng", "Theo dõi sức khỏe")}
            {roleCard("trainer", "ti-trophy", "Quản lí tập luyện", "Huấn luyện viên")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <span style={labelStyle}>Họ và tên</span>
              <input name="name" style={inputStyle} placeholder="Nguyễn Văn A" onChange={handleChange} />
            </div>
            <div>
              <span style={labelStyle}>Tuổi</span>
              <input name="age" type="number" style={inputStyle} placeholder="25" onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <span style={labelStyle}>Giới tính</span>
            <select name="gender" style={inputStyle} onChange={handleChange}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <span style={labelStyle}>Cân nặng (kg)</span>
              <input name="weight" type="number" style={inputStyle} placeholder="70" onChange={handleChange} />
            </div>
            <div>
              <span style={labelStyle}>Chiều cao (cm)</span>
              <input name="height" type="number" style={inputStyle} placeholder="170" onChange={handleChange} />
            </div>
          </div>

          {role === "user" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <span style={labelStyle}>Mục tiêu cân (kg)</span>
                <input name="goal_weight" type="number" style={inputStyle} placeholder="65" onChange={handleChange} />
              </div>
              <div>
                <span style={labelStyle}>Giảm/tuần (kg)</span>
                <input name="goal_loss" type="number" step="0.1" style={inputStyle} placeholder="0.5" onChange={handleChange} />
              </div>
            </div>
          )}

          {role === "trainer" && (
            <div style={{ marginBottom: "12px" }}>
              <span style={labelStyle}>Chứng chỉ / chuyên môn</span>
              <input name="specialty" style={inputStyle} placeholder="VD: PT cấp 3, Yoga, CrossFit..." onChange={handleChange} />
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "10px", borderRadius: "8px", border: "none",
            background: loading ? "#AFA9EC" : "#534AB7",
            color: "#fff", fontSize: "14px", fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer", marginTop: "4px"
          }}>
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", margin: "12px 0 0" }}>
            Đã có tài khoản?{" "}
            <span onClick={() => navigate("/")} style={{ color: "#534AB7", cursor: "pointer" }}>
              Về trang chính
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}