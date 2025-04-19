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
import { Task, ApiError } from '@/types/database';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
  householdId?: string;
}

export default function TaskList({ onEditTask, householdId }: TaskListProps) {
  const { household: contextHousehold } = useHousehold();
  const household = householdId ? { id: householdId } : contextHousehold;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title'>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!household) return;
      
      try {
        setLoading(true);
        
        let query = supabase
          .from('tasks')
          .select('*')
          .eq('household_id', household.id as string);
        
        // Apply filters
        if (filter === 'completed') {
          query = query.eq('completed', true as boolean);
        } else if (filter === 'pending') {
          query = query.eq('completed', false as boolean);
        }
        
        // Apply search
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Apply sorting
        if (sortBy === 'dueDate') {
          query = query.order('due_date', { ascending: true });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Type assertion to ensure data is properly typed
        setTasks(data as Task[] || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [household, filter, sortBy, searchQuery]);

  const handleToggleComplete = async (taskId: string, currentState: boolean | null) => {
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
      setError(err as ApiError);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
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
      setError(err as ApiError);
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
            onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
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
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'title')}
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
                    {onEditTask && (
                      <IconButton edge="end" onClick={() => onEditTask(task)}>
                        <EditIcon />
                      </IconButton>
                    )}
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
