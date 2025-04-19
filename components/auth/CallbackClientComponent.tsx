'use client'; // Mark this as a Client Component

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { supabase } from '@/lib/supabase/client'; // Adjust import path if needed

export default function CallbackClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state

  useEffect(() => {
    // Check for errors passed directly in the URL from the OAuth provider
    const oauthError = searchParams.get('error');
    const oauthErrorDescription = searchParams.get('error_description');

    if (oauthError) {
      console.error(`OAuth Error: ${oauthError}`, oauthErrorDescription);
      setError(oauthErrorDescription || oauthError || 'An unknown error occurred during authentication.');
      setIsLoading(false);
      return; // Stop further processing if there's an OAuth error
    }
    const checkSessionAndRedirect = async () => {
      // Give a brief moment for cookies/session to potentially settle
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError; // Handle Supabase-specific errors
        }

        console.log('Session check in callback component:',
          session ? `Authenticated as ${session.user.email}` : 'No session found yet.');

        if (session) {
          // Session found, redirect to dashboard (or onboarding if needed - middleware should handle this)
          // We use router.replace to avoid adding the callback page to history
          router.replace('/dashboard');
        } else {
          // No session found after the delay, likely an issue.
          setError('Authentication failed or session expired. Please try logging in again.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error checking session in callback component:', err);
        setError('An error occurred while verifying your session.');
        setIsLoading(false);
      }
    };

    checkSessionAndRedirect();

  }, [router, searchParams]); // Dependencies for useEffect

  // Render Loading UI or Error UI
  return (
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
      {error ? (
        // Error State UI
        <>
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 500 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            sx={{ mt: 2 }}
          >
            Return to Login
          </Button>
        </>
      ) : isLoading ? (
        // Loading State UI
        <>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 4 }}>
            Completing authentication...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Please wait while we finalize your sign-in. You will be redirected shortly.
          </Typography>
        </>
      ) : (
        
        <Typography>Redirecting...</Typography>
      )}
    </Box>
  );
}