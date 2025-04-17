'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Logo from './logo';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TaskIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';

const drawerWidth = 280; // Increased width for better visibility on mobile

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
  { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  { text: 'Budget', icon: <AccountBalanceWalletIcon />, path: '/budget' },
  { text: 'Household', icon: <SettingsIcon />, path: '/household/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appBarVisible, setAppBarVisible] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // Using a single state to track which menu triggered the popup
  const [menuOrigin, setMenuOrigin] = useState<'sidebar' | 'appbar' | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  // Mobile drawer toggle with side effects
  const handleDrawerToggle = () => {
    const newDrawerState = !mobileOpen;
    setMobileOpen(newDrawerState);
    // Toggle app bar visibility based on drawer state (only on mobile)
    if (isMobile) {
      setAppBarVisible(!newDrawerState);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, origin: 'sidebar' | 'appbar') => {
    // Close existing menu if from a different origin
    if (menuOrigin && menuOrigin !== origin) {
      setAnchorEl(null);
      setMenuOrigin(null);
      // Small delay to prevent visual glitches
      setTimeout(() => {
        setAnchorEl(event.currentTarget);
        setMenuOrigin(origin);
      }, 10);
    } else {
      setAnchorEl(event.currentTarget);
      setMenuOrigin(origin);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOrigin(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    router.push('/login');
  };

  const drawer = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <Toolbar sx={{ justifyContent: 'center', height: { xs: '160px', md: '120px' }, padding: '16px 8px', overflow: 'visible' }}>
          <Box sx={{ width: '100%', maxWidth: '220px', mx: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Logo width={180} height={110} />
          </Box>
        </Toolbar>
        {/* Removed divider between logo and menu items */}
        <List>
          {/* Close button item - only visible on mobile */}
          {isMobile && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleDrawerToggle}
                sx={{
                  my: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </ListItemIcon>
                <ListItemText 
                  primary="Close Menu"
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    color: 'error.main'
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link}
                href={item.path}
                selected={pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(160, 231, 229, 0.2)',
                    borderRight: '3px solid var(--mint)',
                    '&:hover': {
                      backgroundColor: 'rgba(160, 231, 229, 0.3)',
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: pathname === item.path ? 'primary.main' : 'inherit' 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.path ? 'bold' : 'normal'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
      
      {/* Profile section at bottom of sidebar */}
      <div style={{ marginTop: 'auto' }}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              mr: 2
            }}
          >
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
              {user?.email?.split('@')[0]}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <IconButton 
            onClick={(e) => handleMenuOpen(e, 'sidebar')} 
            size="small" 
            sx={{ ml: 'auto' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && menuOrigin === 'sidebar'}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { 
                minWidth: 200,
                mt: 1,
                borderRadius: 1,
                overflow: 'visible',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              }
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem component={Link} href="/household/settings" onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
              Household Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '12px', color: 'rgba(0, 0, 0, 0.6)' }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar - only visible on mobile when appBarVisible is true */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: { xs: appBarVisible ? 'block' : 'none', md: 'none' }
        }}
      >
      <Toolbar sx={{ height: '80px', padding: '0 10px' }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
          onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
        >
          <MenuIcon />
      </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1 }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ ml: 2, fontSize: '1.25rem', fontWeight: 600 }}
          >
            {menuItems.find(item => item.path === pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, ml: 2 }}>
            <Logo.Mini size={40} />
          </Box>
        </Box>
        
        <IconButton
          onClick={(e) => handleMenuOpen(e, 'appbar')}
          size="small"
          sx={{ 
            position: 'relative',
            '&::after': menuOrigin === 'appbar' ? {
              content: '""',
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'primary.main',
            } : {}
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 36,
              height: 36
            }}
          >
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && menuOrigin === 'appbar'}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              minWidth: 200,
              mt: 1,
              borderRadius: 1,
              overflow: 'visible',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            }
          }}
        >
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {user?.email}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem component={Link} href="/household/settings" onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Household Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '12px', color: 'rgba(0, 0, 0, 0.6)' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: '85%', sm: drawerWidth },
              maxWidth: '320px',
              boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: '20px 12px', md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'var(--light-gray)',
          minHeight: '100vh',
          paddingTop: { 
            xs: appBarVisible ? '100px' : '16px', 
            md: '16px' 
          } // Conditional padding based on appBar visibility
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
