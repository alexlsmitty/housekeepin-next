'use client';

import Link from 'next/link';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
  link?: string;
  sx?: any; // Allow for sx prop to be passed
}

// Animation keyframes - more subtle movements
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const float = keyframes`
  0% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-1px) translateX(1px); }
  100% { transform: translateY(0) translateX(0); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.1); }
`;

const moveUpDown = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

// Styled components for SVG elements
const LogoContainer = styled('div')({
  maxWidth: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover .house': {
    animation: `${bounce} 2s ease-in-out infinite`
  },
  '&:hover .star1': {
    animation: `${spin} 5s linear infinite, ${sparkle} 2s ease-in-out infinite`
  },
  '&:hover .star2': {
    animation: `${spin} 6s linear infinite reverse, ${sparkle} 2.5s ease-in-out infinite`
  },
  '&:hover .star3': {
    animation: `${spin} 7s linear infinite, ${sparkle} 3s ease-in-out infinite`
  }
});

const LogoIconContainer = styled('g')({
  transformOrigin: 'center',
  transition: 'transform 0.3s ease'
});

const HouseContainer = styled('g')({
  transition: 'transform 0.3s ease'
});

const StarBase = styled('path')({
  transformOrigin: 'center'
});

const Star1Style = styled(StarBase)({
  animation: `${spin} 15s linear infinite, ${float} 6s ease-in-out infinite`
});

const Star2Style = styled(StarBase)({
  animation: `${spin} 18s linear infinite reverse, ${float} 7s ease-in-out infinite`
});

const Star3Style = styled(StarBase)({
  animation: `${spin} 20s linear infinite, ${float} 8s ease-in-out infinite`
});

// Star elements that will appear on hover around the text
const TextStarElement = styled('span')(({ delay = 0, top = 0, left = 0, size = 16 }) => ({
  position: 'absolute',
  top: `${top}px`,
  left: `${left}px`,
  width: `${size}px`,
  height: `${size}px`,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  animation: `${sparkle} 1.5s infinite ease-in-out, ${spin} 5s infinite linear, ${moveUpDown} 3s infinite ease-in-out`,
  animationDelay: `${delay}s`,
  zIndex: 1,
  pointerEvents: 'none',
}));

// Text star SVG component
const TextStar = ({ delay, top, left, size }) => (
  <TextStarElement 
    className="text-star" 
    delay={delay} 
    top={top}
    left={left}
    size={size}
  >
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#FFD700">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  </TextStarElement>
);

// Create a styled container for the brand name text
const BrandTextContainer = styled('span')(({ theme }) => ({
  position: 'relative',
  fontWeight: 900,
  color: theme.palette.primary.main,
  letterSpacing: '0.5px',
  fontStyle: 'italic',
  transition: '0.3s all ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  '&:hover .text-star': {
    opacity: 1,
  }
}));

