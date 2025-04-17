import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Mail as MailIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface InvitationsTabProps {
  pendingInvitations: any[];
  loadingInvitations: boolean;
  setShowInviteDialog: (show: boolean) => void;
  handleCancelInvitation: (invitationId: string) => Promise<void>;
}

const InvitationsTab: React.FC<InvitationsTabProps> = ({
  pendingInvitations,
  loadingInvitations,
  setShowInviteDialog,
  handleCancelInvitation,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Pending Invitations
        </Typography>
        <Button 
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setShowInviteDialog(true)}
        >
          Invite Member
        </Button>
      </Box>
      
      {loadingInvitations ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : pendingInvitations.length > 0 ? (
        <List>
          {pendingInvitations.map((invitation) => (
            <ListItem 
              key={invitation.id}
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <MailIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={invitation.invitee_email}
                secondary={`Sent: ${new Date(invitation.sent_at).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="cancel" 
                  onClick={() => handleCancelInvitation(invitation.id)}
                  color="error"
                >
                  <CancelIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No pending invitations
        </Typography>
      )}
    </Box>
  );
};

export default InvitationsTab;