'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import HouseholdCalendar from '@/components/calendar/Calendar';
import EventForm from '@/components/calendar/EventForm';
import { useHousehold } from '@/lib/hooks/useHousehold';

// Error type for householdError
interface HouseholdError {
  message: string;
  [key: string]: any;
}

export default function CalendarPage() {
  const { household, loading, error: householdError } = useHousehold() as {
    household: any;
    loading: boolean;
    error: HouseholdError | null;
    refreshHousehold: () => Promise<void>;
    members: any[];
  };
  const [formOpen, setFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [viewEventOpen, setViewEventOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleCreateEvent = () => {
    setCurrentEvent(null);
    setSelectedSlot(null);
    setFormOpen(true);
  };
  
  const handleSelectEvent = (event: any) => {
    console.log('Selected event:', event); // Add logging to debug event structure
    setCurrentEvent(event);
    if (event && event.type === 'task') {
      // For tasks, just show details
      setViewEventOpen(true);
    } else {
      // For events, open the edit form
      setFormOpen(true);
    }
  };
  
  const handleSelectSlot = (slotInfo: any) => {
    setCurrentEvent(null);
    setSelectedSlot(slotInfo);
    setFormOpen(true);
  };
  
  const handleCloseForm = (shouldRefresh: boolean = false) => {
    setFormOpen(false);
    setCurrentEvent(null);
    setSelectedSlot(null);
    
    if (shouldRefresh) {
      // Increment refresh key to force calendar to refresh
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const closeViewEvent = () => {
    setViewEventOpen(false);
    setCurrentEvent(null);
  };
  
  // Render a message if no household is found
  if (!loading && !household) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          No Household Found
        </Typography>
        <Typography paragraph>
          You need to be part of a household to manage calendar events. Please complete the onboarding process.
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
            <Typography variant="h5">Calendar</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateEvent}
            >
              New Event
            </Button>
          </Box>
          
          <HouseholdCalendar 
            key={refreshKey} // Force refresh when events are updated
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </Paper>
      </Grid>
      
      {/* Mobile FAB for adding events */}
      <Fab
        color="primary"
        aria-label="add event"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleCreateEvent}
      >
        <AddIcon />
      </Fab>
      
      {/* Event Form Dialog */}
      <EventForm
        open={formOpen}
        onClose={handleCloseForm}
        event={currentEvent}
        selectedSlot={selectedSlot}
      />
      
      {/* Task View Dialog */}
      {currentEvent && currentEvent.type === 'task' && (
        <Dialog open={viewEventOpen} onClose={closeViewEvent} maxWidth="sm" fullWidth>
          <DialogTitle>Task Details</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              {currentEvent.title.replace('📋 ', '')}
            </Typography>
            {currentEvent.description && (
              <Typography variant="body1" paragraph>
                {currentEvent.description}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Due: {new Date(currentEvent.start_date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {currentEvent.completed ? 'Completed' : 'Pending'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeViewEvent}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                closeViewEvent();
                // Navigate to tasks page
                window.location.href = '/tasks';
              }}
            >
              Go to Tasks
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Grid>
  );
}
