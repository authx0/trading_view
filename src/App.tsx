import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import MainContent from './components/MainContent';
import HomePage from './components/HomePage';
import ResponsiveNotification from './components/ResponsiveNotification';
import { StockData } from './types/trading';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4aa',
    },
    secondary: {
      main: '#ff6b6b',
    },
    background: {
      default: '#000000', // True OLED black
      paper: '#0a0a0a', // Very dark gray for cards
    },
    text: {
      primary: '#ffffff',
      secondary: '#8a8a8a', // Slightly dimmer secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a0a0a', // Dark gray for paper components
          border: '1px solid #1a1a1a', // Subtle border
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a0a0a',
          border: '1px solid #1a1a1a',
        },
      },
    },
  },
});

function App() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [apiRateLimitError, setApiRateLimitError] = useState<string | null>(null);

  const handleDismissRateLimit = () => {
    setApiRateLimitError(null);
  };

  const handleStockSelect = (stock: StockData | null) => {
    setSelectedStock(stock);
    if (stock) {
      setShowHomePage(false);
    }
  };

  const handleShowHomePage = () => {
    setShowHomePage(true);
    setSelectedStock(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ResponsiveNotification 
        apiRateLimitError={apiRateLimitError}
        onDismissRateLimit={handleDismissRateLimit}
      />
      <Box sx={{ height: '100vh', overflow: 'auto' }}>
        {showHomePage ? (
          <HomePage
            onStockSelect={handleStockSelect}
          />
        ) : (
          <MainContent 
            selectedStock={selectedStock}
            onShowHomePage={handleShowHomePage}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App; 