'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';

export default function UserSettings() {
  const { user: authUser, profile: authProfile } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  
  // Form data states
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    bio: '',
    theme_preference: 'light',
    avatar_color: '#3f51b5'
  });
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true
  });
  
  const [isEditable, setIsEditable] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch full user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userError) throw userError;
        
        if (userData) {
          setProfileData({
            full_name: userData.full_name || '',
            email: userData.email || authUser.email || '',
            phone_number: userData.phone_number || '',
            bio: userData.bio || '',
            theme_preference: userData.theme_preference || 'light',
            avatar_color: userData.avatar_color || '#3f51b5'
          });
          
          // Parse notification preferences if they exist
          if (userData.notification_preferences) {
            try {
              const parsedPrefs = typeof userData.notification_preferences === 'string' 
                ? JSON.parse(userData.notification_preferences)
                : userData.notification_preferences;
                
              setNotificationPreferences({
                email: parsedPrefs.email !== undefined ? parsedPrefs.email : true,
                push: parsedPrefs.push !== undefined ? parsedPrefs.push : true
              });
            } catch (err) {
              console.error('Error parsing notification preferences:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [authUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences({
      ...notificationPreferences,
      [name]: checked
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authUser) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    setUpdateLoading(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData = {
        full_name: profileData.full_name,
        phone_number: profileData.phone_number,
        bio: profileData.bio,
        theme_preference: profileData.theme_preference,
        avatar_color: profileData.avatar_color,
        notification_preferences: notificationPreferences
      };
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', authUser.id);
      
      if (updateError) throw updateError;
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      setIsEditable(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setSuccessMessage('');
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!authUser) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Not Logged In
        </Typography>
        <Typography paragraph>
          You need to be logged in to access your profile settings.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={() => router.push('/login')}
        >
          Go to Login
        </Button>
      </Paper>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Grid>
      )}
      
      {/* Profile Summary Card */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: profileData.avatar_color,
              fontSize: '3rem',
              mb: 2
            }}
          >
            {getInitials(profileData.full_name)}
          </Avatar>
          
          <Typography variant="h5" sx={{ mb: 1 }}>
            {profileData.full_name || 'User'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            {profileData.bio || 'No bio provided'}
          </Typography>
          
          <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
            {!isEditable ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditable(true)}
                fullWidth
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditable(false)}
                color="secondary"
                fullWidth
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>
      
      {/* Profile Details Form */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Profile Settings
            </Typography>
            {isEditable && (
              <Tooltip title="Save changes">
                <IconButton 
                  color="primary"
                  onClick={handleSubmit}
                  disabled={updateLoading}
                >
                  {updateLoading ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic Info Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  disabled={true} // Email should not be editable here
                  helperText="Email cannot be changed here"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  disabled={!isEditable}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* Appearance Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaletteIcon sx={{ mr: 1 }} />
                  Appearance
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditable}>
                  <InputLabel id="theme-preference-label">Theme Preference</InputLabel>
                  <Select
                    labelId="theme-preference-label"
                    id="theme_preference"
                    name="theme_preference"
                    value={profileData.theme_preference}
                    onChange={handleInputChange}
                    label="Theme Preference"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <InputLabel htmlFor="avatar-color" sx={{ mb: 1 }}>Avatar Color</InputLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: '50%', 
                          bgcolor: profileData.avatar_color,
                          mr: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }} 
                      />
                      <TextField
                        id="avatar-color"
                        name="avatar_color"
                        type="color"
                        value={profileData.avatar_color}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        sx={{ 
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            height: 40
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* Notifications Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Notification Preferences
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.email}
                      onChange={handleNotificationChange}
                      name="email"
                      color="primary"
                      disabled={!isEditable}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.push}
                      onChange={handleNotificationChange}
                      name="push"
                      color="primary"
                      disabled={!isEditable}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              
              {isEditable && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateLoading}
                      startIcon={updateLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Grid>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
