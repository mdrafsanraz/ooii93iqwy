export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Sound wave visualization */}
      <g transform="translate(15, 25)">
        {/* Wave bars representing distribution/streaming */}
        <rect x="0" y="25" width="5" height="20" fill="url(#waveGradient)" rx="2">
          <animate attributeName="height" values="20;35;20" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="y" values="25;17.5;25" dur="1.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="10" y="20" width="5" height="30" fill="url(#waveGradient)" rx="2">
          <animate attributeName="height" values="30;45;30" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="y" values="20;12.5;20" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="20" y="12" width="5" height="46" fill="url(#waveGradient)" rx="2">
          <animate attributeName="height" values="46;50;46" dur="1.2s" repeatCount="indefinite"/>
          <animate attributeName="y" values="12;10;12" dur="1.2s" repeatCount="indefinite"/>
        </rect>
        <rect x="30" y="22" width="5" height="26" fill="url(#waveGradient)" rx="2">
          <animate attributeName="height" values="26;42;26" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="y" values="22;14;22" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x="40" y="15" width="5" height="40" fill="url(#waveGradient)" rx="2">
          <animate attributeName="height" values="40;48;40" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="y" values="15;11;15" dur="1.6s" repeatCount="indefinite"/>
        </rect>
        
        {/* Distribution arrows */}
        <path d="M55 30 L68 22 L65 25 L72 25 L72 35 L65 35 L68 38 Z" fill="url(#waveGradient)" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M55 45 L68 37 L65 40 L72 40 L72 50 L65 50 L68 53 Z" fill="url(#waveGradient)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
        </path>
      </g>
      
      {/* Subtle connecting dots */}
      <circle cx="82" cy="30" r="3" fill="#8b5cf6" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="88" cy="50" r="2" fill="#ec4899" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="92" cy="38" r="1.5" fill="#6366f1" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}
