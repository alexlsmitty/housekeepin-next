import React from 'react';
import Link from 'next/link';
import { Task, Event } from '@/types/database';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import DashboardLocationWeather, { Household } from './DashboardLocationWeather';
import WelcomeSection from './WelcomeSection';
import { 
  CheckCircle as TaskIcon, 
  CalendarMonth as CalendarIcon, 
  AccountBalanceWallet as BudgetIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';

// Use async component for server-side data fetching
export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  
  // Get current session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch user's household data
  let household: Household | null = null;
  let tasks: Task[] = [];
  let events: Event[] = [];

  if (user) {
    try {
      // First, get the user's household id
      const { data: userData } = await supabase
        .from('users')
        .select('household_id, name')
        .eq('id', user.id as string)
        .single();
      
      if (userData?.household_id) {
        // Fetch household data with location coordinates
        const { data: householdData } = await supabase
          .from('households')
          .select('*')
          .eq('id', userData.household_id)
          .single();
        
        household = householdData as Household;
        
        // Fetch upcoming tasks (limit to 5)
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('household_id', userData.household_id)
          .order('due_date', { ascending: true })
          .limit(5);
        
        if (tasksData) {
          tasks = tasksData as Task[];
        }
        
        // Fetch upcoming events (limit to 5)
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('household_id', userData.household_id)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(5);
        
        if (eventsData) {
          events = eventsData as Event[];
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Location and Weather Section - Client Component */}
      <DashboardLocationWeather household={household} />

      {/* Welcome section */}
      <WelcomeSection />
      
      {/* Dashboard Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Upcoming Tasks */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="medium">
                  Upcoming Tasks
                </Typography>
                <Button 
                  component={Link} 
                  href="/tasks" 
                  color="primary" 
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {tasks.length > 0 ? (
                <List disablePadding>
                  {tasks.map((task) => (
                    <ListItem 
                      key={task.id} 
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        bgcolor: 'primary.light', 
                        borderRadius: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={task.due_date ? 
                          `Due: ${new Date(task.due_date).toLocaleDateString()}` : 
                          'No due date'
                        }
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No upcoming tasks
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Upcoming Events */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="medium">
                  Upcoming Events
                </Typography>
                <Button 
                  component={Link} 
                  href="/calendar" 
                  color="primary" 
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {events.length > 0 ? (
                <List disablePadding>
                  {events.map((event) => (
                    <ListItem 
                      key={event.id} 
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        bgcolor: 'secondary.light', 
                        borderRadius: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemText
                        primary={event.title}
                        secondary={new Date(event.start_date).toLocaleDateString()}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No upcoming events
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Household Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Household
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {household ? (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {household.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {household.address || 'No address set'}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ 
                      bgcolor: 'primary.light', 
                      p: 1, 
                      borderRadius: 1,
                      display: 'inline-block',
                      mt: 1
                    }}
                  >
                    <Typography>
                      Members: {household.member_count || '1'}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No household information
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Quick Actions
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                component={Link}
                href="/tasks"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<TaskIcon />}
                sx={{ py: 2, textTransform: 'none' }}
              >
                Manage Tasks
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                component={Link}
                href="/calendar"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<CalendarIcon />}
                sx={{ py: 2, textTransform: 'none' }}
              >
                Calendar
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                component={Link}
                href="/budget"
                variant="contained"
                color="info"
                fullWidth
                size="large"
                startIcon={<BudgetIcon />}
                sx={{ py: 2, textTransform: 'none' }}
              >
                Budget
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                component={Link}
                href="/household/settings"
                variant="contained"
                color="warning"
                fullWidth
                size="large"
                startIcon={<SettingsIcon />}
                sx={{ py: 2, textTransform: 'none' }}
              >
                Settings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}