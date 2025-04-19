'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Fab,
  Grid,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { useHousehold } from '@/lib/hooks/useHousehold';

// Error type for householdError
interface HouseholdError {
  message: string;
  [key: string]: any;
}

export default function TasksPage() {
  const { household, loading, error: householdError } = useHousehold() as {
    household: any;
    loading: boolean;
    error: HouseholdError | null;
    refreshHousehold: () => Promise<void>;
    members: any[];
  };
  const [formOpen, setFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleCloseForm = (shouldRefresh: boolean = false) => {
    setFormOpen(false);
    setCurrentTask(null);
    
    if (shouldRefresh) {
      // Increment refresh key to force TaskList to refresh
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const handleCreateTask = () => {
    setCurrentTask(null);
    setFormOpen(true);
  };
  
  const handleEditTask = (task: any) => {
    setCurrentTask(task);
    setFormOpen(true);
  };
  
  // Render a message if no household is found
  if (!loading && !household) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          No Household Found
        </Typography>
        <Typography paragraph>
          You need to be part of a household to manage tasks. Please complete the onboarding process.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          href="/onboarding"
        >
          Go to Onboarding
        </Button>
      </Paper>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {householdError && (
        <Grid item xs={12}>
          <Alert severity="error">
            Error loading household data: {householdError.message}
          </Alert>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Tasks</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
            >
              New Task
            </Button>
          </Box>
          
          <TaskList 
            key={refreshKey} // Force refresh when tasks are updated
            onEditTask={handleEditTask} 
          />
        </Paper>
      </Grid>
      
      {/* Mobile FAB for adding tasks */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleCreateTask}
      >
        <AddIcon />
      </Fab>
      
      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen}
        onClose={handleCloseForm}
        task={currentTask}
      />
    </Grid>
  );
}
