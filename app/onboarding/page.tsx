'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Home as HomeIcon, Person as PersonIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Onboarding() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [createdHouseholdId, setCreatedHouseholdId] = useState(null);
  
  // Household form data
  const [householdData, setHouseholdData] = useState({
    name: '',
    description: '',
    address: '',
    member_count: 1
  });
  
  // Invitations form data
  const [invitations, setInvitations] = useState([{ email: '' }]);
  
  // Steps for the onboarding process
  const steps = ['Create Household', 'Invite Members', 'Complete'];
  
  // Check if user is authenticated and has completed onboarding
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
        return;
      }
      
      setUser(user);
      
      // Check if user has already completed onboarding
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboard_success, household_id')
        .eq('id', user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }
      
      if (userData?.onboard_success && userData?.household_id) {
        // Redirect to dashboard if onboarding is already complete
        router.push('/dashboard');
      }
    };
    
    checkAuthStatus();
  }, [router]);
  
  const handleHouseholdInputChange = (e) => {
    const { name, value } = e.target;
    setHouseholdData(prev => ({
      ...prev,
      [name]: name === 'member_count' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };
  
  const handleInvitationChange = (index, value) => {
    const newInvitations = [...invitations];
    newInvitations[index].email = value;
    setInvitations(newInvitations);
  };
  
  const addInvitationField = () => {
    setInvitations([...invitations, { email: '' }]);
  };
  
  const removeInvitationField = (index) => {
    if (invitations.length > 1) {
      const newInvitations = [...invitations];
      newInvitations.splice(index, 1);
      setInvitations(newInvitations);
    }
  };
  
  const handleNext = () => {
    if (activeStep === 0) {
      createHousehold();
    } else if (activeStep === 1) {
      sendInvitations();
    } else {
      completeOnboarding();
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const createHousehold = async () => {
    // Validate form
    if (!householdData.name.trim()) {
      setError('Household name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: householdData.name,
          description: householdData.description,
          address: householdData.address,
          member_count: householdData.member_count,
          created_by: user.id
        })
        .select()
        .single();
      
      if (householdError) throw householdError;
      
      // Add current user as household member with admin role
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'admin'
        });
      
      if (memberError) throw memberError;
      
      // Update user with household_id
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ household_id: household.id })
        .eq('id', user.id);
      
      if (userUpdateError) throw userUpdateError;
      
      // Set created household ID and move to next step
      setCreatedHouseholdId(household.id);
      
      // If member count is 1, skip the invitation step
      if (householdData.member_count === 1) {
        setActiveStep(2); // Skip to completion step
      } else {
        // Initialize invitation fields based on member count
        if (householdData.member_count > 1) {
          setInvitations(Array(householdData.member_count - 1).fill().map(() => ({ email: '' })));
        }
        setActiveStep(1); // Go to invitation step
      }
    } catch (err) {
      console.error('Error creating household:', err);
      setError(err.message || 'Failed to create household');
    } finally {
      setLoading(false);
    }
  };
  
  const sendInvitations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter out empty email fields
      const validInvitations = invitations.filter(inv => inv.email.trim() !== '');
      
      if (validInvitations.length > 0) {
        // Create invitations
        const invitePromises = validInvitations.map(async (inv) => {
          const { error } = await supabase
            .from('invitations')
            .insert({
              household_id: createdHouseholdId,
              inviter_id: user.id,
              invitee_email: inv.email.trim(),
              status: 'pending'
            });
          
          if (error) throw error;
        });
        
        await Promise.all(invitePromises);
      }
      
      // Move to completion step
      setActiveStep(2);
    } catch (err) {
      console.error('Error sending invitations:', err);
      setError(err.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };
  
  const completeOnboarding = async () => {
    setLoading(true);
    
    try {
      // Update user onboarding status
      const { error } = await supabase
        .from('users')
        .update({ onboard_success: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err.message || 'Failed to complete onboarding');
      setLoading(false);
    }
  };
  
  const isStepValid = () => {
    if (activeStep === 0) {
      return !!householdData.name.trim();
    }
    return true;
  };

  // Render the appropriate step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Your Household
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Let's set up your household information. This will be the central hub for all your family's activities.
            </Typography>
            
            <TextField
              fullWidth
              label="Household Name"
              name="name"
              value={householdData.name}
              onChange={handleHouseholdInputChange}
              margin="normal"
              required
              error={!householdData.name.trim()}
              helperText={!householdData.name.trim() ? "Household name is required" : ""}
            />
            
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={householdData.description}
              onChange={handleHouseholdInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Tell us a bit about your household"
            />
            
            <TextField
              fullWidth
              label="Address (Optional)"
              name="address"
              value={householdData.address}
              onChange={handleHouseholdInputChange}
              margin="normal"
              placeholder="Your household address"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Number of Household Members:
              </Typography>
              <IconButton 
                onClick={() => setHouseholdData(prev => ({ ...prev, member_count: Math.max(1, prev.member_count - 1) }))}
                disabled={householdData.member_count <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                sx={{ width: 60, mx: 1 }}
                name="member_count"
                value={householdData.member_count}
                onChange={handleHouseholdInputChange}
                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                variant="outlined"
                size="small"
              />
              <IconButton onClick={() => setHouseholdData(prev => ({ ...prev, member_count: prev.member_count + 1 }))}>
                <AddIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Including yourself
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Invite Household Members
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Invite other members to join your household. You can skip this step and invite them later if you prefer.
            </Typography>
            
            {invitations.map((invitation, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label={`Member ${index + 1} Email`}
                  type="email"
                  value={invitation.email}
                  onChange={(e) => handleInvitationChange(index, e.target.value)}
                  margin="normal"
                />
                {invitations.length > 1 && (
                  <IconButton 
                    color="error" 
                    onClick={() => removeInvitationField(index)}
                    sx={{ ml: 1 }}
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addInvitationField}
              sx={{ mt: 1 }}
            >
              Add Another Member
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Setup Complete!
            </Typography>
            <Typography variant="body1" paragraph>
              Your household has been created successfully. You can now start using all the features of the app.
            </Typography>
            {invitations.some(inv => inv.email.trim() !== '') && (
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Invitations have been sent to the email addresses you provided. Members will receive instructions on how to join your household.
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Click "Finish" to go to your dashboard.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Welcome to HousekeepIN
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Let's set up your account in just a few easy steps
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
          >
            {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
