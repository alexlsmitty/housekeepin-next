'use client';

import React from 'react';
import { Box, Alert, AlertTitle, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  message, 
  details,
  onRetry
}: ErrorMessageProps) {
  return (
    <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Alert 
        severity="error"
        action={
          onRetry && (
            <Button 
              color="inherit" 
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{message}</AlertTitle>
        {details && <Box sx={{ mt: 1 }}>{details}</Box>}
      </Alert>
    </Box>
  );
}
