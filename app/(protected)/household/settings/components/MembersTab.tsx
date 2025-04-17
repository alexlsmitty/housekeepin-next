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
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

interface MembersTabProps {
  members: any[];
  isAdmin: boolean;
  currentUser: any;
  setShowInviteDialog: (show: boolean) => void;
  openRoleDialog: (member: any) => void;
  handleRemoveMember: (member: any) => Promise<void>;
}

const MembersTab: React.FC<MembersTabProps> = ({
  members,
  isAdmin,
  currentUser,
  setShowInviteDialog,
  openRoleDialog,
  handleRemoveMember,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Household Members
        </Typography>
        {isAdmin && (
          <Button 
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setShowInviteDialog(true)}
          >
            Invite Member
          </Button>
        )}
      </Box>
      
      {members && members.length > 0 ? (
        <List>
          {members.map((member) => {
            // Check if current user is available before using it
            const isCurrentUser = currentUser ? member.user_id === currentUser.id : false;
            
            return (
              <ListItem 
                key={member.id}
                sx={{ 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  ...(isCurrentUser && { bgcolor: 'action.selected' })
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {member.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                      {member.name || 'Unnamed User'}
                      {isCurrentUser && (
                        <Chip size="small" label="You" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={member.role}
                        color={member.role === 'admin' ? 'primary' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <Typography component="span" variant="body2">
                        Joined: {new Date(member.joined_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                {isAdmin && (
                  <ListItemSecondaryAction>
                    {(!isCurrentUser || (isCurrentUser && members.filter(m => m.role === 'admin').length > 1)) ? (
                      <>
                        <Button
                          size="small"
                          onClick={() => openRoleDialog(member)}
                          sx={{ mr: 1 }}
                        >
                          Change Role
                        </Button>
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleRemoveMember(member)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : isCurrentUser && member.role === 'admin' && members.filter(m => m.role === 'admin').length <= 1 ? (
                      <Tooltip title="You are the last admin and cannot be removed">
                        <Chip 
                          label="Last Admin" 
                          size="small" 
                          color="primary"
                        />
                      </Tooltip>
                    ) : null}
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No members found
        </Typography>
      )}
    </Box>
  );
};

export default MembersTab;