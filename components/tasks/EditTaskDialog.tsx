'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { supabase } from '@/lib/supabase/client';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  completed?: boolean;
  household_id: string;
}

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated: () => void;
}

function EditTaskDialog({ open, onClose, task, onTaskUpdated }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.substring(0, 10) : '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [status, setStatus] = useState(task.status || 'pending');
  const [completed, setCompleted] = useState(task.completed || false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date ? task.due_date.substring(0, 10) : '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'pending');
      setCompleted(task.completed || false);
    }
  }, [task]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title, 
          description, 
          due_date: dueDate || null,
          priority,
          status,
          completed
        })
        .eq('id', task.id);
        
      if (error) throw error;
      
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <TextField 
          label="Title" 
          fullWidth 
          margin="normal" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required
        />
        <TextField 
          label="Description" 
          fullWidth 
          margin="normal" 
          multiline 
          rows={3} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <TextField 
          label="Due Date" 
          type="date" 
          fullWidth 
          margin="normal" 
          InputLabelProps={{ shrink: true }}
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Completed</InputLabel>
          <Select
            value={completed ? 'yes' : 'no'}
            label="Completed"
            onChange={(e) => setCompleted(e.target.value === 'yes')}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTaskDialog;
