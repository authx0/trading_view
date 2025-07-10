import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Chip,
  Collapse,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Bookmark as WatchlistIcon,
  AccountBalance as PortfolioIcon,
  TrendingUp as MarketIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { StockData, WatchlistItem, PortfolioItem, MarketData } from '../types/trading';
import { mockPortfolio, mockMarketData } from '../data/mockData';

interface SidebarProps {
  open: boolean;
  selectedStock: StockData | null;
  onStockSelect: (stock: StockData | null) => void;
  stocks: StockData[];
  loading: boolean;
  watchlist: StockData[];
  onRemoveFromWatchlist: (symbol: string) => void;
  onShowDetailPage?: () => void;
  getStockBySymbol?: (symbol: string) => Promise<StockData | null>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  selectedStock, 
  onStockSelect, 
  stocks,
  loading,
  watchlist,
  onRemoveFromWatchlist,
  onShowDetailPage,
  getStockBySymbol
}) => {
  const [watchlistOpen, setWatchlistOpen] = useState(true);
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const [marketOpen, setMarketOpen] = useState(true);

  const drawerWidth = { xs: 280, sm: 300 };

  const handleStockClick = (stock: StockData) => {
    onStockSelect(stock);
    onShowDetailPage?.(); // Show detail page when clicking stocks in sidebar
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid #1a1a1a',
          marginTop: '64px',
          height: 'calc(100vh - 64px)',
          '@media (max-width: 600px)': {
            width: 280,
          },
        },
      }}
    >
      <Box sx={{ overflow: 'auto', p: 2 }}>
        {/* Watchlist Section */}
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setWatchlistOpen(!watchlistOpen)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WatchlistIcon sx={{ mr: 1, color: '#00d4aa' }} />
              <Typography variant="h6">Watchlist ({watchlist.length})</Typography>
            </Box>
            {watchlistOpen ? <ExpandLess /> : <ExpandMore />}
          </Box>
          
          <Collapse in={watchlistOpen}>
            {watchlist.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No stocks in watchlist. Search and add stocks to get started.
                </Typography>
              </Box>
            ) : (
              <List dense>
                {watchlist.map((stock) => (
                  <ListItem 
                    key={stock.symbol}
                    onClick={() => handleStockClick(stock)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      backgroundColor: selectedStock?.symbol === stock.symbol ? '#00d4aa20' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#1a1a1a',
                      },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stock.symbol}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: stock.change >= 0 ? '#00d4aa' : '#ff6b6b',
                            fontWeight: 'bold'
                          }}
                        >
                          ${stock.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {stock.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: stock.change >= 0 ? '#00d4aa' : '#ff6b6b'
                          }}
                        >
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(stock.symbol);
                      }}
                      sx={{
                        color: '#ff6b6b',
                        '&:hover': {
                          color: '#ff4444',
                        },
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Collapse>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#1a1a1a' }} />

        {/* Portfolio Section */}
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setPortfolioOpen(!portfolioOpen)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PortfolioIcon sx={{ mr: 1, color: '#00d4aa' }} />
              <Typography variant="h6">Portfolio</Typography>
            </Box>
            {portfolioOpen ? <ExpandLess /> : <ExpandMore />}
          </Box>
          
          <Collapse in={portfolioOpen}>
            <List dense>
              {mockPortfolio.map((item) => (
                <ListItem 
                  key={item.symbol}
                  onClick={async () => {
                    let stock = stocks.find(s => s.symbol === item.symbol);
                    
                    // If stock is not in loaded stocks, try to fetch it
                    if (!stock && getStockBySymbol) {
                      const fetchedStock = await getStockBySymbol(item.symbol);
                      if (fetchedStock) {
                        stock = fetchedStock;
                      }
                    }
                    
                    if (stock) {
                      onStockSelect(stock);
                      onShowDetailPage?.(); // Show detail page when clicking portfolio items
                    }
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    backgroundColor: selectedStock?.symbol === item.symbol ? '#00d4aa20' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.symbol}
                        </Typography>
                        <Typography variant="body2">
                          {item.shares} shares
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          ${item.totalValue.toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: item.gainLoss >= 0 ? '#00d4aa' : '#ff6b6b'
                          }}
                        >
                          {item.gainLoss >= 0 ? '+' : ''}{item.gainLoss.toFixed(2)} ({item.gainLossPercent.toFixed(2)}%)
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#1a1a1a' }} />

        {/* Market Overview */}
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setMarketOpen(!marketOpen)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketIcon sx={{ mr: 1, color: '#00d4aa' }} />
              <Typography variant="h6">Market</Typography>
            </Box>
            {marketOpen ? <ExpandLess /> : <ExpandMore />}
          </Box>
          
          <Collapse in={marketOpen}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#b0b0b0' }}>
                Indices
              </Typography>
              {mockMarketData.indices.map((index) => (
                <Box key={index.name} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: '#252525' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {index.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: index.change >= 0 ? '#00d4aa' : '#ff6b6b',
                        fontWeight: 'bold'
                      }}
                    >
                      {index.value.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: index.change >= 0 ? '#00d4aa' : '#ff6b6b'
                    }}
                  >
                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                  </Typography>
                </Box>
              ))}

              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: '#b0b0b0' }}>
                Sectors
              </Typography>
              {mockMarketData.sectors.map((sector) => (
                <Box key={sector.name} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: '#252525' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {sector.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: sector.change >= 0 ? '#00d4aa' : '#ff6b6b',
                        fontWeight: 'bold'
                      }}
                    >
                      {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 