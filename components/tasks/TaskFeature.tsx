'use client';

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useAuthContext } from '@/components/AuthProvider';
import AddTaskForm from './AddTaskForm';
import TaskList from './TaskList';

interface TaskFeatureProps {
  initialHouseholdId: string | null;
}

const TaskFeature: React.FC<TaskFeatureProps> = ({ initialHouseholdId }) => {
  const { user } = useAuthContext();
  const [showAddTask, setShowAddTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [householdId] = useState<string | null>(initialHouseholdId);

  // Callback when a task is added to refresh the task list
  const handleTaskAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setShowAddTask(false);
  };

  if (!householdId) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6" color="error">
          No household found for your account. Please set up a household first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Button
        variant="contained"
        onClick={() => setShowAddTask((prev) => !prev)}
        sx={{ mb: 2 }}
      >
        {showAddTask ? 'Hide Add Task Form' : 'Add Task'}
      </Button>
      
      {showAddTask && (
        <AddTaskForm householdId={householdId} onTaskAdded={handleTaskAdded} />
      )}

      {/* Refresh TaskList when refreshKey changes */}
      <TaskList householdId={householdId} key={refreshKey} />
    </Box>
  );
};

export default TaskFeature;