const Logo: React.FC<LogoProps> = ({ 
  width = 302, 
  height = 90, 
  className = '',
  showText = true,
  link = '/dashboard',
  sx = {}
}) => {
  // Calculate text size proportionally to the logo width
  const textWidth = width * 0.6;
  const textHeight = height * 0.3;
  const content = (
    <LogoContainer className={className} style={{...sx}}>
      {showText && (
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'var(--font-poppins), "Poppins", sans-serif',
            fontWeight: 700,
            fontSize: `${Math.max(width/12, 18)}px`,
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            marginBottom: '10px',
            textAlign: 'center',
            color: 'primary.main'
          }}
        >
          <BrandTextContainer>
            housekeepin'
            <TextStar delay={0} top={-15} left={10} size={14} />
            <TextStar delay={0.3} top={-8} left={80} size={12} />
            <TextStar delay={0.5} top={5} left={40} size={10} />
            <TextStar delay={0.8} top={-12} left={120} size={8} />
            <TextStar delay={1.2} top={0} left={130} size={14} />
          </BrandTextContainer>
        </Typography>
      )}
      <svg 
        width="100%" 
        height={height * 0.7}
        style={{ maxWidth: width }}
        viewBox="0 0 46.36 46.36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >

        
        <LogoIconContainer>
          <HouseContainer className="house">
            {/* House/Rectangle base */}
            <rect x="0" y="0" width="46.36" height="46.36" rx="6" fill="#4351E7"/>
            
            {/* House outline - using simplified path that matches reference image */}
            <path d="M23.18 6.36L23.16 6.35L23.15 6.34C22.63 5.85 21.97 5.68 21.4 5.68C20.92 5.68 20.19 5.76 19.58 6.42L5.60 22.36L5.58 22.38L5.57 22.40C5.06 22.97 4.82 23.63 4.82 24.34C4.82 25.77 5.87 27.08 7.47 27.08C7.90 27.08 8.25 27.41 8.25 27.83V36.12C8.25 38.77 9.53 40.32 11.36 40.32H35.00C36.82 40.32 38.10 38.77 38.10 36.12V35.19C38.12 35.03 38.13 34.86 38.13 34.69L38.13 34.69L38.10 27.81C38.09 27.41 38.41 27.08 38.84 27.08H38.85C40.33 27.08 41.44 25.83 41.46 24.34C41.53 23.53 41.16 22.81 40.60 22.28L23.18 6.36Z" fill="#2D3BCC" stroke="#C06969" strokeWidth="1.5"/>
          </HouseContainer>
          
          {/* Stars from the SVG content provided - scaled down proportionally */}
          <Star1Style className="star1" 
            d="M32.10 15.50L30.70 11.90C30.68 11.85 30.64 11.80 30.60 11.77C30.55 11.74 30.50 11.73 30.44 11.73C30.39 11.73 30.33 11.74 30.28 11.77C30.24 11.80 30.20 11.85 30.18 11.90L28.78 15.50C28.77 15.54 28.74 15.57 28.72 15.60C28.69 15.63 28.66 15.65 28.62 15.66L25.01 17.06C24.96 17.08 24.92 17.12 24.89 17.16C24.86 17.21 24.84 17.26 24.84 17.32C24.84 17.38 24.86 17.43 24.89 17.48C24.92 17.52 24.96 17.56 25.01 17.58L28.62 18.97C28.66 18.99 28.69 19.00 28.72 19.04C28.74 19.07 28.77 19.10 28.78 19.14L30.18 22.75C30.20 22.80 30.24 22.84 30.28 22.88C30.33 22.91 30.39 22.92 30.44 22.92C30.50 22.92 30.55 22.91 30.60 22.88C30.64 22.84 30.68 22.80 30.70 22.75L32.10 19.14C32.11 19.10 32.14 19.07 32.16 19.04C32.19 19.00 32.22 18.99 32.26 18.97L35.87 17.58C35.92 17.56 35.96 17.52 35.99 17.48C36.02 17.43 36.04 17.38 36.04 17.32C36.04 17.26 36.02 17.21 35.99 17.16C35.96 17.12 35.92 17.08 35.87 17.06L32.26 15.66C32.22 15.65 32.19 15.63 32.16 15.60C32.14 15.57 32.11 15.54 32.10 15.50Z" 
            stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="#FFD700"/>
          
          <Star2Style className="star2"
            d="M25.16 8.31L25.44 9.07C25.47 9.15 25.53 9.21 25.60 9.24L26.36 9.52C26.61 9.61 26.61 9.96 26.36 10.05L25.60 10.33C25.53 10.36 25.47 10.42 25.44 10.49L25.16 11.26C25.06 11.51 24.71 11.51 24.62 11.26L24.33 10.49C24.31 10.42 24.25 10.36 24.18 10.33L23.41 10.05C23.16 9.96 23.16 9.61 23.41 9.52L24.18 9.24C24.25 9.21 24.31 9.15 24.33 9.07L24.62 8.31C24.71 8.06 25.06 8.06 25.16 8.31Z" 
            stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="#FFD700"/>
          
          <Star3Style className="star3"
            d="M37.33 8.71L37.85 10.04C37.88 10.11 37.94 10.17 38.02 10.20L39.35 10.71C39.60 10.81 39.60 11.15 39.35 11.25L38.02 11.77C37.94 11.80 37.88 11.86 37.85 11.93L37.33 13.26C37.23 13.51 36.88 13.51 36.78 13.26L36.26 11.93C36.23 11.86 36.17 11.80 36.10 11.77L34.77 11.25C34.52 11.15 34.52 10.81 34.77 10.71L36.10 10.20C36.17 10.17 36.23 10.11 36.26 10.04L36.78 8.71C36.88 8.46 37.23 8.46 37.33 8.71Z" 
            stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="#FFD700"/>
        </LogoIconContainer>
      </svg>
    </LogoContainer>
  );

  return link ? (
    <Link href={link}>
      {content}
    </Link>
  ) : content;
};

// Add a specialized mini version for mobile header
Logo.Mini = ({ size = 32 }) => {
  return (
    <LogoContainer style={{ width: size, height: size, padding: '2px', margin: '0 10px' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 46.36 46.36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <LogoIconContainer>
          <HouseContainer className="house">
            {/* House/Rectangle base */}
            <rect x="0" y="0" width="46.36" height="46.36" rx="6" fill="#4351E7"/>
            
            {/* House outline - simplified */}
            <path d="M23.18 6.36L23.16 6.35L23.15 6.34C22.63 5.85 21.97 5.68 21.4 5.68C20.92 5.68 20.19 5.76 19.58 6.42L5.60 22.36L5.58 22.38L5.57 22.40C5.06 22.97 4.82 23.63 4.82 24.34C4.82 25.77 5.87 27.08 7.47 27.08C7.90 27.08 8.25 27.41 8.25 27.83V36.12C8.25 38.77 9.53 40.32 11.36 40.32H35.00C36.82 40.32 38.10 38.77 38.10 36.12V35.19C38.12 35.03 38.13 34.86 38.13 34.69L38.13 34.69L38.10 27.81C38.09 27.41 38.41 27.08 38.84 27.08H38.85C40.33 27.08 41.44 25.83 41.46 24.34C41.53 23.53 41.16 22.81 40.60 22.28L23.18 6.36Z" fill="#2D3BCC" stroke="#C06969" strokeWidth="1.5"/>
          </HouseContainer>
        </LogoIconContainer>
      </svg>
    </LogoContainer>
  );
};

export default Logo;