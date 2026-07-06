'use client'

interface IllustrationProps {
  className?: string
}

export function AnalyticsIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 480 360"
      className={`w-full max-w-lg mx-auto ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="barGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      <rect x="40" y="30" width="400" height="300" rx="20" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
      <rect x="40" y="30" width="400" height="48" rx="20" fill="url(#analyticsGrad)" />
      <rect x="40" y="62" width="400" height="16" fill="url(#analyticsGrad)" />
      <circle cx="68" cy="54" r="6" fill="#ef4444" opacity="0.9" />
      <circle cx="88" cy="54" r="6" fill="#f59e0b" opacity="0.9" />
      <circle cx="108" cy="54" r="6" fill="#22c55e" opacity="0.9" />
      <text x="130" y="58" fill="white" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600">
        Stream Overview
      </text>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect
            x={70 + i * 52}
            y={220 - [80, 120, 95, 150, 110, 140][i]}
            width="28"
            height={[80, 120, 95, 150, 110, 140][i]}
            rx="6"
            fill="url(#barGrad)"
            opacity="0.85"
          >
            <animate
              attributeName="height"
              values={`${[60, 100, 75, 130, 90, 120][i]};${[80, 120, 95, 150, 110, 140][i]};${[60, 100, 75, 130, 90, 120][i]}`}
              dur={`${1.8 + i * 0.2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values={`${240 - [60, 100, 75, 130, 90, 120][i]};${220 - [80, 120, 95, 150, 110, 140][i]};${240 - [60, 100, 75, 130, 90, 120][i]}`}
              dur={`${1.8 + i * 0.2}s`}
              repeatCount="indefinite"
            />
          </rect>
        </g>
      ))}

      <path
        d="M70 180 Q130 140 190 160 T310 120 T390 90"
        fill="none"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="400"
        strokeDashoffset="400"
      >
        <animate attributeName="stroke-dashoffset" values="400;0;400" dur="4s" repeatCount="indefinite" />
      </path>
      <circle cx="390" cy="90" r="6" fill="#0f172a">
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
      </circle>

      <rect x="70" y="250" width="120" height="56" rx="10" fill="white" stroke="#e2e8f0" />
      <text x="82" y="272" fill="#64748b" fontSize="10" fontFamily="Inter, sans-serif">
        Total Streams
      </text>
      <text x="82" y="294" fill="#0f172a" fontSize="18" fontFamily="Inter, sans-serif" fontWeight="700">
        128.4K
      </text>

      <rect x="210" y="250" width="120" height="56" rx="10" fill="white" stroke="#e2e8f0" />
      <text x="222" y="272" fill="#64748b" fontSize="10" fontFamily="Inter, sans-serif">
        Top Market
      </text>
      <text x="222" y="294" fill="#0f172a" fontSize="18" fontFamily="Inter, sans-serif" fontWeight="700">
        🇺🇸 US
      </text>

      <g opacity="0.15">
        <circle cx="420" cy="100" r="40" fill="#0f172a">
          <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

