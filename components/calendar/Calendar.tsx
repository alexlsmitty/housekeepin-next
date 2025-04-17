'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  parseISO, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { 
  Add as AddIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  AssignmentTurnedIn as TaskIcon
} from '@mui/icons-material';

// Type definitions for better type safety
interface CalendarEvent {
  id: string | number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  household_id?: string;
  created_at?: string;
  type?: string;
  temp?: boolean;
  completed?: boolean;
}

export default function Calendar({ onSelectEvent, onSelectSlot }) {
  const { household } = useHousehold();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(new Date().getTime() + 60*60*1000), "yyyy-MM-dd'T'HH:mm"),
    isAllDay: false
  });

  // Memoized fetchEvents function
  const fetchEvents = useCallback(async () => {
    if (!household) return;
    
    try {
      setRefreshing(true);
      
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Optimize query - use timestamp range for better performance
      // Fetch from the events table
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('household_id', household.id)
        .gte('start_date', monthStart.toISOString())
        .lte('start_date', monthEnd.toISOString());
      
      if (eventsError) throw eventsError;
      
      // Fetch tasks with due dates in this month range
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('household_id', household.id)
        .not('due_date', 'is', null)
        .gte('due_date', monthStart.toISOString().split('T')[0])
        .lte('due_date', monthEnd.toISOString().split('T')[0]);
      
      if (tasksError) throw tasksError;
      
      // Combine events and tasks
      const combinedEvents: CalendarEvent[] = [
        ...(eventsData || []).map(event => ({
          ...event,
          type: 'event'
        })),
        ...(tasksData || []).map(task => ({
          id: `task-${task.id}`,
          title: `📋 ${task.title}`,
          description: task.description,
          start_date: `${task.due_date}T00:00:00`,
          type: 'task',
          completed: task.completed
        }))
      ];
      
      setEvents(combinedEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err.message || 'Failed to load calendar events');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [household, currentMonth]);

  // Fetch events when component mounts or dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    // If you have a callback for date selection
    if (onSelectSlot) {
      onSelectSlot({ start: day });
    }
  };

  const openEventDetails = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    
    // Use the component's own modal for details if no callback provided
    if (!onSelectEvent) {
      setShowEventDetailsModal(true);
    } else {
      // Otherwise use the parent's callback
      onSelectEvent(event);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || selectedEvent.type === 'task') return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id);
        
      if (error) throw error;
      
      // Remove from local state
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      
      // Close modals
      setDeleteConfirmOpen(false);
      setShowEventDetailsModal(false);
      setSelectedEvent(null);
      
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!newEvent.title.trim()) {
      alert('Event title is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format the dates consistently
      const startDate = new Date(newEvent.startTime).toISOString();
      const endDate = new Date(newEvent.endTime).toISOString();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create temporary ID for optimistic update
      const tempId = 'temp-' + Date.now();
      
      // Add to local state first (optimistic update)
      const tempEvent: CalendarEvent = {
        id: tempId,
        title: newEvent.title,
        description: newEvent.description,
        start_date: startDate,
        end_date: endDate,
        household_id: household?.id,
        type: 'event',
        temp: true
      };
      
      setEvents(prev => [...prev, tempEvent]);
      
      // Close dialog and reset form
      setShowEventModal(false);
      
      // Insert into database - using the events table
      const { data, error } = await supabase
        .from('events')
        .insert({
          household_id: household?.id,
          title: newEvent.title,
          description: newEvent.description,
          start_date: startDate,
          end_date: endDate
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Replace temp event with real one
      setEvents(prev => 
        prev.map(event => event.id === tempId ? { ...data, type: 'event' } : event)
      );
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(new Date().getTime() + 60*60*1000), "yyyy-MM-dd'T'HH:mm"),
        isAllDay: false
      });
      
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Remove temp event on error
      setEvents(prev => prev.filter(event => !(event.temp)));
      
      alert('Failed to create event: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar rendering functions
  const renderHeader = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 1, 
        bgcolor: 'primary.main', 
        color: 'white', 
        borderRadius: 1
      }}>
        <IconButton 
          onClick={prevMonth} 
          sx={{ color: 'white' }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton 
          onClick={nextMonth} 
          sx={{ color: 'white' }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <Grid item key={i} xs={12/7} 
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            p: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
          <Typography variant="body2">
            {format(addDays(startDate, i), dateFormat)}
          </Typography>
        </Grid>
      );
    }

    return (
      <Grid container>
        {days}
      </Grid>
    );
  };

  const formatEventTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm');
    } catch (e) {
      console.error("Date parsing error:", e);
      return "00:00";
    }
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, 'd');
        
        // Filter events for this day
        const dayEvents = events.filter(event => {
          try {
            const eventDate = parseISO(event.start_date);
            return isSameDay(eventDate, day);
          } catch (e) {
            console.error("Error parsing event date:", e, event);
            return false;
          }
        });

        // Sort events by time
        dayEvents.sort((a, b) => {
          try {
            return parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime();
          } catch (e) {
            return 0;
          }
        });

        days.push(
          <Grid item xs={12/7} key={day.toString()} 
            onClick={() => onDateClick(cloneDay)}
            sx={{ 
              minHeight: 120,
              p: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: !isSameMonth(day, monthStart) 
                ? 'action.disabledBackground' 
                : isSameDay(day, selectedDate)
                ? 'primary.light'
                : isToday(day)
                ? 'info.lighter'
                : 'background.paper',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontWeight: isToday(day) ? 'bold' : 'medium',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  ...(isToday(day) && {
                    bgcolor: 'primary.main',
                    color: 'white'
                  })
                }}
              >
                {formattedDate}
              </Typography>
              
              {isSameMonth(day, monthStart) && (
                <Tooltip title="Add event">
                  <IconButton 
                    size="small"
                    color="primary"
                    sx={{ 
                      minWidth: 24, 
                      height: 24, 
                      p: 0
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Set time to current time but date to the selected day
                      const now = new Date();
                      const startTime = new Date(cloneDay);
                      startTime.setHours(now.getHours());
                      startTime.setMinutes(now.getMinutes());
                      
                      const endTime = new Date(startTime);
                      endTime.setHours(endTime.getHours() + 1);
                      
                      setNewEvent(prev => ({ 
                        ...prev, 
                        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
                        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm") 
                      }));
                      setShowEventModal(true);
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            <Box sx={{ mt: 1, maxHeight: 85, overflowY: 'auto' }}>
              {dayEvents.map((event) => {
                const eventTime = formatEventTime(event.start_date);
                const isTask = event.type === 'task';
                const isCompleted = isTask && event.completed;
                
                return (
                  <Paper 
                    key={event.id} 
                    elevation={0}
                    onClick={(e) => openEventDetails(event, e)}
                    sx={{ 
                      p: 0.5, 
                      mb: 0.5, 
                      backgroundColor: isTask 
                        ? isCompleted 
                          ? 'success.lighter' 
                          : 'warning.lighter'
                        : event.temp 
                          ? 'action.hover' 
                          : 'primary.lighter',
                      borderLeft: 4,
                      borderColor: isTask 
                        ? isCompleted
                          ? 'success.light'
                          : 'warning.light'
                        : event.temp 
                          ? 'grey.400' 
                          : 'primary.light',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      ...(isCompleted && {
                        textDecoration: 'line-through',
                        opacity: 0.7
                      }),
                      '&:hover': {
                        transform: 'translateX(2px)',
                        boxShadow: 1
                      }
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      noWrap 
                      title={`${event.title} (${eventTime})`}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: isTask ? 'medium' : 'normal'
                      }}
                    >
                      {isTask ? (
                        <TaskIcon sx={{ fontSize: '0.8rem' }} />
                      ) : (
                        <EventIcon sx={{ fontSize: '0.8rem' }} />
                      )}
                      {eventTime} {event.title.replace('📋 ', '')}
                      {event.temp && <Box component="span" sx={{ ml: 'auto', fontSize: '0.7rem' }}>saving...</Box>}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Grid>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <Grid container key={day.toString()}>
          {days}
        </Grid>
      );
      days = [];
    }
    
    return <Box>{rows}</Box>;
  };

  const renderSkeleton = () => {
    const rows = [];
    
    for (let week = 0; week < 6; week++) {
      const cells = [];
      for (let day = 0; day < 7; day++) {
        cells.push(
          <Grid item xs={12/7} key={`skeleton-${week}-${day}`} sx={{ height: 120, p: 1, border: 1, borderColor: 'divider' }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={10} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={10} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={10} />
          </Grid>
        );
      }
      rows.push(
        <Grid container key={`skeleton-week-${week}`}>
          {cells}
        </Grid>
      );
    }
    
    return <Box>{rows}</Box>;
  };

  if (loading) {
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Household Calendar</Typography>
          {renderHeader()}
          {renderDays()}
          {renderSkeleton()}
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Error loading calendar events: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Household Calendar</Typography>
        
        {renderHeader()}
        {renderDays()}
        {refreshing ? renderSkeleton() : renderCells()}
      </Paper>
      
      {/* Event Creation Dialog */}
      <Dialog 
        open={showEventModal} 
        onClose={() => setShowEventModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Event</DialogTitle>
        <form onSubmit={handleEventSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={newEvent.title}
              onChange={handleEventChange}
              margin="normal"
              required
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newEvent.description}
              onChange={handleEventChange}
              margin="normal"
              multiline
              rows={3}
            />
            
            <TextField
              fullWidth
              label="Start Date & Time"
              name="startTime"
              type="datetime-local"
              value={newEvent.startTime}
              onChange={handleEventChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              label="End Date & Time"
              name="endTime"
              type="datetime-local"
              value={newEvent.endTime}
              onChange={handleEventChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEventModal(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Event'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Event Details Modal (only used if no external onSelectEvent provided) */}
      <Dialog 
        open={showEventDetailsModal} 
        onClose={() => setShowEventDetailsModal(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pr: 1
            }}>
              <Box>{selectedEvent.title.replace('📋 ', '')}</Box>
              {selectedEvent.type !== 'task' && (
                <IconButton 
                  color="error" 
                  onClick={() => setDeleteConfirmOpen(true)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {format(parseISO(selectedEvent.start_date), 'EEEE, MMMM d, yyyy')} at {' '}
                    {format(parseISO(selectedEvent.start_date), 'h:mm a')}
                    {selectedEvent.end_date && (
                      <> - {format(parseISO(selectedEvent.end_date), 'h:mm a')}</>
                    )}
                  </Typography>
                </Box>
              </Box>
              
              {selectedEvent.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedEvent.description}
                  </Typography>
                </Box>
              )}
              
              {selectedEvent.type === 'task' && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status: {selectedEvent.completed ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ 
                mt: 2, 
                p: 1, 
                bgcolor: selectedEvent.type === 'task' 
                  ? selectedEvent.completed ? 'success.lighter' : 'warning.lighter'
                  : 'primary.lighter', 
                borderRadius: 1 
              }}>
                <Typography variant="caption" color="text.secondary">
                  {selectedEvent.type === 'task' 
                    ? `This is a ${selectedEvent.completed ? 'completed' : 'pending'} task with a due date`
                    : 'Calendar event'}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              {selectedEvent.type === 'task' && (
                <Button 
                  color="primary"
                  onClick={() => {
                    setShowEventDetailsModal(false);
                    // Navigate to tasks page
                    window.location.href = '/tasks';
                  }}
                >
                  Go to Tasks
                </Button>
              )}
              <Button onClick={() => setShowEventDetailsModal(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedEvent?.title.replace('📋 ', '')}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={handleDeleteEvent}
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
