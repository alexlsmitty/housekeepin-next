'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import {
  BasicInfoTab,
  LocationTab,
  MembersTab,
  InvitationsTab,
  InviteDialog,
  RoleDialog
} from './components';

export default function HouseholdSettings() {
  const { household, members, loading, error: householdError, refreshHousehold } = useHousehold();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [isFormEditable, setIsFormEditable] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState(0);
  
  // Location management state
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Current user state
  const [currentUser, setCurrentUser] = useState(null);
  
  // Member management state
  const [currentUserRole, setCurrentUserRole] = useState('member');
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  
  // Invitation dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Role management dialog state
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Enhanced location update logic
  const handleLocationUpdate = async (formData: {
    address: string;
    latitude: string;
    longitude: string;
  }, household: { id: string }) => {
    // Prepare location update data with enhanced validation
    const updateData: {
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
      geo_location_updated_at?: string;
    } = {
      address: formData.address || undefined,
    };

    // Validate and parse latitude
    if (formData.latitude && !isNaN(parseFloat(formData.latitude))) {
      updateData.latitude = parseFloat(formData.latitude);
    } else {
      updateData.latitude = null;
    }

    // Validate and parse longitude
    if (formData.longitude && !isNaN(parseFloat(formData.longitude))) {
      updateData.longitude = parseFloat(formData.longitude);
    } else {
      updateData.longitude = null;
    }

    // Always add the timestamp when updating location
    updateData.geo_location_updated_at = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('households')
        .update(updateData)
        .eq('id', household.id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error updating household location:', err);
      throw err;
    }
  };

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    fetchCurrentUser();
  }, []);

  // Set form data when household data is loaded
  useEffect(() => {
    if (household) {
      setFormData({
        name: household.name || '',
        address: household.address || '',
        description: household.description || '',
        latitude: household.latitude ? household.latitude.toString() : '',
        longitude: household.longitude ? household.longitude.toString() : ''
      });
    }
  }, [household]);
  
  // Load current user role and pending invitations
  useEffect(() => {
    const fetchUserRoleAndInvitations = async () => {
      if (!household || !members || !currentUser) return;
      
      try {
        // Find current user's role
        const currentMember = members.find(m => m.user_id === currentUser.id);
        
        if (currentMember) {
          console.log('Current member found:', currentMember);
          setCurrentUserRole(currentMember.role);
          
          // If user is admin, load pending invitations
          if (currentMember.role === 'admin') {
            setLoadingInvitations(true);
            
            const { data: invitationsData, error: invitationsError } = await supabase
              .from('invitations')
              .select('*')
              .eq('household_id', household.id)
              .eq('status', 'pending');
              
            if (invitationsError) throw invitationsError;
            
            setPendingInvitations(invitationsData || []);
            setLoadingInvitations(false);
          }
        } else {
          console.warn('Current user is not found in the household members');
        }
      } catch (err) {
        console.error('Error fetching user role and invitations:', err);
      }
    };
    
    fetchUserRoleAndInvitations();
  }, [household, members, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to get the current location from browser
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setLoadingLocation(false);
      }
    );
  };
  
  // Function to geocode an address to coordinates
  const geocodeAddress = async () => {
    if (!formData.address) {
      setLocationError('Please enter an address to geocode');
      return;
    }
    
    setLoadingLocation(true);
    setLocationError(null);
    
    try {
      // Use the Nominatim API for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setLocationError('No results found for this address');
        setLoadingLocation(false);
        return;
      }
      
      // Use the first result
      setFormData(prev => ({
        ...prev,
        latitude: data[0].lat,
        longitude: data[0].lon
      }));
      
    } catch (err) {
      console.error('Geocoding error:', err);
      setLocationError(err.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset the form editable state when changing tabs
    setIsFormEditable(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!household) return;
    
    setFormLoading(true);
    setFormError(null);
    
    try {
      // Check which tab we're on to determine what fields to update
      if (activeTab === 0) {
        // Basic Info tab - only update name, address, description
        const updateData = {
          name: formData.name,
          address: formData.address,
          description: formData.description,
        };
        
        const { error } = await supabase
          .from('households')
          .update(updateData)
          .eq('id', household.id);
        
        if (error) throw error;
      } else if (activeTab === 1) {
        // Location tab - use new enhanced location update
        await handleLocationUpdate(formData, household);
      } else {
        // If not on a valid tab, this shouldn't be called
        throw new Error('Invalid form submission');
      }
      
      // Refresh household data
      await refreshHousehold();
      
      // Show success message
      setSuccessMessage(
        activeTab === 1 
          ? 'Household location updated successfully' 
          : 'Household details updated successfully'
      );
      
      setIsFormEditable(false);
    } catch (err) {
      console.error('Error updating household:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle invitation submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!household || !currentUser) return;
    
    setInviteLoading(true);
    setInviteError(null);
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Check if this email belongs to an existing user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', inviteEmail)
        .limit(1);
      
      if (userError) throw userError;
      
      // Check if already a member
      if (userData && userData.length > 0) {
        const isMember = members.some(m => m.user_id === userData[0].id);
        
        if (isMember) {
          throw new Error('This user is already a member of the household');
        }
      }
      
      // Check if already invited
      const isInvited = pendingInvitations.some(i => 
        i.invitee_email.toLowerCase() === inviteEmail.toLowerCase()
      );
      
      if (isInvited) {
        throw new Error('An invitation has already been sent to this email');
      }
      
      // Create invitation
      const { error } = await supabase
        .from('invitations')
        .insert({
          household_id: household.id,
          inviter_id: currentUser.id,
          invitee_email: inviteEmail,
          status: 'pending',
        });
      
      if (error) throw error;
      
      // Refresh invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('household_id', household.id)
        .eq('status', 'pending');
        
      if (invitationsError) throw invitationsError;
      
      setPendingInvitations(invitationsData || []);
      
      // Close dialog and reset email
      setShowInviteDialog(false);
      setInviteEmail('');
      
      // Show success message
      setSuccessMessage('Invitation sent successfully');
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle canceling an invitation
  const handleCancelInvitation = async (invitationId) => {
    if (!household) return;
    
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
      
      // Refresh invitations
      setPendingInvitations(pendingInvitations.filter(i => i.id !== invitationId));
      
      // Show success message
      setSuccessMessage('Invitation canceled successfully');
      
    } catch (err) {
      console.error('Error canceling invitation:', err);
      setFormError(err.message);
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (member) => {
    if (!household || !currentUser) return;
    
    try {
      // Cannot remove yourself if you're the last admin
      if (
        member.user_id === currentUser.id && 
        member.role === 'admin' && 
        members.filter(m => m.role === 'admin').length <= 1
      ) {
        throw new Error('You cannot remove yourself as you are the last admin');
      }
      
      // Remove from household_members table
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', member.id);
      
      if (error) throw error;
      
      // If removing themselves, redirect to dashboard
      if (member.user_id === currentUser.id) {
        router.push('/dashboard');
        return;
      }
      
      // Otherwise refresh household data
      await refreshHousehold();
      
      // Show success message
      setSuccessMessage('Member removed successfully');
      
    } catch (err) {
      console.error('Error removing member:', err);
      setFormError(err.message);
    }
  };

  // Open role dialog for a member
  const openRoleDialog = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setShowRoleDialog(true);
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!household || !selectedMember) return;
    
    try {
      // Check if last admin is trying to change their role
      if (
        selectedMember.role === 'admin' && 
        newRole !== 'admin' && 
        members.filter(m => m.role === 'admin').length <= 1
      ) {
        throw new Error('Cannot change role of the last admin');
      }
      
      // Update role
      const { error } = await supabase
        .from('household_members')
        .update({ role: newRole })
        .eq('id', selectedMember.id);
      
      if (error) throw error;
      
      // Refresh household data
      await refreshHousehold();
      
      // Close dialog and reset
      setShowRoleDialog(false);
      setSelectedMember(null);
      
      // Show success message
      setSuccessMessage('Role updated successfully');
      
    } catch (err) {
      console.error('Error updating role:', err);
      setFormError(err.message);
    }
  };

  // Handle opening invite dialog from any tab
  const handleOpenInviteDialog = () => {
    setInviteError(null);
    setInviteEmail('');
    setShowInviteDialog(true);
  };

  // Handle close success message
  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };

  // If loading or error, show appropriate UI
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (householdError || !household) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {householdError || 'Failed to load household data'}
      </Alert>
    );
  }

  // Debugging
  console.log('Current User Role:', currentUserRole);
  console.log('Members:', members);

  const isAdmin = currentUserRole === 'admin';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Household Settings
          </Typography>
          {isAdmin && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenInviteDialog}
              startIcon={<PersonAddIcon />}
            >
              Invite New Member
            </Button>
          )}
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Basic Info" />
            <Tab label="Location" />
            <Tab label="Members" />
            {isAdmin && <Tab label="Invitations" />}
          </Tabs>
          
          {/* Basic Info Tab */}
          {activeTab === 0 && (
            <BasicInfoTab
              household={household}
              formData={formData}
              isAdmin={isAdmin}
              isFormEditable={isFormEditable}
              formLoading={formLoading}
              formError={formError}
              setIsFormEditable={setIsFormEditable}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          )}
          
          {/* Location Tab */}
          {activeTab === 1 && (
            <LocationTab
              household={household}
              formData={formData}
              isAdmin={isAdmin}
              isFormEditable={isFormEditable}
              formLoading={formLoading}
              formError={formError || locationError}
              loadingLocation={loadingLocation}
              setIsFormEditable={setIsFormEditable}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              getCurrentLocation={getCurrentLocation}
              geocodeAddress={geocodeAddress}
            />
          )}
          
          {/* Members Tab */}
          {activeTab === 2 && (
            <MembersTab
              members={members}
              isAdmin={isAdmin}
              currentUser={currentUser}
              setShowInviteDialog={setShowInviteDialog}
              openRoleDialog={openRoleDialog}
              handleRemoveMember={handleRemoveMember}
            />
          )}
          
          {/* Invitations Tab - Only for admins */}
          {activeTab === 3 && isAdmin && (
            <InvitationsTab
              pendingInvitations={pendingInvitations}
              loadingInvitations={loadingInvitations}
              setShowInviteDialog={setShowInviteDialog}
              handleCancelInvitation={handleCancelInvitation}
            />
          )}
        </Paper>
      </Grid>
      
      {/* Invite Dialog */}
      <InviteDialog
        showInviteDialog={showInviteDialog}
        inviteEmail={inviteEmail}
        inviteError={inviteError}
        inviteLoading={inviteLoading}
        setInviteEmail={setInviteEmail}
        setShowInviteDialog={setShowInviteDialog}
        handleInviteSubmit={handleInviteSubmit}
      />
      
      {/* Role Dialog */}
      <RoleDialog
        showRoleDialog={showRoleDialog}
        selectedMember={selectedMember}
        newRole={newRole}
        setNewRole={setNewRole}
        setShowRoleDialog={setShowRoleDialog}
        handleRoleChange={handleRoleChange}
      />
      
      {/* Success message toast */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSuccessMessage}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert 
          onClose={handleCloseSuccessMessage} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
