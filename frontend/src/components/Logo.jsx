export default function Logo({ height = 32 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg width={height} height={height} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="22" r="14" fill="#4A8B3F" />
        <path d="M20 12 C15 8, 13 3, 15 -1 C18 2, 20 6, 20 11 Z" fill="#1F4D2E" transform="translate(0,4)" />
        <path d="M20 12 C25 8, 27 3, 25 -1 C22 2, 20 6, 20 11 Z" fill="#4A8B3F" transform="translate(0,4)" />
        <rect x="11" y="19" width="18" height="4" fill="#FFFDF7" rx="1" />
        <rect x="13" y="19.5" width="2.5" height="2.5" fill="#1F4D2E" />
        <rect x="18" y="19.5" width="2.5" height="2.5" fill="#1F4D2E" />
        <rect x="23" y="19.5" width="2.5" height="2.5" fill="#1F4D2E" />
      </svg>
      <span style={{
        fontFamily: "Fraunces, serif",
        fontWeight: 600,
        fontSize: `${height * 0.5}px`,
        color: "#1F4D2E",
        letterSpacing: "-0.3px"
      }}>
        AI Coach Health
      </span>
    </div>
  );
}
