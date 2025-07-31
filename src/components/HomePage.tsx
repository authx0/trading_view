import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Badge,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Search,
  Refresh,
  ArrowForward,
  TrendingFlat,
  Notifications,
  Dashboard,
  Timeline,
  Assessment,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility,
  MoreVert,
  FilterList,
  Sort,
  CalendarToday,
  AttachMoney,
  Speed,
  Security,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { StockData, NewsItem, MarketData, WatchlistItem } from '../types/trading';
import { stockDatabase } from '../services/stockDatabase';
import { watchlistService } from '../services/watchlistService';
import { formatCurrency, formatNumberWithCommas, formatVolume, formatMarketCap } from '../utils/formatters';

interface HomePageProps {
  onStockSelect: (stock: StockData) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onStockSelect,
}) => {
  const [marketOverview, setMarketOverview] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResultLoading, setSearchResultLoading] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  
  // New state for enhanced features
  const [activeTab, setActiveTab] = useState(0);
  const [marketData, setMarketData] = useState<MarketData>({
    indices: [],
    sectors: []
  });
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState<string | null>(null);

  // Load market overview data
  const loadMarketOverview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏠 Loading enhanced market data...');
      const popularStocks = await stockDatabase.getPopularStocks();
      const validStocks = popularStocks.slice(0, 12);
      console.log(`✅ Loaded ${validStocks.length} stocks for dashboard`);
      setMarketOverview(validStocks);
      
    } catch (err) {
      console.error('Error loading market overview:', err);
      setError('Failed to load market data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load news feed
  const loadNewsFeed = async () => {
    setNewsLoading(true);
    try {
      // Mock news data for now - will integrate with real API
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Tech Stocks Rally on Strong Earnings Reports',
          summary: 'Major technology companies report better-than-expected quarterly results, driving market optimism.',
          source: 'Financial Times',
          publishedAt: new Date().toISOString(),
          url: '#',
          sentiment: 'positive'
        },
        {
          id: '2',
          title: 'Federal Reserve Signals Potential Rate Changes',
          summary: 'Central bank officials hint at possible policy adjustments in upcoming meetings.',
          source: 'Reuters',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          url: '#',
          sentiment: 'neutral'
        },
        {
          id: '3',
          title: 'Oil Prices Surge on Supply Concerns',
          summary: 'Global oil markets face pressure as supply disruptions impact major producers.',
          source: 'Bloomberg',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          url: '#',
          sentiment: 'negative'
        }
      ];
      setNewsFeed(mockNews);
    } catch (err) {
      console.error('Error loading news:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  // Refresh market data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMarketOverview(), loadNewsFeed()]);
    setRefreshing(false);
  };

  // Load data on mount
  useEffect(() => {
    loadMarketOverview();
    loadNewsFeed();
    loadWatchlist();
    
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp sx={{ color: '#00d4aa' }} />;
    if (change < 0) return <TrendingDown sx={{ color: '#ff4757' }} />;
    return <TrendingFlat sx={{ color: '#8a8a8a' }} />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#00d4aa';
    if (change < 0) return '#ff4757';
    return '#8a8a8a';
  };



  const handleStockClick = (stock: StockData) => {
    onStockSelect(stock);
  };

  const handleSearchClick = () => {
    console.log('🔍 Search button clicked!');
    setButtonLoading('search');
    setTimeout(() => {
      setSearchOpen(true);
      setButtonLoading(null);
    }, 100);
  };

  const handleChartsClick = () => {
    console.log('📊 Charts button clicked!');
    setButtonLoading('charts');
    setTimeout(() => {
      if (marketOverview.length > 0) {
        onStockSelect(marketOverview[0]);
      } else {
        alert('Loading market data... Please try again in a moment.');
      }
      setButtonLoading(null);
    }, 100);
  };

  const handleWatchlistClick = () => {
    console.log('📋 Watchlist button clicked!');
    setButtonLoading('watchlist');
    setTimeout(() => {
      // Removed watchlist functionality
      setButtonLoading(null);
    }, 100);
  };

  const handleNotificationClick = () => {
    setNotificationOpen(true);
  };

  // Watchlist functions
  const loadWatchlist = () => {
    const watchlistData = watchlistService.getWatchlist();
    setWatchlist(watchlistData);
  };

  const handleAddToWatchlist = async (stock: StockData) => {
    setWatchlistLoading(stock.symbol);
    try {
      const success = watchlistService.addToWatchlist(stock);
      if (success) {
        loadWatchlist(); // Reload watchlist to update UI
        console.log(`✅ Added ${stock.symbol} to watchlist`);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setWatchlistLoading(null);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    const success = watchlistService.removeFromWatchlist(symbol);
    if (success) {
      loadWatchlist(); // Reload watchlist to update UI
      console.log(`✅ Removed ${symbol} from watchlist`);
    }
  };

  const isInWatchlist = (symbol: string): boolean => {
    return watchlistService.isInWatchlist(symbol);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      const searchPromise = stockDatabase.searchStocks(searchQuery);
      const results = await Promise.race([searchPromise, timeoutPromise]) as any[];
      setSearchResults(results || []);
    } catch (error) {
      console.error('❌ Error searching stocks:', error);
      if (error instanceof Error && error.message.includes('rate limit')) {
        alert('Daily API rate limit exceeded (25 requests/day). Please try again tomorrow or upgrade to premium.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        alert('Search request timed out. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = async (result: any) => {
    setSearchResultLoading(result.symbol);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      const quotePromise = stockDatabase.getStockBySymbol(result.symbol);
      const quote = await Promise.race([quotePromise, timeoutPromise]);
      
      if (quote) {
        // Add to recent searches
        setRecentSearches(prev => {
          const newSearches = [result.symbol, ...prev.filter(s => s !== result.symbol)].slice(0, 5);
          return newSearches;
        });
        
        onStockSelect(quote);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        // Fallback: create stock data from search result
        const fallbackStock: StockData = {
          symbol: result.symbol,
          name: result.name || result.symbol,
          price: parseFloat(result.price) || 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          marketCap: 0,
          pe: 0,
          dividend: 0,
          dividendYield: 0,
        };
        
        // Add to recent searches
        setRecentSearches(prev => {
          const newSearches = [result.symbol, ...prev.filter(s => s !== result.symbol)].slice(0, 5);
          return newSearches;
        });
        
        onStockSelect(fallbackStock);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Error getting stock quote:', error);
      alert('Failed to load stock data. Please try again.');
    } finally {
      setSearchResultLoading(null);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#00d4aa';
      case 'negative': return '#ff4757';
      default: return '#8a8a8a';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#000000'
      }}>
        <CircularProgress size={60} sx={{ color: '#00d4aa', mb: 3 }} />
        <Typography variant="h6" sx={{ color: '#ffffff', mb: 1 }}>
          Loading Trading Dashboard...
        </Typography>
        <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
          Fetching real-time market data
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #00d4aa, #0099cc)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Trading Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#8a8a8a' }}>
              Public Market Analytics & Stock Information
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ 
                  color: '#00d4aa',
                  '&:hover': { backgroundColor: 'rgba(0, 212, 170, 0.1)' }
                }}
              >
                <Refresh sx={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <Badge badgeContent={3} color="error">
                <IconButton sx={{ color: '#ffffff' }} onClick={handleNotificationClick}>
                  <Notifications />
                </IconButton>
              </Badge>
            </Tooltip>
          </Box>
        </Box>

        {/* Search Bar */}
        <Paper sx={{ 
          p: 3, 
          backgroundColor: '#0a0a0a', 
          border: '1px solid #1a1a1a',
          borderRadius: 2,
          mb: 3
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#ffffff' }}>
            Search Stocks
          </Typography>
          <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 3 }}>
            Search for any stock by symbol or company name
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Enter stock symbol (e.g., AAPL, TSLA, MSFT) or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  '& fieldset': {
                    borderColor: '#1a1a1a',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00d4aa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00d4aa',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8a8a8a',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#8a8a8a',
                  opacity: 0.7,
                },
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#00d4aa',
                color: '#000000',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#00b894',
                },
                '&:disabled': {
                  backgroundColor: '#1a1a1a',
                  color: '#8a8a8a',
                },
              }}
            >
              {searchLoading ? <CircularProgress size={20} /> : 'Search'}
            </Button>
          </Box>
          
          {/* Quick Search Suggestions */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 1 }}>
              Popular stocks:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX'].map((symbol) => (
                <Chip
                  key={symbol}
                  label={symbol}
                  onClick={() => {
                    setSearchQuery(symbol);
                    handleSearch();
                  }}
                  sx={{
                    backgroundColor: '#1a1a1a',
                    color: '#00d4aa',
                    border: '1px solid #00d4aa',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#00d4aa',
                      color: '#000000',
                    },
                  }}
                />
              ))}
            </Box>
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
                    Recent searches:
                  </Typography>
                  <Button
                    onClick={handleClearRecentSearches}
                    size="small"
                    sx={{ 
                      color: '#8a8a8a',
                      minWidth: 'auto',
                      p: 0.5,
                      '&:hover': {
                        color: '#ff6b6b',
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {recentSearches.map((symbol) => (
                    <Chip
                      key={symbol}
                      label={symbol}
                      onClick={() => {
                        setSearchQuery(symbol);
                        handleSearch();
                      }}
                      sx={{
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #2a2a2a',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#2a2a2a',
                          borderColor: '#00d4aa',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#0a0a0a', 
            border: '1px solid #1a1a1a',
            borderRadius: 2,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Search Results for "{searchQuery}"
              </Typography>
              <Button
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                size="small"
                sx={{ color: '#8a8a8a' }}
              >
                Clear
              </Button>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {searchResults.map((stock) => (
                <Card 
                  key={stock.symbol}
                  onClick={() => handleSearchResultClick(stock)}
                  sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: '#00d4aa',
                      boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)',
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {stock.symbol}
                      </Typography>
                      {searchResultLoading === stock.symbol ? (
                        <CircularProgress size={16} sx={{ color: '#00d4aa' }} />
                      ) : (
                        <IconButton size="small" sx={{ color: '#00d4aa' }}>
                          <ArrowForward />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 2, fontSize: '0.8rem' }}>
                      {stock.name}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatCurrency(stock.price || 0)}
                    </Typography>
                    {stock.change !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getChangeIcon(stock.change)}
                        <Typography variant="body2" sx={{ 
                          color: getChangeColor(stock.change),
                          fontWeight: 'bold'
                        }}>
                          {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({formatNumberWithCommas(stock.changePercent || 0, 2)}%)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        )}


      </Box>

      {/* Main Content Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#8a8a8a',
              '&.Mui-selected': {
                color: '#00d4aa',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00d4aa',
            },
          }}
        >
          <Tab label="Market Overview" icon={<Dashboard />} />
          <Tab label="Trending Stocks" icon={<TrendingUpIcon />} />
          <Tab label="Watchlist" icon={<Star />} />
          <Tab label="News Feed" icon={<Assessment />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Market Overview
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {marketOverview.map((stock) => (
              <Card 
                key={stock.symbol}
                onClick={() => handleStockClick(stock)}
                sx={{ 
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#00d4aa',
                    boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {stock.symbol}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8a8a8a', fontSize: '0.8rem' }}>
                        {stock.name}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInWatchlist(stock.symbol)) {
                          handleRemoveFromWatchlist(stock.symbol);
                        } else {
                          handleAddToWatchlist(stock);
                        }
                      }}
                      size="small"
                      sx={{ 
                        color: isInWatchlist(stock.symbol) ? '#00d4aa' : '#8a8a8a',
                        '&:hover': {
                          color: isInWatchlist(stock.symbol) ? '#ff6b6b' : '#00d4aa',
                        }
                      }}
                      disabled={watchlistLoading === stock.symbol}
                    >
                      {watchlistLoading === stock.symbol ? (
                        <CircularProgress size={16} />
                      ) : isInWatchlist(stock.symbol) ? (
                        <Star />
                      ) : (
                        <StarBorder />
                      )}
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatCurrency(stock.price)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getChangeIcon(stock.change)}
                    <Typography variant="body2" sx={{ 
                      color: getChangeColor(stock.change),
                      fontWeight: 'bold'
                    }}>
                      {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({formatNumberWithCommas(stock.changePercent, 2)}%)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                      Vol: {formatVolume(stock.volume)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                      MC: {formatMarketCap(stock.marketCap)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Trending Stocks
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {marketOverview
              .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
              .slice(0, 8)
              .map((stock) => (
                <Card 
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock)}
                  sx={{ 
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#00d4aa',
                      boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)',
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {stock.symbol}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8a8a8a', fontSize: '0.8rem' }}>
                          {stock.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInWatchlist(stock.symbol)) {
                              handleRemoveFromWatchlist(stock.symbol);
                            } else {
                              handleAddToWatchlist(stock);
                            }
                          }}
                          size="small"
                          sx={{ 
                            color: isInWatchlist(stock.symbol) ? '#00d4aa' : '#8a8a8a',
                            '&:hover': {
                              color: isInWatchlist(stock.symbol) ? '#ff6b6b' : '#00d4aa',
                            }
                          }}
                          disabled={watchlistLoading === stock.symbol}
                        >
                          {watchlistLoading === stock.symbol ? (
                            <CircularProgress size={16} />
                          ) : isInWatchlist(stock.symbol) ? (
                            <Star />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                        <Chip 
                          label={stock.changePercent >= 0 ? 'Gain' : 'Loss'}
                          size="small"
                          sx={{ 
                            backgroundColor: stock.changePercent >= 0 ? '#00d4aa' : '#ff4757',
                            color: '#ffffff',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>
                    
                                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatCurrency(stock.price)}
                  </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getChangeIcon(stock.change)}
                                          <Typography variant="body2" sx={{ 
                      color: getChangeColor(stock.change),
                      fontWeight: 'bold'
                    }}>
                      {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({formatNumberWithCommas(stock.changePercent, 2)}%)
                    </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Watchlist ({watchlist.length})
          </Typography>
          
          {watchlist.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              backgroundColor: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: 2
            }}>
              <StarBorder sx={{ fontSize: 64, color: '#8a8a8a', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#8a8a8a', mb: 1 }}>
                Your watchlist is empty
              </Typography>
              <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
                Click the star icon on any stock to add it to your watchlist
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
              {watchlist.map((item) => (
                <Card 
                  key={item.symbol}
                  onClick={() => {
                    // Convert WatchlistItem to StockData for selection
                    const stockData: StockData = {
                      symbol: item.symbol,
                      name: item.name,
                      price: item.price,
                      change: item.change,
                      changePercent: item.changePercent,
                      volume: 0,
                      marketCap: 0,
                      pe: 0,
                      dividend: 0,
                      dividendYield: 0,
                    };
                    handleStockClick(stockData);
                  }}
                  sx={{ 
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#00d4aa',
                      boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)',
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {item.symbol}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8a8a8a', fontSize: '0.8rem' }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist(item.symbol);
                        }}
                        size="small"
                        sx={{ 
                          color: '#ff6b6b',
                          '&:hover': {
                            color: '#ff4757',
                          }
                        }}
                      >
                        <Star />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatCurrency(item.price)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {getChangeIcon(item.change)}
                      <Typography variant="body2" sx={{ 
                        color: getChangeColor(item.change),
                        fontWeight: 'bold'
                      }}>
                        {item.change >= 0 ? '+' : ''}{formatCurrency(item.change)} ({formatNumberWithCommas(item.changePercent, 2)}%)
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Market News & Insights
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {newsFeed.map((news) => (
              <Card 
                key={news.id}
                sx={{ 
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 2,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: getSentimentColor(news.sentiment),
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      color: '#ffffff',
                      lineHeight: 1.3
                    }}>
                      {news.title}
                    </Typography>
                    <Chip 
                      label={news.sentiment}
                      size="small"
                      sx={{ 
                        backgroundColor: getSentimentColor(news.sentiment),
                        color: '#ffffff',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#8a8a8a',
                    mb: 2,
                    lineHeight: 1.5
                  }}>
                    {news.summary}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                      {news.source}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                      {formatTimeAgo(news.publishedAt)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}



      {/* Search Dialog */}
      <Dialog 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0a',
            border: '1px solid #1a1a1a',
          }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid #1a1a1a' }}>
          Search Stocks
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Enter stock symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': {
                    borderColor: '#1a1a1a',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00d4aa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00d4aa',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8a8a8a',
                },
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              variant="contained"
              sx={{
                backgroundColor: '#00d4aa',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#00b894',
                },
              }}
            >
              {searchLoading ? <CircularProgress size={20} /> : 'Search'}
            </Button>
          </Box>
          
          {searchResults.length > 0 && (
            <List>
              {searchResults.map((result) => (
                <ListItem
                  key={result.symbol}
                  onClick={() => handleSearchResultClick(result)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#1a1a1a',
                    },
                  }}
                >
                  <ListItemText
                    primary={result.symbol}
                    secondary={result.name}
                    primaryTypographyProps={{ color: '#ffffff' }}
                    secondaryTypographyProps={{ color: '#8a8a8a' }}
                  />
                  {searchResultLoading === result.symbol ? (
                    <CircularProgress size={20} sx={{ color: '#00d4aa' }} />
                  ) : (
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInWatchlist(result.symbol)) {
                              handleRemoveFromWatchlist(result.symbol);
                            } else {
                              handleAddToWatchlist(result);
                            }
                          }}
                          size="small"
                          sx={{ 
                            color: isInWatchlist(result.symbol) ? '#00d4aa' : '#8a8a8a',
                            '&:hover': {
                              color: isInWatchlist(result.symbol) ? '#ff6b6b' : '#00d4aa',
                            }
                          }}
                          disabled={watchlistLoading === result.symbol}
                        >
                          {watchlistLoading === result.symbol ? (
                            <CircularProgress size={16} />
                          ) : isInWatchlist(result.symbol) ? (
                            <Star />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                        <IconButton edge="end" sx={{ color: '#00d4aa' }}>
                          <ArrowForward />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0a',
            border: '1px solid #1a1a1a',
          }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid #1a1a1a' }}>
          🚀 New Features Coming Soon!
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 2 }}>
              We're working hard to bring you exciting new features:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 1 }}>
              • Real-time portfolio tracking
              </Typography>
              <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 1 }}>
              • Advanced charting tools
              </Typography>
              <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 1 }}>
              • Stock alerts and notifications
              </Typography>
              <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 1 }}>
              • Social trading features
              </Typography>
              <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 1 }}>
              • Mobile app version
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#00d4aa', mt: 2, fontStyle: 'italic' }}>
              Stay tuned for updates! We're constantly improving your trading experience.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1a1a1a', p: 2 }}>
          <Button
            onClick={() => setNotificationOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: '#00d4aa',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#00b894',
              },
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2, backgroundColor: '#1a1a1a', color: '#ff4757' }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default HomePage; 