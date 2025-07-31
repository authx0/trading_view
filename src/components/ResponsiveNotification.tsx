import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  Snackbar
} from '@mui/material';
import { Close, Warning } from '@mui/icons-material';

interface ResponsiveNotificationProps {
  apiRateLimitError?: string | null;
  onDismissRateLimit?: () => void;
}

const ResponsiveNotification: React.FC<ResponsiveNotificationProps> = ({ 
  apiRateLimitError, 
  onDismissRateLimit 
}) => {

  // Show API rate limit error if present
  if (apiRateLimitError) {
    return (
      <Snackbar
        open={true}
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
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onDismissRateLimit}
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
          icon={<Warning />}
          sx={{
            backgroundColor: '#ff6b6b',
            color: '#ffffff',
            border: '1px solid #ff4444',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            maxWidth: '90vw',
            '& .MuiAlert-icon': {
              color: '#ffffff'
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
            API Rate Limit Exceeded
          </AlertTitle>
          <Box sx={{ 
            fontSize: '14px',
            lineHeight: 1.4
          }}>
            {apiRateLimitError}
          </Box>
        </Alert>
      </Snackbar>
    );
  }

  // Don't show mobile/tablet notifications anymore
  return null;
};

export default ResponsiveNotification; 