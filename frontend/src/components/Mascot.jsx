export default function Mascot({ size = 96, mood = "happy" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="108" rx="28" ry="5" fill="#1F4D2E" opacity="0.12" />

      <path d="M60 38 C48 30, 44 18, 48 8 C54 14, 60 20, 60 32 Z" fill="#4A8B3F" />
      <path d="M60 38 C72 30, 76 18, 72 8 C66 14, 60 20, 60 32 Z" fill="#1F4D2E" />

      <ellipse cx="60" cy="72" rx="34" ry="36" fill="#4A8B3F" />

      <path d="M28 58 Q60 50 92 58 L92 70 Q60 62 28 70 Z" fill="#FFFDF7" stroke="#2A2A22" strokeWidth="1.2" />
      <path d="M28 58 Q60 50 92 58 L92 70 Q60 62 28 70 Z" fill="none" />
      <g opacity="0.9">
        <rect x="34" y="59" width="6" height="6" fill="#1F4D2E" />
        <rect x="46" y="59" width="6" height="6" fill="#1F4D2E" />
        <rect x="58" y="58" width="6" height="6" fill="#1F4D2E" />
        <rect x="70" y="59" width="6" height="6" fill="#1F4D2E" />
        <rect x="82" y="59" width="6" height="6" fill="#1F4D2E" />
        <rect x="40" y="65" width="6" height="6" fill="#1F4D2E" />
        <rect x="52" y="64" width="6" height="6" fill="#1F4D2E" />
        <rect x="64" y="65" width="6" height="6" fill="#1F4D2E" />
        <rect x="76" y="65" width="6" height="6" fill="#1F4D2E" />
      </g>

      <circle cx="50" cy="78" r="3.2" fill="#2A2A22" />
      <circle cx="70" cy="78" r="3.2" fill="#2A2A22" />

      {mood === "happy" ? (
        <path d="M48 87 Q60 96 72 87" fill="none" stroke="#2A2A22" strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <ellipse cx="60" cy="89" rx="6" ry="4" fill="#2A2A22" />
      )}

      <circle cx="42" cy="83" r="4" fill="#FF8C69" opacity="0.55" />
      <circle cx="78" cy="83" r="4" fill="#FF8C69" opacity="0.55" />

      <circle cx="22" cy="88" r="7" fill="#2A2A22" />
      <rect x="14" y="85" width="4" height="6" fill="#6B6A5C" />
      <circle cx="98" cy="88" r="7" fill="#2A2A22" />
      <rect x="102" y="85" width="4" height="6" fill="#6B6A5C" />
    </svg>
  );
}
