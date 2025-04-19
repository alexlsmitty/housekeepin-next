'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskFormValues } from '@/types/database';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';

interface TaskFormProps {
  open: boolean;
  onClose: (shouldRefresh: boolean) => void;
  task: Task | null;
}

export default function TaskForm({ open, onClose, task }: TaskFormProps) {
  const { household, members } = useHousehold();
  const [formData, setFormData] = useState<TaskFormValues & { due_date: Date | null; }>({
    title: '',
    description: '',
    due_date: null,
    completed: false,
    assigned_to: '',
    household_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Populate form with task data if editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date) : null,
        completed: !!task.completed,
        assigned_to: task.assigned_to || '',
        household_id: task.household_id
      });
    } else if (household) {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        due_date: null,
        completed: false,
        assigned_to: '',
        household_id: household.id
      });
    }
  }, [task, household]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown; checked?: boolean; type?: string }>) => {
    const { name, value, checked, type } = e.target;
    const fieldName = name as string;
    setFormData({
      ...formData,
      [fieldName]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      due_date: date
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Task title is required');
      }
      
      // Prepare data for submission
      const taskData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        completed: formData.completed,
        assigned_to: formData.assigned_to || null,
        household_id: household.id
      };
      
      if (task) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id);
          
        if (error) throw error;
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);
          
        if (error) throw error;
      }
      
      onClose(true); // Close with refresh flag
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange as any}
            autoFocus
            error={!formData.title}
            helperText={!formData.title ? "Title is required" : ""}
          />
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange as any}
            multiline
            rows={3}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={formData.due_date}
              onChange={handleDateChange}
              sx={{ mt: 2, width: '100%' }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="assigned-to-label">Assigned To</InputLabel>
            <Select
              labelId="assigned-to-label"
              id="assigned-to"
              value={formData.assigned_to}
              name="assigned_to"
              label="Assigned To"
              onChange={handleInputChange as any}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name || 'Unnamed User'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.completed}
                onChange={handleInputChange as any}
                name="completed"
              />
            }
            label="Completed"
            sx={{ mt: 1 }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.title}
        >
          {loading ? <CircularProgress size={24} /> : task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
