import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/dashboard/1")
      .then(res => setData(res.data))
      .catch(() => setError("Không load được dữ liệu API"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <span style={{ color: "#6b7280", fontSize: "14px" }}>Đang tải...</span>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <span style={{ color: "#E24B4A", fontSize: "14px" }}>{error}</span>
    </div>
  );

  const percent = Math.min(100, Math.round((data.consumed / data.recommended) * 100));

  return (
    <div style={{ display: "flex", background: "#f9fafb", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: "220px", padding: "2rem", flex: 1 }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 4px" }}>Dashboard</h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Theo dõi sức khỏe hôm nay</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.5rem" }}>
          <StatCard title="Cân nặng" value={`${data.weight} kg`} />
          <StatCard title="Mục tiêu" value={`${data.goal_weight} kg`} />
          <StatCard title="TDEE" value={`${data.tdee} kcal`} />
          <StatCard title="Được ăn" value={`${data.recommended} kcal`} />
          <StatCard title="Đã ăn" value={`${data.consumed} kcal`} />
          <StatCard title="Còn lại" value={`${data.remaining} kcal`} />
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 10px" }}>Tiến độ calo hôm nay</p>
          <div style={{ background: "#f3f4f6", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, height: "100%", background: "#534AB7", borderRadius: "99px", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{data.consumed} kcal đã ăn</span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{data.recommended} kcal mục tiêu</span>
          </div>
        </div>
      </div>
    </div>
  );
}