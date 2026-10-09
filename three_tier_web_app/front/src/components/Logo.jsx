import React from 'react';

const Logo = ({ size = 160 }) => {
  const circleRadius = size * 0.45;
  const fontSizeAS = size * 0.4;
  const fontSizeMain = size * 0.14;
  const fontSizeSub = size * 0.1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Bebas Neue', sans-serif",
        userSelect: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'transform 0.4s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <defs>
          <linearGradient id="redStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#ff2a2a" />
          </linearGradient>
        </defs>

        {/* Red Circle */}
        <circle
          cx="100"
          cy="100"
          r={circleRadius}
          stroke="url(#redStroke)"
          strokeWidth="10"
          fill="none"
        />

        {/* "AS" Letters */}
        <text
          x="100"
          y="122"
          textAnchor="middle"
          fontSize={fontSizeAS}
          fill="#111"
          letterSpacing="4px"
          fontFamily="'Bebas Neue', sans-serif"
        >
          AS
        </text>
      </svg>

      {/* Text under the logo */}
      <div style={{ textAlign: 'center', marginTop: '-20px' ,marginBottom:'10px'}}>
        <div
          style={{
            fontSize: fontSizeMain,
            fontWeight: '700',
            letterSpacing: '3px',
            color: '#111',
            textTransform: 'uppercase',
          }}
        >
          AMBIKA SPARE
        </div>
        <div
          style={{
            fontSize: fontSizeSub,
            fontWeight: '500',
            color: '#555',
            letterSpacing: '1.2px',
          }}
        >
          PARTS
        </div>
      </div>
    </div>
  );
};

export default Logo;
