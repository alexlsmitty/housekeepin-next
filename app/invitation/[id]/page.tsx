'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, Error as ErrorIcon, Home as HomeIcon, Person as PersonIcon } from '@mui/icons-material';

export default function InvitationResponse({ params }) {
  const invitationId = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [household, setHousehold] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        // Check current auth status
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        
        if (user) {
          setCurrentUser(user);
        }
        
        // Get invitation details
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select('*, households(*)')
          .eq('id', invitationId)
          .single();
          
        if (invitationError) throw invitationError;
        
        if (!invitationData) {
          setError('Invitation not found or has been canceled');
          setLoading(false);
          return;
        }
        
        if (invitationData.status !== 'pending') {
          setError('This invitation has already been processed');
          setLoading(false);
          return;
        }
        
        setInvitation(invitationData);
        setHousehold(invitationData.households);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Failed to load invitation details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (invitationId) {
      fetchInvitationDetails();
    }
  }, [invitationId]);
  
  const handleAccept = async () => {
    setProcessingAction(true);
    
    try {
      if (!isAuthenticated) {
        // Save invitation ID in localStorage and redirect to login
        localStorage.setItem('pendingInvitation', invitationId);
        router.push('/auth/login');
        return;
      }
      
      // Verify user email matches invitation email
      if (currentUser.email !== invitation.invitee_email) {
        setError(`This invitation was sent to ${invitation.invitee_email}, but you're logged in as ${currentUser.email}`);
        setProcessingAction(false);
        return;
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);
        
      if (updateError) throw updateError;
      
      // Add user to household members
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: currentUser.id,
          role: 'member' // Default role
        });
        
      if (memberError) throw memberError;
      
      // Update user's household ID
      const { error: userError } = await supabase
        .from('users')
        .update({ household_id: household.id })
        .eq('id', currentUser.id);
        
      if (userError) throw userError;
      
      // Update household member count
      const { error: countError } = await supabase
        .from('households')
        .update({ member_count: (household.member_count || 1) + 1 })
        .eq('id', household.id);
        
      if (countError) throw countError;
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation: ' + err.message);
      setProcessingAction(false);
    }
  };
  
  const handleDecline = async () => {
    setProcessingAction(true);
    
    try {
      // Update invitation status
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);
        
      if (error) throw error;
      
      // Redirect to home or login page
      router.push(isAuthenticated ? '/dashboard' : '/');
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError('Failed to decline invitation: ' + err.message);
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Error
            </Typography>
            <Typography paragraph color="text.secondary">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!invitation || !household) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invitation Not Found
            </Typography>
            <Typography paragraph color="text.secondary">
              The invitation you're looking for doesn't exist or has been removed.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <HomeIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Household Invitation
            </Typography>
            <Typography color="text.secondary">
              You've been invited to join a household
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {household.name}
              </Typography>
              {household.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {household.description}
                </Typography>
              )}
              {household.address && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Address:</strong> {household.address}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  This invitation was sent to: <strong>{invitation.invitee_email}</strong>
                </Typography>
              </Alert>
              
              {isAuthenticated && currentUser?.email !== invitation.invitee_email && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    You're currently logged in as <strong>{currentUser.email}</strong>, but this invitation 
                    was sent to <strong>{invitation.invitee_email}</strong>. Please log in with the correct account.
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={handleDecline}
              disabled={processingAction}
            >
              Decline
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAccept}
              disabled={processingAction || (isAuthenticated && currentUser?.email !== invitation.invitee_email)}
            >
              {isAuthenticated ? 'Accept Invitation' : 'Login to Accept'}
              {processingAction && <CircularProgress size={20} sx={{ ml: 1 }} />}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
