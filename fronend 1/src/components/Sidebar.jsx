import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", icon: "ti-layout-dashboard", label: "Dashboard" },
  { to: "/chat", icon: "ti-message-circle", label: "Chat" },
  { to: "/weight", icon: "ti-chart-line", label: "Weight Tracking" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div style={{
      width: "220px", height: "100vh", position: "fixed", top: 0, left: 0,
      background: "var(--white, #fff)", borderRight: "1px solid #e5e7eb",
      padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "4px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem", padding: "0 0.5rem" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <i className="ti ti-barbell" style={{ fontSize: "16px", color: "#534AB7" }} />
        </div>
        <span style={{ fontSize: "14px", fontWeight: 500 }}>AI Weight Coach</span>
      </div>

      {navItems.map(({ to, icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <div style={{
              background: active ? "#EEEDFE" : "transparent",
              borderRadius: "8px", padding: "10px 12px",
              display: "flex", alignItems: "center", gap: "10px", cursor: "pointer"
            }}>
              <i className={`ti ${icon}`} style={{ fontSize: "16px", color: active ? "#534AB7" : "#6b7280" }} />
              <span style={{ fontSize: "14px", fontWeight: active ? 500 : 400, color: active ? "#3C3489" : "#6b7280" }}>
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default Sidebar;