export default function BrandCrest({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="crestFoil" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9EBE5" />
          <stop offset="0.45" stopColor="#D4B483" />
          <stop offset="0.72" stopColor="#E6C2BF" />
          <stop offset="1" stopColor="#B07878" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="url(#crestFoil)" strokeWidth="1" opacity="0.65" />
      <circle cx="24" cy="24" r="17.5" stroke="url(#crestFoil)" strokeWidth="0.75" opacity="0.4" />
      <path
        d="M16 18.5h4l4 5.5 4-5.5h4"
        stroke="url(#crestFoil)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 24v9.5"
        stroke="url(#crestFoil)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12.5 33.5c3.4 3.4 7.3 5 11.5 5s8.1-1.6 11.5-5"
        stroke="url(#crestFoil)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="17" cy="13.5" r="1.4" fill="#E6C2BF" />
      <circle cx="24" cy="11.5" r="1.7" fill="#F9EBE5" />
      <circle cx="31" cy="13.5" r="1.4" fill="#E6C2BF" />
    </svg>
  );
}