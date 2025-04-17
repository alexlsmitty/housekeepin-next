'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';

export default function TaskList({ onEditTask }) {
  const { household } = useHousehold();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, title
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!household) return;
      
      try {
        setLoading(true);
        
        let query = supabase
          .from('tasks')
          .select('*')
          .eq('household_id', household.id);
        
        // Apply filters
        if (filter === 'completed') {
          query = query.eq('completed', true);
        } else if (filter === 'pending') {
          query = query.eq('completed', false);
        }
        
        // Apply search
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Apply sorting
        if (sortBy === 'dueDate') {
          query = query.order('due_date', { ascending: true, nullsLast: true });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setTasks(data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [household, filter, sortBy, searchQuery]);

  const handleToggleComplete = async (taskId, currentState) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentState })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !currentState } : task
      ));
    } catch (err) {
      console.error('Error toggling task completion:', err);
      setError(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err);
    }
  };

  if (loading && !tasks.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error.message}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="dueDate">Due Date</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {tasks.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
          No tasks found. Create a new task to get started.
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {tasks.map((task) => {
            const labelId = `task-${task.id}`;

            return (
              <ListItem
                key={task.id}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" onClick={() => onEditTask(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                disablePadding
              >
                <ListItemButton role={undefined} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={!!task.completed}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                      onChange={() => handleToggleComplete(task.id, task.completed)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      <Typography 
                        component="span" 
                        sx={{ 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        {task.description && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ display: 'block' }}
                          >
                            {task.description}
                          </Typography>
                        )}
                        {task.due_date && (
                          <Typography
                            component="span"
                            variant="body2"
                            color={
                              new Date(task.due_date) < new Date() && !task.completed
                                ? 'error.main'
                                : 'text.secondary'
                            }
                          >
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}
