export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="140" height="140" rx="28" fill="#0f172a" />
      <polygon
        points="70,15 118,42 118,98 70,125 22,98 22,42"
        fill="#1e293b"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <path
        d="M45 38 L70 72 L95 38"
        stroke="#3b82f6"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M70 72 L58 110"
        stroke="#3b82f6"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M58 90 L82 90"
        stroke="#60a5fa"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}