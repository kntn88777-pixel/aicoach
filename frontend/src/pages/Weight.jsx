import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../mekong-theme.css";

function WeightChart({ logs, goalWeight }) {
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 44 };

  const weights = logs.map(l => l.weight);
  const allValues = goalWeight ? [...weights, goalWeight] : weights;
  const min = Math.min(...allValues) - 1;
  const max = Math.max(...allValues) + 1;

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xFor = (i) => padding.left + (logs.length === 1 ? innerW / 2 : (i / (logs.length - 1)) * innerW);
  const yFor = (w) => padding.top + innerH - ((w - min) / (max - min)) * innerH;

  const points = logs.map((l, i) => `${xFor(i)},${yFor(l.weight)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {[0, 0.5, 1].map((frac) => {
        const y = padding.top + innerH * frac;
        const val = (max - (max - min) * frac).toFixed(1);
        return (
          <g key={frac}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E4DCC8" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} fontSize="11" fill="#6B6A5C" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {goalWeight && (
        <line
          x1={padding.left} x2={width - padding.right}
          y1={yFor(goalWeight)} y2={yFor(goalWeight)}
          stroke="#8B6914" strokeWidth="1.5" strokeDasharray="5,4"
        />
      )}

      <polyline points={points} fill="none" stroke="#4A8B3F" strokeWidth="2.5" />

      {logs.map((l, i) => (
        <circle key={i} cx={xFor(i)} cy={yFor(l.weight)} r="4" fill="#1F4D2E" />
      ))}

      {logs.map((l, i) => {
        if (logs.length > 8 && i % Math.ceil(logs.length / 8) !== 0) return null;
        const d = new Date(l.created_at);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        return (
          <text key={i} x={xFor(i)} y={height - 8} fontSize="11" fill="#6B6A5C" textAnchor="middle">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export default function Weight() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = stored.user_id || 1;

  const [logs, setLogs] = useState([]);
  const [goalWeight, setGoalWeight] = useState(null);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = () => {
    api.get(`/weight-log/${userId}`)
      .then(res => {
        setLogs(res.data.logs || []);
        setGoalWeight(res.data.goal_weight);
      })
      .catch(() => setError("Không tải được dữ liệu cân nặng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLogs(); }, []);

  if (stored.role === "trainer") {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/weight-log", { user_id: userId, weight: Number(newWeight) });
      setNewWeight("");
      loadLogs();
    } catch {
      setError("Không ghi nhận được, thử lại nhé");
    } finally {
      setSaving(false);
    }
  };

  const current = logs.length ? logs[logs.length - 1].weight : null;
  const first = logs.length ? logs[0].weight : null;
  const change = current !== null && first !== null ? (current - first).toFixed(1) : null;

  return (
    <div style={{ display: "flex", background: "var(--mk-cream)", minHeight: "100vh" }}>
      <Sidebar />
      <div className="mk-page-body">
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 className="mk-page-title">Cân nặng</h1>
          <p className="mk-page-sub">Theo dõi tiến trình của bạn theo thời gian</p>
        </div>

        {!loading && (
          <div className="mk-weight-top">
            <div className="mk-stat-card highlight">
              <div className="mk-stat-icon-row"><i className="ti ti-scale" /><span className="mk-stat-label">Hiện tại</span></div>
              <p className="mk-stat-value">{current !== null ? current : "—"} kg</p>
            </div>
            <div className="mk-stat-card">
              <div className="mk-stat-icon-row"><i className="ti ti-target" /><span className="mk-stat-label">Mục tiêu</span></div>
              <p className="mk-stat-value">{goalWeight ?? "—"} kg</p>
            </div>
            <div className="mk-stat-card">
              <div className="mk-stat-icon-row"><i className="ti ti-trending-down" /><span className="mk-stat-label">Thay đổi</span></div>
              <p className="mk-stat-value">{change !== null ? `${change > 0 ? "+" : ""}${change}` : "—"} kg</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mk-weight-form">
          <div className="mk-field">
            <span className="mk-label">Ghi nhận cân nặng hôm nay (kg)</span>
            <input
              type="number" step="0.1" className="mk-input"
              placeholder="VD: 73.5" value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving || !newWeight} className="mk-btn">
            {saving ? "Đang lưu..." : "Lưu lại"}
          </button>
        </form>

        {error && <div className="mk-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <div className="mk-chart-card">
          <p className="mk-section-label">Tiến trình cân nặng (kg)</p>
          {loading ? (
            <p style={{ color: "var(--mk-text-muted)", fontSize: "13px" }}>Đang tải...</p>
          ) : logs.length === 0 ? (
            <div className="mk-empty-state">
              <i className="ti ti-chart-line" />
              <p>Chưa có dữ liệu, ghi nhận cân nặng đầu tiên nhé!</p>
            </div>
          ) : (
            <WeightChart logs={logs} goalWeight={goalWeight} />
          )}
        </div>
      </div>
    </div>
  );
}
