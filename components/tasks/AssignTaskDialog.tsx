'use client';

import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Avatar, ListItemAvatar } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import { Person as PersonIcon } from '@mui/icons-material';

import { Task as DBTask } from '@/types/database';

interface Task extends Pick<DBTask, 'id' | 'title'> {
  assigned_to?: string | null;
}

interface User {
  id: string;
  name?: string;
  email: string;
}

interface AssignTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  householdId: string;
  onTaskUpdated: () => void;
}

function AssignTaskDialog({ open, onClose, task, householdId, onTaskUpdated }: AssignTaskDialogProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(task.assigned_to || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!householdId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user information for household members
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('household_id', householdId);
        
        if (error) throw error;
        
        if (users) {
          setMembers(users);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Error fetching household members:", err);
        setError(err instanceof Error ? err.message : "Failed to load household members");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchMembers();
    }
  }, [householdId, open]);

  const handleAssign = async () => {
    if (!selectedMemberId) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: selectedMemberId })
        .eq('id', task.id);
      
      if (error) throw error;
      
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error assigning task:", err);
      setError(err instanceof Error ? err.message : "Failed to assign task");
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId === selectedMemberId ? null : memberId);
  };

  const handleRemoveAssignment = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('id', task.id);
      
      if (error) throw error;
      
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error removing assignment:", err);
      setError(err instanceof Error ? err.message : "Failed to remove assignment");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Task: {task.title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : members.length === 0 ? (
          <Typography variant="body1" sx={{ p: 2 }}>
            No household members found.
          </Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Select a household member to assign this task:
            </Typography>
            <List sx={{ width: '100%' }}>
              {members.map(member => (
                <ListItem 
                  key={member.id}
                  button
                  onClick={() => handleSelectMember(member.id)}
                  selected={selectedMemberId === member.id}
                  sx={{ 
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(160, 231, 229, 0.2)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: selectedMemberId === member.id ? 'primary.main' : 'grey.300' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={member.name || 'Unnamed User'} 
                    secondary={member.email} 
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {task.assigned_to && (
          <Button onClick={handleRemoveAssignment} color="error">
            Remove Assignment
          </Button>
        )}
        <Button 
          onClick={handleAssign} 
          variant="contained" 
          color="primary"
          disabled={!selectedMemberId || selectedMemberId === task.assigned_to}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AssignTaskDialog;
