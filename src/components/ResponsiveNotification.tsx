import { useState, useEffect } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  Snackbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Computer, Close } from '@mui/icons-material';

const ResponsiveNotification = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md = 900px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // md to lg = 900px to 1200px

  useEffect(() => {
    // Show notification on mobile and tablet
    if (isMobile || isTablet) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isMobile, isTablet]);

  const handleClose = () => {
    setOpen(false);
  };

  const getMessage = () => {
    if (isMobile) {
      return 'For the best trading experience, please switch to a desktop or tablet device.';
    }
    if (isTablet) {
      return 'For optimal chart viewing and trading features, consider using a desktop device.';
    }
    return '';
  };

  const getTitle = () => {
    if (isMobile) {
      return 'Mobile View Limited';
    }
    if (isTablet) {
      return 'Enhanced Experience Available';
    }
    return '';
  };

  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ 
        vertical: 'top', 
        horizontal: 'center' 
      }}
      sx={{
        zIndex: 9999,
        '& .MuiSnackbar-root': {
          top: '20px',
        }
      }}
    >
      <Alert
        severity="info"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleClose}
            startIcon={<Close />}
            sx={{ 
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Dismiss
          </Button>
        }
        icon={<Computer />}
        sx={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #333',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          maxWidth: isMobile ? '90vw' : '400px',
          '& .MuiAlert-icon': {
            color: '#00d4aa'
          },
          '& .MuiAlert-message': {
            flex: 1
          }
        }}
      >
        <AlertTitle sx={{ 
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '4px'
        }}>
          {getTitle()}
        </AlertTitle>
        <Box sx={{ 
          fontSize: isMobile ? '14px' : '16px',
          lineHeight: 1.4
        }}>
          {getMessage()}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default ResponsiveNotification; 