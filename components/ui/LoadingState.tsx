'use client';

import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingState({ 
  message = 'Loading...', 
  fullPage = false 
}: LoadingStateProps) {
  
  if (fullPage) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 4,
        width: '100%',
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
