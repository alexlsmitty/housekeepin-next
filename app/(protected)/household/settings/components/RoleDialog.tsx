import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface RoleDialogProps {
  showRoleDialog: boolean;
  selectedMember: any | null;
  newRole: string;
  setNewRole: (role: string) => void;
  setShowRoleDialog: (show: boolean) => void;
  handleRoleChange: () => Promise<void>;
}

const RoleDialog: React.FC<RoleDialogProps> = ({
  showRoleDialog,
  selectedMember,
  newRole,
  setNewRole,
  setShowRoleDialog,
  handleRoleChange,
}) => {
  return (
    <Dialog open={showRoleDialog} onClose={() => setShowRoleDialog(false)}>
      <DialogTitle>Change Member Role</DialogTitle>
      <DialogContent>
        <Typography variant="body2" paragraph>
          Change the role of {selectedMember?.name || 'this member'} in your household.
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowRoleDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleRoleChange} 
          variant="contained" 
          color="primary"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDialog;