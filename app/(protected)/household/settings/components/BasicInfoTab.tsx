import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';

interface BasicInfoTabProps {
  household: { 
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    member_count: number | null;
  };
  formData: {
    name: string;
    address: string;
    description: string;
    latitude: string;
    longitude: string;
  };
  isAdmin: boolean;
  isFormEditable: boolean;
  formLoading: boolean;
  formError: string | null;
  setIsFormEditable: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  household,
  formData,
  isAdmin,
  isFormEditable,
  formLoading,
  formError,
  setIsFormEditable,
  handleInputChange,
  handleSubmit,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Household Details
        </Typography>
        {isAdmin && (
          <Button 
            variant={isFormEditable ? "outlined" : "contained"}
            color={isFormEditable ? "secondary" : "primary"}
            onClick={() => setIsFormEditable(!isFormEditable)}
          >
            {isFormEditable ? "Cancel" : "Edit Details"}
          </Button>
        )}
      </Box>
      
      {isFormEditable ? (
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Household Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            required
            error={!formData.name}
            helperText={!formData.name ? "Household name is required" : ""}
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={3}
          />
          
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={formLoading || !formData.name}
          >
            {formLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </form>
      ) : (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">Name</Typography>
              <Typography variant="body1">{household.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography variant="body1">{household.address || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">Member Count</Typography>
              <Typography variant="body1">{household.member_count || 0}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Description</Typography>
              <Typography variant="body1">{household.description || 'No description'}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default BasicInfoTab;