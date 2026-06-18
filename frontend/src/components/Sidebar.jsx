import { Link, useLocation, useNavigate } from "react-router-dom";
import Mascot from "./Mascot";
import "../mekong-theme.css";

const navItems = [
  { to: "/", icon: "ti-layout-dashboard", label: "Dashboard", roles: ["user", "trainer"] },
  { to: "/chat", icon: "ti-message-circle", label: "Chat", roles: ["user", "trainer"] },
  { to: "/weight", icon: "ti-chart-line", label: "Cân nặng", roles: ["user"] },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const role = stored.role || "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="mk-sidebar">
      <div className="mk-sidebar-brand">
        <Mascot size={36} />
        <span className="mk-sidebar-brand-name">AI Coach<br />Health</span>
      </div>

      {navItems.filter(item => item.roles.includes(role)).map(({ to, icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <div className={`mk-nav-item ${active ? "active" : ""}`}>
              <i className={`ti ${icon}`} />
              <span>{label}</span>
            </div>
          </Link>
        );
      })}

      <div className="mk-nav-logout" onClick={handleLogout}>
        <i className="ti ti-logout" />
        <span>Đăng xuất</span>
      </div>
    </div>
  );
}

export default Sidebar;
