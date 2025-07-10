import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { StockData } from '../types/trading';
import { AlphaVantageSearchResult } from '../services/api';

interface HeaderProps {
  onMenuClick: () => void;
  selectedStock: StockData | null;
  onStockSelect: (stock: StockData | null) => void;
  searchStocks: (query: string) => Promise<void>;
  searchResults: AlphaVantageSearchResult[];
  getStockBySymbol: (symbol: string) => Promise<StockData | null>;
  onAddToWatchlist: (stock: StockData) => void;
  watchlist: StockData[];
  onShowDetailPage?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  selectedStock, 
  onStockSelect,
  searchStocks,
  searchResults,
  getStockBySymbol,
  onAddToWatchlist,
  watchlist,
  onShowDetailPage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isPopularStock, setIsPopularStock] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Popular stock keywords mapping
  const popularStocks = {
    'apple': 'AAPL',
    'aapl': 'AAPL',
    'microsoft': 'MSFT',
    'msft': 'MSFT',
    'google': 'GOOGL',
    'googl': 'GOOGL',
    'alphabet': 'GOOGL',
    'amazon': 'AMZN',
    'amzn': 'AMZN',
    'tesla': 'TSLA',
    'tsla': 'TSLA',
    'meta': 'META',
    'facebook': 'META',
    'netflix': 'NFLX',
    'nflx': 'NFLX',
    'nvidia': 'NVDA',
    'nvda': 'NVDA',
    'amd': 'AMD',
    'intel': 'INTC',
    'intc': 'INTC',
    'coca': 'KO',
    'coke': 'KO',
    'ko': 'KO',
    'disney': 'DIS',
    'dis': 'DIS',
    'walmart': 'WMT',
    'wmt': 'WMT',
    'mcdonalds': 'MCD',
    'mcd': 'MCD',
    'starbucks': 'SBUX',
    'sbux': 'SBUX',
    'nike': 'NKE',
    'nke': 'NKE',
    'adobe': 'ADBE',
    'adbe': 'ADBE',
    'salesforce': 'CRM',
    'crm': 'CRM',
    'oracle': 'ORCL',
    'orcl': 'ORCL',
    'paypal': 'PYPL',
    'pypl': 'PYPL',
    'visa': 'V',
    'mastercard': 'MA',
    'ma': 'MA',
    'berkshire': 'BRK.A',
    'brk': 'BRK.A',
    'johnson': 'JNJ',
    'jnj': 'JNJ',
    'pfizer': 'PFE',
    'pfe': 'PFE',
    'moderna': 'MRNA',
    'mrna': 'MRNA',
    'zoom': 'ZM',
    'zm': 'ZM',
    'spotify': 'SPOT',
    'spot': 'SPOT',
    'uber': 'UBER',
    'lyft': 'LYFT',
    'airbnb': 'ABNB',
    'abnb': 'ABNB',
    'snap': 'SNAP',
    'snapchat': 'SNAP',
    'twitter': 'TWTR',
    'twtr': 'TWTR',
    'pinterest': 'PINS',
    'pins': 'PINS',
    'shopify': 'SHOP',
    'shop': 'SHOP',
    'square': 'SQ',
    'sq': 'SQ',
    'robinhood': 'HOOD',
    'hood': 'HOOD',
    'coinbase': 'COIN',
    'coin': 'COIN',
    'palantir': 'PLTR',
    'pltr': 'PLTR',
    'snowflake': 'SNOW',
    'snow': 'SNOW',
    'datadog': 'DDOG',
    'ddog': 'DDOG',
    'crowdstrike': 'CRWD',
    'crwd': 'CRWD',
    'okta': 'OKTA',
    'mongodb': 'MDB',
    'mdb': 'MDB',
    'twilio': 'TWLO',
    'twlo': 'TWLO',
    'atlassian': 'TEAM',
    'team': 'TEAM',
    'servicenow': 'NOW',
    'now': 'NOW',
    'workday': 'WDAY',
    'wday': 'WDAY',
    'splunk': 'SPLK',
    'splk': 'SPLK',
    'vmware': 'VMW',
    'vmw': 'VMW',
    'cisco': 'CSCO',
    'csco': 'CSCO',
    'qualcomm': 'QCOM',
    'qcom': 'QCOM',
    'broadcom': 'AVGO',
    'avgo': 'AVGO',
    'marvell': 'MRVL',
    'mrvl': 'MRVL',
    'micron': 'MU',
    'mu': 'MU',
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase().trim();
    setSearchQuery(query);
    
    if (query) {
      setSearchOpen(true);
      
      // Check if it's a popular stock keyword
      const popularSymbol = popularStocks[query as keyof typeof popularStocks];
      if (popularSymbol) {
        setIsPopularStock(true);
      } else {
        setIsPopularStock(false);
      }
      
      // Regular search for other stocks
      await searchStocks(query);
    } else {
      setSearchOpen(false);
      setIsPopularStock(false);
    }
  };

  const handleSearchKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const query = searchQuery.toLowerCase().trim();
      
      if (query) {
        // Check if it's a popular stock keyword
        const popularSymbol = popularStocks[query as keyof typeof popularStocks];
        if (popularSymbol) {
          // Direct navigation to popular stock
          const stock = await getStockBySymbol(popularSymbol);
          if (stock) {
            onStockSelect(stock);
            onShowDetailPage?.(); // Show detail page for popular stocks
            setSearchQuery('');
            setSearchOpen(false);
            setIsPopularStock(false);
            return;
          }
        } else if (searchResults.length > 0) {
          // Navigate to first search result
          const firstResult = searchResults[0];
          const stock = await getStockBySymbol(firstResult['1. symbol']);
          if (stock) {
            onStockSelect(stock);
            onShowDetailPage?.(); // Show detail page for search results
            setSearchQuery('');
            setSearchOpen(false);
            setIsPopularStock(false);
            return;
          }
        }
      }
    }
  };

  const handleSearchResultClick = async (result: AlphaVantageSearchResult) => {
    const stock = await getStockBySymbol(result['1. symbol']);
    if (stock) {
      onStockSelect(stock);
      onShowDetailPage?.(); // Show detail page when clicking search results
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleAddToWatchlist = async (result: AlphaVantageSearchResult, event: React.MouseEvent) => {
    event.stopPropagation();
    const stock = await getStockBySymbol(result['1. symbol']);
    if (stock) {
      onAddToWatchlist(stock);
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#000000', // True OLED black
        borderBottom: '1px solid #1a1a1a'
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: { xs: 1, sm: 2 } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
          Trading View
        </Typography>

        {selectedStock && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Typography variant="h6" sx={{ mr: 1 }}>
              {selectedStock.symbol}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: selectedStock.change >= 0 ? '#00d4aa' : '#ff6b6b',
                fontWeight: 'bold'
              }}
            >
              ${selectedStock.price.toFixed(2)}
              <span style={{ marginLeft: '8px' }}>
                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} 
                ({selectedStock.changePercent.toFixed(2)}%)
              </span>
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              size="small"
              placeholder="Search stocks by symbol"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              onFocus={() => setSearchOpen(true)}
              inputRef={searchInputRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#8a8a8a' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: 200, sm: 250 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isPopularStock ? '#00d4aa20' : '#1a1a1a',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: isPopularStock ? '#00d4aa' : '#1a1a1a',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00d4aa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00d4aa',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  '&::placeholder': {
                    color: '#8a8a8a',
                    opacity: 1,
                  },
                },
              }}
            />
            
            <Popper
              open={searchOpen && searchResults.length > 0}
              anchorEl={searchInputRef.current}
              placement="bottom-start"
              sx={{ zIndex: 1400 }}
            >
              <ClickAwayListener onClickAway={handleSearchClose}>
                <Paper 
                  sx={{ 
                    width: { xs: 280, sm: 350 }, 
                    maxHeight: 400, 
                    overflow: 'auto',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ p: 1, color: '#8a8a8a', borderBottom: '1px solid #1a1a1a' }}>
                      Search Results ({searchResults.length})
                    </Typography>
                    <List dense>
                      {searchResults.map((result) => (
                        <ListItem 
                          key={result['1. symbol']}
                          onClick={() => handleSearchResultClick(result)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: '#1a1a1a',
                            },
                            borderRadius: 1,
                            mb: 0.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                                {result['1. symbol']}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#8a8a8a',
                                  backgroundColor: '#1a1a1a',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.7rem'
                                }}
                              >
                                Stock
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {result['2. name']}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: isInWatchlist(result['1. symbol']) ? '#00d4aa' : '#8a8a8a',
                                fontSize: '0.7rem'
                              }}
                            >
                              {isInWatchlist(result['1. symbol']) ? 'In Watchlist' : 'Add to Watchlist'}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => handleAddToWatchlist(result, e)}
                              sx={{
                                color: isInWatchlist(result['1. symbol']) ? '#00d4aa' : '#8a8a8a',
                                backgroundColor: isInWatchlist(result['1. symbol']) ? '#00d4aa20' : 'transparent',
                                '&:hover': {
                                  color: '#00d4aa',
                                  backgroundColor: '#00d4aa20',
                                },
                                width: 32,
                                height: 32,
                              }}
                            >
                              {isInWatchlist(result['1. symbol']) ? <BookmarkIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </IconButton>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </Box>

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#00d4aa' }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 