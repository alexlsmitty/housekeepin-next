import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Email as EmailIcon } from '@mui/icons-material';

interface InviteDialogProps {
  showInviteDialog: boolean;
  inviteEmail: string;
  inviteError: string | null;
  inviteLoading: boolean;
  setInviteEmail: (email: string) => void;
  setShowInviteDialog: (show: boolean) => void;
  handleInviteSubmit: (e: React.FormEvent) => Promise<void>;
}

const InviteDialog: React.FC<InviteDialogProps> = ({
  showInviteDialog,
  inviteEmail,
  inviteError,
  inviteLoading,
  setInviteEmail,
  setShowInviteDialog,
  handleInviteSubmit,
}) => {
  const closeDialog = () => {
    setShowInviteDialog(false);
    // Reset email and error when dialog is closed
    setTimeout(() => {
      setInviteEmail('');
    }, 300);
  };
  
  return (
    <Dialog 
      open={showInviteDialog} 
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonAddIcon sx={{ mr: 1 }} />
        Invite New Member
      </DialogTitle>
      
      <form onSubmit={handleInviteSubmit}>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Enter the email address of the person you want to invite to your household.
            They will receive an invitation to join.
          </Typography>
          
          {inviteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 2 }}>
            <EmailIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="example@email.com"
              required
              variant="outlined"
              autoFocus
              InputProps={{
                autoComplete: 'email',
              }}
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            The invited user will need to create an account with this email address if they don't already have one.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeDialog} disabled={inviteLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={inviteLoading || !inviteEmail.trim()}
            startIcon={inviteLoading ? <CircularProgress size={24} /> : null}
          >
            {inviteLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteDialog;