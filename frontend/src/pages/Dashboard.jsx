import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../mekong-theme.css";

const stats = [
  { key: "weight", label: "Cân nặng", icon: "ti-scale", unit: "kg" },
  { key: "goal_weight", label: "Mục tiêu", icon: "ti-target", unit: "kg" },
  { key: "tdee", label: "TDEE", icon: "ti-flame", unit: "kcal" },
  { key: "recommended", label: "Được ăn", icon: "ti-check", unit: "kcal" },
  { key: "consumed", label: "Đã ăn", icon: "ti-bowl-chopsticks", unit: "kcal" },
  { key: "remaining", label: "Còn lại", icon: "ti-coin", unit: "kcal", highlight: true },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = stored.user_id || 1;
    api.get(`/dashboard/${userId}`)
      .then(res => setData(res.data))
      .catch(() => setError("Không load được dữ liệu, thử tải lại trang nhé"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="mk-page" style={{ minHeight: "100vh" }}>
      <span style={{ color: "#6B6A5C", fontSize: "14px" }}>Đang tải...</span>
    </div>
  );

  if (error) return (
    <div className="mk-page" style={{ minHeight: "100vh" }}>
      <span style={{ color: "#B33A2E", fontSize: "14px" }}>{error}</span>
    </div>
  );

  const percent = Math.min(100, Math.round((data.consumed / data.recommended) * 100));

  return (
    <div style={{ display: "flex", background: "var(--mk-cream)", minHeight: "100vh" }}>
      <Sidebar />
      <div className="mk-page-body">
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 className="mk-page-title">Dashboard</h1>
          <p className="mk-page-sub">Theo dõi sức khỏe hôm nay</p>
        </div>

        <div className="mk-stat-grid">
          {stats.map(({ key, label, icon, unit, highlight }) => (
            <div key={key} className={`mk-stat-card ${highlight ? "highlight" : ""}`}>
              <div className="mk-stat-icon-row">
                <i className={`ti ${icon}`} />
                <span className="mk-stat-label">{label}</span>
              </div>
              <p className="mk-stat-value">{data[key]} {unit}</p>
            </div>
          ))}
        </div>

        <div className="mk-progress-card">
          <p className="mk-section-label">Tiến độ calo hôm nay</p>
          <div className="mk-progress-track">
            <div className="mk-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="mk-progress-labels">
            <span>{data.consumed} kcal đã ăn</span>
            <span>{data.recommended} kcal mục tiêu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
