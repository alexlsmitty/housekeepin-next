'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box
} from '@mui/material';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';

// Define animations for the sparkling stars
const sparkle = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.8; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const moveUpDown = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

// Create a styled container for the housekeepin' brand name
const BrandContainer = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  position: 'relative',
  fontWeight: 900,
  color: theme.palette.primary.main,
  letterSpacing: '0.5px',
  fontStyle: 'italic',
  paddingRight: '8px',
  transition: '0.3s all ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  '&:hover .star': {
    opacity: 1,
  }
}));

// Star elements that will appear on hover
const StarElement = styled('span')(({ delay = 0, top = 0, left = 0, size = 16 }) => ({
  position: 'absolute',
  top: `${top}px`,
  left: `${left}px`,
  width: `${size}px`,
  height: `${size}px`,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  animation: `${sparkle} 1.5s infinite ease-in-out, ${rotate} 5s infinite linear, ${moveUpDown} 3s infinite ease-in-out`,
  animationDelay: `${delay}s`,
  zIndex: 1,
  pointerEvents: 'none',
}));

// Star SVG component
const Star = ({ delay, top, left, size }) => (
  <StarElement 
    className="star" 
    delay={delay} 
    top={top}
    left={left}
    size={size}
  >
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#FFD700">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  </StarElement>
);

// Welcome section client component
export default function WelcomeSection() {
  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Typography variant="h4" component="div" fontWeight="600" sx={{ mb: { xs: 1, sm: 0 } }}>
            Welcome to{' '}
            <BrandContainer>
              housekeepin'
              <Star delay={0} top={-15} left={10} size={14} />
              <Star delay={0.3} top={-8} left={80} size={12} />
              <Star delay={0.5} top={5} left={40} size={10} />
              <Star delay={0.8} top={-12} left={120} size={8} />
              <Star delay={1.2} top={0} left={130} size={14} />
            </BrandContainer>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your centralized hub for household management. Keep track of tasks, events, and budget all in one place.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}