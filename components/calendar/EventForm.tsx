'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker, DatePicker } from '@mui/x-date-pickers';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';

export default function EventForm({ open, onClose, event, selectedSlot }) {
  const { household } = useHousehold();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: null,
    end_date: null,
    isAllDay: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Populate form with event data if editing or from selected slot
  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_date: event.start || new Date(event.start_date) || null,
        end_date: event.end || (event.end_date ? new Date(event.end_date) : null),
        isAllDay: event.allDay || false
      });
    } else if (selectedSlot) {
      // Creating event from selected time slot
      setFormData({
        title: '',
        description: '',
        start_date: selectedSlot.start || new Date(),
        end_date: selectedSlot.end || new Date(),
        isAllDay: selectedSlot.slots ? selectedSlot.slots.length > 1 : false
      });
    } else {
      // New event with current time
      const now = new Date();
      const oneHourLater = new Date(now);
      oneHourLater.setHours(oneHourLater.getHours() + 1);
      
      setFormData({
        title: '',
        description: '',
        start_date: now,
        end_date: oneHourLater,
        isAllDay: false
      });
    }
  }, [event, selectedSlot]);
  
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleStartDateChange = (date) => {
    setFormData({
      ...formData,
      start_date: date
    });
  };
  
  const handleEndDateChange = (date) => {
    setFormData({
      ...formData,
      end_date: date
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!household) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Event title is required');
      }
      
      if (!formData.start_date) {
        throw new Error('Start date is required');
      }
      
      // Prepare data
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date.toISOString(),
        end_date: formData.isAllDay ? null : formData.end_date.toISOString(),
        household_id: household.id
      };
      
      if (event && event.type === 'event') {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);
          
        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
          
        if (error) throw error;
      }
      
      onClose(true); // Close with refresh flag
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {event && event.type === 'event' ? 'Edit Event' : 'Create New Event'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            multiline
            rows={3}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isAllDay}
                onChange={handleInputChange}
                name="isAllDay"
              />
            }
            label="All Day Event"
            sx={{ mt: 1, mb: 1 }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={formData.isAllDay ? 12 : 6}>
                {formData.isAllDay ? (
                  <DatePicker
                    label="Event Date"
                    value={formData.start_date}
                    onChange={handleStartDateChange}
                    sx={{ mt: 1, width: '100%' }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                ) : (
                  <DateTimePicker
                    label="Start Date & Time"
                    value={formData.start_date}
                    onChange={handleStartDateChange}
                    sx={{ mt: 1, width: '100%' }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              </Grid>
              {!formData.isAllDay && (
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="End Date & Time"
                    value={formData.end_date}
                    onChange={handleEndDateChange}
                    sx={{ mt: 1, width: '100%' }}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDateTime={formData.start_date}
                  />
                </Grid>
              )}
            </Grid>
          </LocalizationProvider>
          
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
          disabled={loading || !formData.title || !formData.start_date}
        >
          {loading ? <CircularProgress size={24} /> : event ? 'Update Event' : 'Create Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
