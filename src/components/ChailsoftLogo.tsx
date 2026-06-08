import React from 'react';

interface ChailsoftLogoProps {
  className?: string;
  height?: number | string;
}

export function ChailsoftLogo({ className = "h-6", height }: ChailsoftLogoProps) {
  return (
    <div className={`inline-flex items-center select-none ${className}`} style={height ? { height } : undefined}>
      <svg
        viewBox="0 0 650 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Blue gradient for the 'C' emblem */}
          <linearGradient id="blueGrad" x1="20" y1="20" x2="160" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="40%" stopColor="#0088ff" />
            <stop offset="100%" stopColor="#0044ff" />
          </linearGradient>
          
          {/* Silver metallic gradient for code brackets and backing */}
          <linearGradient id="silverGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#dedede" />
            <stop offset="70%" stopColor="#9e9e9e" />
            <stop offset="100%" stopColor="#7a7a7a" />
          </linearGradient>

          {/* Simple shadow for 3D look */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* --- ICON PART --- */}
        <g filter="url(#softShadow)">
          {/* The main blue 'C' shaped container */}
          <path
            d="M 125,40 C 100,40 60,60 60,100 C 60,140 100,160 125,160 C 145,160 155,152 161,145 L 140,126 C 135,131 128,135 122,135 C 102,135 84,118 84,100 C 84,82 102,65 122,65 C 128,65 135,69 140,74 L 161,55 C 155,48 145,40 125,40 Z"
            fill="url(#blueGrad)"
          />

          {/* Chrome bracket < inside the blue C */}
          <path
            d="M 115,85 L 100,100 L 115,115 L 110,120 L 90,100 L 110,80 Z"
            fill="url(#silverGrad)"
          />
          {/* Centered browser slash / */}
          <path
            d="M 118,122 L 126,78 L 130,79 L 122,123 Z"
            fill="url(#silverGrad)"
          />
          {/* Chrome bracket > inside the blue C */}
          <path
            d="M 129,85 L 144,100 L 129,115 L 134,120 L 154,100 L 134,80 Z"
            fill="url(#silverGrad)"
          />

          {/* The stylized metallic 'S' framework backing wrapping the right of the circle */}
          <path
            d="M 160,50 L 180,70 L 155,100 L 180,130 L 160,150 L 135,115 L 145,100 Z"
            fill="url(#silverGrad)"
            opacity="0.85"
          />
          
          <path
            d="M 162,54 L 176,68 L 149,100 L 176,132 L 162,146 L 141,118 L 152,100 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </g>

        {/* --- BRAND TEXT: "chailsoft" --- */}
        <text
          x="215"
          y="112"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
          fontSize="68"
          fill="#1C2024"
          letterSpacing="-1"
        >
          chail
        </text>

        <text
          x="355"
          y="112"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="68"
          fill="#0088FF"
          letterSpacing="-1"
        >
          soft
        </text>

        {/* --- SUBTITLE: "SOFTWARE SOLUTIONS" with thin rules --- */}
        {/* Left Horizontal Rule */}
        <line
          x1="215"
          y1="139"
          x2="265"
          y2="139"
          stroke="#0088FF"
          strokeWidth="3"
        />

        {/* Spaced Text */}
        <text
          x="278"
          y="144"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
          fontSize="15"
          fill="#5a6a85"
          letterSpacing="11"
        >
          SOFTWARE SOLUTIONS
        </text>

        {/* Right Horizontal Rule */}
        <line
          x1="588"
          y1="139"
          x2="638"
          y2="139"
          stroke="#0088FF"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
