'use client';

import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  household_id: string;
}

interface CalendarViewProps {
  initialHouseholdId: string | null;
  initialEvents: Event[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ initialHouseholdId, initialEvents }) => {
  const [events] = useState<Event[]>(initialEvents || []);
  
  if (!initialHouseholdId) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          No household found. Please set up a household to use the calendar.
        </Alert>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, minHeight: '500px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Calendar</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          Add Event
        </Button>
      </Box>
      
      {events.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography variant="body1" color="text.secondary">
            No events found. Add your first event to get started.
          </Typography>
        </Box>
      ) : (
        <Box>
          {/* Basic list of events - would be replaced with a full calendar in the complete implementation */}
          {events.map(event => (
            <Box 
              key={event.id} 
              sx={{ 
                p: 3, 
                mb: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'rgba(255, 182, 193, 0.05)'
              }}
            >
              <Typography variant="h6">{event.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(event.start_date).toLocaleDateString()}
                {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
              </Typography>
              {event.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {event.description}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          A full calendar implementation with month/week/day views would be implemented here.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Consider using a library like react-big-calendar or @fullcalendar/react for a complete calendar solution.
        </Typography>
      </Box>
    </Paper>
  );
};

export default CalendarView;
