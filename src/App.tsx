import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { StockData } from './types/trading';
import { useStockData } from './hooks/useStockData';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [watchlist, setWatchlist] = useState<StockData[]>([]);
  const [showDetailPage, setShowDetailPage] = useState(false);
  
  const {
    stocks,
    loading,
    error,
    searchResults,
    getStockBySymbol,
    searchStocks,
    getHistoricalData,
    updateStockPrices,
    loadInitialStocks,
  } = useStockData();

  const handleAddToWatchlist = (stock: StockData) => {
    if (!watchlist.some(item => item.symbol === stock.symbol)) {
      setWatchlist(prev => [...prev, stock]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          selectedStock={selectedStock}
          onStockSelect={setSelectedStock}
          searchStocks={searchStocks}
          searchResults={searchResults}
          getStockBySymbol={getStockBySymbol}
          onAddToWatchlist={handleAddToWatchlist}
          watchlist={watchlist}
          onShowDetailPage={() => setShowDetailPage(true)}
        />
        <Sidebar 
          open={sidebarOpen}
          onStockSelect={setSelectedStock}
          selectedStock={selectedStock}
          stocks={stocks}
          loading={loading}
          watchlist={watchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          onShowDetailPage={() => setShowDetailPage(true)}
          getStockBySymbol={getStockBySymbol}
        />
        <MainContent 
          selectedStock={selectedStock}
          sidebarOpen={sidebarOpen}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          watchlist={watchlist}
          showDetailPage={showDetailPage}
          onShowDetailPage={() => setShowDetailPage(true)}
          onHideDetailPage={() => setShowDetailPage(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App; 