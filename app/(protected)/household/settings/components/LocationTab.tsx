import React from 'react';
import { Household, ApiError } from '@/types/database';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Save as SaveIcon
} from '@mui/icons-material';

interface LocationTabProps {
  household: Household;
  formData: {
    name: string;
    address: string;
    description: string;
    latitude: string;
    longitude: string;
  };
  formError?: string | ApiError | null;
  isAdmin: boolean;
  isFormEditable: boolean;
  formLoading: boolean;
  loadingLocation: boolean;
  locationError: string | null;
  setIsFormEditable: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  getCurrentLocation: () => void;
  geocodeAddress: () => Promise<void>;
}

const LocationTab: React.FC<LocationTabProps> = ({
  household,
  formData,
  isAdmin,
  isFormEditable,
  formLoading,
  loadingLocation,
  locationError,
  setIsFormEditable,
  handleInputChange,
  handleSubmit,
  getCurrentLocation,
  geocodeAddress,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Household Location
        </Typography>
        {!isFormEditable && (
          <Button 
            variant="contained"
            color="primary"
            startIcon={<LocationIcon />}
            onClick={() => setIsFormEditable(true)}
          >
            Update Location
          </Button>
        )}
      </Box>
      
      {isFormEditable ? (
        <form onSubmit={handleSubmit}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Update Location Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              margin="normal"
              placeholder="Enter your household address"
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={geocodeAddress}
                startIcon={<LocationIcon />}
                disabled={!formData.address || loadingLocation}
              >
                Find Coordinates from Address
              </Button>
              
              <Button
                variant="outlined"
                onClick={getCurrentLocation}
                startIcon={<MyLocationIcon />}
                disabled={loadingLocation}
              >
                Use My Current Location
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    endAdornment: loadingLocation && (
                      <CircularProgress size={20} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    endAdornment: loadingLocation && (
                      <CircularProgress size={20} />
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {locationError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {locationError}
            </Alert>
          )}
          
          {formData.latitude && formData.longitude ? (
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ width: '100%', height: '300px', border: '1px solid #ddd' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder={0}
                  scrolling="no"
                  title="Location map"
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude)-0.01}%2C${parseFloat(formData.latitude)-0.01}%2C${parseFloat(formData.longitude)+0.01}%2C${parseFloat(formData.latitude)+0.01}&amp;layer=mapnik&amp;marker=${formData.latitude}%2C${formData.longitude}`}
                ></iframe>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No coordinates entered yet. Please enter an address and get coordinates, or use your current location.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsFormEditable(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={formLoading || !formData.latitude || !formData.longitude}
              sx={{ minWidth: 180 }}
            >
              {formLoading ? <CircularProgress size={24} /> : 'Save Location'}
            </Button>
          </Box>
        </form>
      ) : (
        <Box>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Location Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{household.address || 'Not specified'}</Typography>
              </Grid>
              {household.latitude && household.longitude && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Coordinates</Typography>
                    <Typography variant="body1">
                      {household.latitude}, {household.longitude}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {household.geo_location_updated_at ? new Date(household.geo_location_updated_at).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
          
          {household.latitude && household.longitude ? (
            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Map View
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ width: '100%', height: '400px', border: '1px solid #ddd' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder={0}
                  scrolling="no"
                  title="Household location map"
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(household.longitude || 0)-0.01}%2C${(household.latitude || 0)-0.01}%2C${(household.longitude || 0)+0.01}%2C${(household.latitude || 0)+0.01}&amp;layer=mapnik&amp;marker=${household.latitude}%2C${household.longitude}`}
                ></iframe>
                <Box sx={{ mt: 1 }}>
                  <a href={`https://www.openstreetmap.org/?mlat=${household.latitude}&mlon=${household.longitude}#map=15/${household.latitude}/${household.longitude}`} target="_blank" rel="noreferrer">
                    View larger map
                  </a>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ mt: 3 }}>
              No location coordinates saved for this household. Use the &quot;Update Location&quot; button above to add location information.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LocationTab;