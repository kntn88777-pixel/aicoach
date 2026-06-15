const iconMap = {
  "Cân nặng": "ti-scale",
  "Mục tiêu": "ti-target",
  "TDEE": "ti-flame",
  "Được ăn": "ti-check",
  "Đã ăn": "ti-bowl-chopsticks",
  "Còn lại": "ti-coin",
};

const colorMap = {
  "Còn lại": { bg: "#EEEDFE", border: "#AFA9EC", text: "#3C3489", sub: "#534AB7", icon: "#534AB7" },
};

function StatCard({ title, value }) {
  const custom = colorMap[title];

  return (
    <div style={{
      background: custom ? custom.bg : "#fff",
      border: `1px solid ${custom ? custom.border : "#e5e7eb"}`,
      borderRadius: "12px", padding: "1rem 1.25rem", minWidth: "140px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <i className={`ti ${iconMap[title] || "ti-chart-bar"}`}
          style={{ fontSize: "15px", color: custom ? custom.icon : "#6b7280" }} />
        <span style={{ fontSize: "12px", color: custom ? custom.sub : "#6b7280" }}>{title}</span>
      </div>
      <p style={{ fontSize: "24px", fontWeight: 500, margin: 0, color: custom ? custom.text : "#111" }}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;