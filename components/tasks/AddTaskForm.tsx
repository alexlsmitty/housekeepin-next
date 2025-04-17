'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  Paper,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';

interface AddTaskFormProps {
  householdId: string;
  onTaskAdded: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ householdId, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) {
      setError("Cannot add task - no household selected");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{ 
          household_id: householdId, 
          title, 
          description, 
          due_date: dueDate || null 
        }]);

      if (error) {
        throw error;
      }
      
      // Reset form and show success
      setTitle('');
      setDescription('');
      setDueDate('');
      setSuccess(true);
      onTaskAdded();
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Add New Task</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Task Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            variant="outlined"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!householdId || !title}
          >
            Add Task
          </Button>
        </Stack>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Task added successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddTaskForm;
