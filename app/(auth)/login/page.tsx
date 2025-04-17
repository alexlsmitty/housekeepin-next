'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Tabs, 
  Tab, 
  Alert,
  Link as MuiLink,
  Divider,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState(0); // 0 for login, 1 for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { signIn, signUp } = useAuthContext();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset form when switching tabs
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 0) {
        // Login
        await signIn(email, password);
        router.push('/dashboard');
      } else {
        // Signup
        await signUp(email, password);
        // After signup, redirect to login tab with a message
        setActiveTab(0);
        // Could show a "check email" message here
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    setError('');
    try {
      // Try with an explicit localhost URL instead of window.location.origin
      const redirectUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/callback'
        : `${window.location.origin}/auth/callback`;
      
      console.log('Google auth redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Google authentication error:', err);
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2 
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          py: 4, 
          px: { xs: 2, sm: 4 }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          sx={{ mb: 4, fontWeight: 700 }}
        >
          HouseKeepin
        </Typography>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ mb: 3 }}
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              activeTab === 0 ? 'Login' : 'Sign Up'
            )}
          </Button>

          <Divider sx={{ my: 2 }}>OR</Divider>

          {/* Google Authentication Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleAuth}
            disabled={loading}
            sx={{ mb: 2, py: 1.2 }}
          >
            Continue with Google
          </Button>

          {activeTab === 0 && (
            <Typography variant="body2" align="center">
              <MuiLink href="#" onClick={(e) => { e.preventDefault(); }}>
                Forgot password?
              </MuiLink>
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