export function PlaylistIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 480 360"
      className={`w-full max-w-lg mx-auto ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="playlistGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      <ellipse cx="240" cy="300" rx="160" ry="24" fill="#000" opacity="0.06">
        <animate attributeName="rx" values="150;165;150" dur="3s" repeatCount="indefinite" />
      </ellipse>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-8; 0,0"
          dur="3s"
          repeatCount="indefinite"
        />
        <rect x="100" y="60" width="280" height="200" rx="24" fill="url(#playlistGrad)" />
        <rect x="120" y="85" width="80" height="80" rx="12" fill="white" opacity="0.2" />
        <rect x="120" y="180" width="140" height="10" rx="5" fill="white" opacity="0.5" />
        <rect x="120" y="200" width="100" height="8" rx="4" fill="white" opacity="0.35" />
        <rect x="120" y="220" width="120" height="8" rx="4" fill="white" opacity="0.25" />

        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${220 + i * 14}, ${95 + i * 22})`}>
            <circle cx="0" cy="0" r="18" fill="white" opacity={0.9 - i * 0.15} />
            <path
              d="M-6 -2 L8 6 L-6 6 Z"
              fill="#14532d"
              opacity={0.8 - i * 0.1}
              transform="rotate(-30)"
            />
          </g>
        ))}
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 60 120; -12 60 120; 0 60 120"
          dur="4s"
          repeatCount="indefinite"
        />
        <circle cx="60" cy="120" r="36" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
        <text x="60" y="126" textAnchor="middle" fontSize="22">
          🎯
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 420 140; 10 420 140; 0 420 140"
          dur="3.5s"
          repeatCount="indefinite"
        />
        <circle cx="420" cy="140" r="32" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />
        <text x="420" y="146" textAnchor="middle" fontSize="20">
          🎧
        </text>
      </g>

      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={80 + i * 80}
          cy={40}
          r="3"
          fill="#22c55e"
          opacity="0.5"
        >
          <animate
            attributeName="cy"
            values="40;25;40"
            dur={`${2 + i * 0.3}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.8;0.2"
            dur={`${2 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

export function ArtistToolsIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 480 360"
      className={`w-full max-w-lg mx-auto ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="toolsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      <rect x="140" y="40" width="200" height="280" rx="28" fill="#1e1b4b" />
      <rect x="150" y="55" width="180" height="250" rx="20" fill="#312e81" />
      <rect x="210" y="48" width="60" height="8" rx="4" fill="#4c1d95" />

      <rect x="165" y="80" width="150" height="90" rx="14" fill="url(#toolsGrad)" opacity="0.9">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="2.5s" repeatCount="indefinite" />
      </rect>
      <text x="240" y="118" textAnchor="middle" fill="white" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600">
        SMART LINK
      </text>
      <text x="240" y="140" textAnchor="middle" fill="white" fontSize="9" fontFamily="Inter, sans-serif" opacity="0.8">
        rdistro.link/yourtrack
      </text>
      <circle cx="200" cy="150" r="10" fill="white" opacity="0.3" />
      <circle cx="240" cy="150" r="10" fill="white" opacity="0.5" />
      <circle cx="280" cy="150" r="10" fill="white" opacity="0.3" />

      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={165}
          y={185 + i * 38}
          width={150}
          height={30}
          rx="10"
          fill="white"
          opacity={0.12 + i * 0.04}
        >
          <animate
            attributeName="x"
            values={`${160 + i * 2};${170 - i * 2};${160 + i * 2}`}
            dur={`${2.2 + i * 0.4}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 12,-6; 0,0"
          dur="3s"
          repeatCount="indefinite"
        />
        <rect x="50" y="120" width="72" height="72" rx="16" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
        <text x="86" y="162" textAnchor="middle" fontSize="28">
          🔗
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -10,8; 0,0"
          dur="3.5s"
          repeatCount="indefinite"
        />
        <rect x="358" y="100" width="72" height="72" rx="16" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2" />
        <text x="394" y="142" textAnchor="middle" fontSize="28">
          🎨
        </text>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 6,10; 0,0"
          dur="4s"
          repeatCount="indefinite"
        />
        <rect x="360" y="220" width="72" height="72" rx="16" fill="#faf5ff" stroke="#a78bfa" strokeWidth="2" />
        <text x="396" y="262" textAnchor="middle" fontSize="28">
          📣
        </text>
      </g>

      <g opacity="0.4">
        <circle cx="90" cy="260" r="50" fill="none" stroke="#7c3aed" strokeWidth="1">
          <animate attributeName="r" values="40;55;40" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

export function FeatureIllustration({
  type,
  className,
}: {
  type: 'analytics' | 'playlist' | 'tools'
  className?: string
}) {
  if (type === 'analytics') return <AnalyticsIllustration className={className} />
  if (type === 'playlist') return <PlaylistIllustration className={className} />
  return <ArtistToolsIllustration className={className} />
}
