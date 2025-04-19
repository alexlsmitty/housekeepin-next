import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material'; // Import necessary MUI components for fallback

import CallbackClientComponent from '@/components/auth/CallbackClientComponent';

export default function AuthCallbackPage() {
  return (
    // Wrap the client component that uses useSearchParams in Suspense
    <Suspense
      fallback={
        // Provide a simple fallback UI while the client component loads
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 4 }}>
            Loading authentication...
          </Typography>
        </Box>
      }
    >
      {/* Render the Client Component that contains the actual logic */}
      <CallbackClientComponent />
    </Suspense>
  );
}