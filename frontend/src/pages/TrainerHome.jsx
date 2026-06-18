import Sidebar from "../components/Sidebar";
import Mascot from "../components/Mascot";
import "../mekong-theme.css";

export default function TrainerHome() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div style={{ display: "flex", background: "var(--mk-cream)", minHeight: "100vh" }}>
      <Sidebar />
      <div className="mk-page-body">
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 className="mk-page-title">Xin chào, {stored.name || "Huấn luyện viên"}</h1>
          <p className="mk-page-sub">Chuyên môn: {stored.specialty || "Chưa cập nhật"}</p>
        </div>

        <div className="mk-chart-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <Mascot size={72} />
          </div>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: "17px", color: "var(--mk-forest)", margin: "0 0 8px" }}>
            Trang quản lý học viên đang được phát triển
          </p>
          <p style={{ fontSize: "13px", color: "var(--mk-text-muted)", maxWidth: "380px", margin: "0 auto" }}>
            Trong thời gian này, bạn có thể dùng Chat để trao đổi với AI Coach về dinh dưỡng và tập luyện.
          </p>
        </div>
      </div>
    </div>
  );
}
