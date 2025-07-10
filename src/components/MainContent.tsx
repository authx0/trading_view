import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  VolumeUp,
  AttachMoney,
  Assessment,
  Newspaper,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { StockData, ChartData, NewsItem } from '../types/trading';
import { mockNews } from '../data/mockData';
import { financialAPI, convertHistoricalDataToChartData } from '../services/api';
import StockDetailPage from './StockDetailPage';

interface MainContentProps {
  selectedStock: StockData | null;
  sidebarOpen: boolean;
  onAddToWatchlist: (stock: StockData) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  watchlist: StockData[];
  showDetailPage: boolean;
  onShowDetailPage: () => void;
  onHideDetailPage: () => void;
}

interface TradeOrder {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
}

const MainContent: React.FC<MainContentProps> = ({ 
  selectedStock, 
  sidebarOpen, 
  onAddToWatchlist, 
  onRemoveFromWatchlist, 
  watchlist,
  showDetailPage,
  onShowDetailPage,
  onHideDetailPage
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeOrder[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  const [stockChartPeriod, setStockChartPeriod] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');

  const drawerWidth = 300;

  // Load chart data when stock is selected
  useEffect(() => {
    if (selectedStock) {
      loadChartData(selectedStock.symbol);
      loadNewsData(selectedStock.symbol);
    }
  }, [selectedStock]);

  // Regenerate market data when chart period changes
  useEffect(() => {
    // This will trigger a re-render of the chart with new data
  }, [chartPeriod]);

  // Regenerate stock chart data when stock chart period changes
  useEffect(() => {
    // This will trigger a re-render of the stock chart with new data
  }, [stockChartPeriod, selectedStock]);

  const loadChartData = async (symbol: string) => {
    setChartLoading(true);
    try {
      const data = await financialAPI.getHistoricalData(symbol, 'compact');
      if (data) {
        const chartData = convertHistoricalDataToChartData(data);
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const loadNewsData = async (symbol: string) => {
    setNewsLoading(true);
    try {
      const newsResponse = await financialAPI.getNews(symbol);
      if (newsResponse && newsResponse.feed) {
        setNewsData(newsResponse.feed.slice(0, 5)); // Limit to 5 news items
      } else {
        setNewsData(mockNews); // Fallback to mock data
      }
    } catch (error) {
      console.error('Error loading news data:', error);
      setNewsData(mockNews); // Fallback to mock data
    } finally {
      setNewsLoading(false);
    }
  };

  const formatChartData = (data: ChartData[]) => {
    return data.map(item => ({
      ...item,
      date: new Date(item.timestamp).toLocaleDateString(),
    }));
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#00d4aa';
      case 'negative':
        return '#ff6b6b';
      default:
        return '#b0b0b0';
    }
  };

  const formatNewsData = (news: any[]) => {
    return news.map((item, index) => ({
      id: index.toString(),
      title: item.title || item['title'],
      summary: item.summary || item['summary'],
      source: item.source || item['source'],
      publishedAt: item.time_published || item['time_published'],
      url: item.url || item['url'],
      sentiment: item.overall_sentiment_label || 'neutral',
    }));
  };

  const generateMarketData = () => {
    const data = [];
    const baseValue = 4780;
    const today = new Date();
    
    let dataPoints = 30; // Default for 1M
    let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    let timeStep = 1; // Days by default
    
    switch (chartPeriod) {
      case '1D':
        dataPoints = 24; // 24 hours
        dateFormat = { hour: 'numeric', minute: '2-digit' };
        timeStep = 1/24; // Hours
        break;
      case '1W':
        dataPoints = 7; // 7 days
        dateFormat = { weekday: 'short' };
        timeStep = 1; // Days
        break;
      case '1M':
        dataPoints = 30; // 30 days
        dateFormat = { month: 'short', day: 'numeric' };
        timeStep = 1; // Days
        break;
      case '1Y':
        dataPoints = 52; // 52 weeks (weekly data points)
        dateFormat = { month: 'short' };
        timeStep = 7; // Weeks
        break;
    }
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      
      if (chartPeriod === '1D') {
        // For 1D, show hourly data
        date.setHours(date.getHours() - i);
      } else if (chartPeriod === '1Y') {
        // For 1Y, show weekly data
        date.setDate(date.getDate() - (i * 7));
      } else {
        // For 1W and 1M, show daily data
        date.setDate(date.getDate() - i);
      }
      
      // Generate realistic market data with some volatility
      const volatility = chartPeriod === '1D' ? 5 : chartPeriod === '1W' ? 15 : chartPeriod === '1M' ? 40 : 200;
      const randomChange = (Math.random() - 0.5) * volatility;
      const trend = Math.sin(i / (dataPoints / 10)) * (volatility / 3);
      const value = baseValue + randomChange + trend;
      
      data.push({
        date: date.toLocaleDateString('en-US', dateFormat),
        value: Math.max(4700, Math.min(4850, value)) // Keep within reasonable bounds
      });
    }
    
    return data;
  };

  const generateStockChartData = () => {
    if (!selectedStock) return [];
    
    const data = [];
    const baseValue = selectedStock.price;
    const today = new Date();
    
    let dataPoints = 30; // Default for 1M
    let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    let timeStep = 1; // Days by default
    
    switch (stockChartPeriod) {
      case '1D':
        dataPoints = 24; // 24 hours
        dateFormat = { hour: 'numeric', minute: '2-digit' };
        timeStep = 1/24; // Hours
        break;
      case '1W':
        dataPoints = 7; // 7 days
        dateFormat = { weekday: 'short' };
        timeStep = 1; // Days
        break;
      case '1M':
        dataPoints = 30; // 30 days
        dateFormat = { month: 'short', day: 'numeric' };
        timeStep = 1; // Days
        break;
      case '1Y':
        dataPoints = 52; // 52 weeks (weekly data points)
        dateFormat = { month: 'short' };
        timeStep = 7; // Weeks
        break;
    }
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      
      if (stockChartPeriod === '1D') {
        // For 1D, show hourly data
        date.setHours(date.getHours() - i);
      } else if (stockChartPeriod === '1Y') {
        // For 1Y, show weekly data
        date.setDate(date.getDate() - (i * 7));
      } else {
        // For 1W and 1M, show daily data
        date.setDate(date.getDate() - i);
      }
      
      // Generate realistic stock data with some volatility
      const volatility = stockChartPeriod === '1D' ? baseValue * 0.02 : stockChartPeriod === '1W' ? baseValue * 0.05 : stockChartPeriod === '1M' ? baseValue * 0.1 : baseValue * 0.3;
      const randomChange = (Math.random() - 0.5) * volatility;
      const trend = Math.sin(i / (dataPoints / 10)) * (volatility / 3);
      const value = baseValue + randomChange + trend;
      
      data.push({
        date: date.toLocaleDateString('en-US', dateFormat),
        close: Math.max(baseValue * 0.8, Math.min(baseValue * 1.2, value)) // Keep within reasonable bounds
      });
    }
    
    return data;
  };

  const handleTrade = () => {
    if (!selectedStock || !orderQuantity || parseFloat(orderQuantity) <= 0) {
      setSuccessMessage('Please enter a valid quantity');
      setShowSuccess(true);
      return;
    }

    const quantity = parseFloat(orderQuantity);
    const price = selectedStock.price;
    const totalValue = quantity * price;

    const trade: TradeOrder = {
      symbol: selectedStock.symbol,
      type: orderType,
      quantity,
      price,
      timestamp: new Date(),
    };

    setTradeHistory(prev => [trade, ...prev]);
    setOrderQuantity('');
    
    const action = orderType === 'buy' ? 'bought' : 'sold';
    setSuccessMessage(`Successfully ${action} ${quantity} shares of ${selectedStock.symbol} at $${price.toFixed(2)}`);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        marginLeft: sidebarOpen ? `${drawerWidth}px` : 0,
        marginTop: '64px',
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        backgroundColor: '#000000', // True OLED black
        transition: 'margin-left 0.3s ease',
      }}
    >
      {selectedStock && showDetailPage ? (
        <StockDetailPage
          stock={selectedStock}
          onBack={onHideDetailPage}
          onAddToWatchlist={onAddToWatchlist}
          isInWatchlist={watchlist.some(stock => stock.symbol === selectedStock.symbol)}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      ) : selectedStock ? (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Stock Header */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, backgroundColor: '#0a0a0a' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2
            }}>
              <Box sx={{ flex: '1' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedStock.symbol}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedStock.name}
                </Typography>
              </Box>
              <Box sx={{ 
                textAlign: { xs: 'left', md: 'right' },
                width: { xs: '100%', md: 'auto' }
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${selectedStock.price.toFixed(2)}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'flex-start', md: 'flex-end' }, 
                  gap: 1 
                }}>
                  {selectedStock.change >= 0 ? (
                    <TrendingUp sx={{ color: '#00d4aa' }} />
                  ) : (
                    <TrendingDown sx={{ color: '#ff6b6b' }} />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      color: selectedStock.change >= 0 ? '#00d4aa' : '#ff6b6b',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={onShowDetailPage}
                  sx={{
                    mt: 1,
                    color: '#00d4aa',
                    borderColor: '#00d4aa',
                    '&:hover': {
                      borderColor: '#00d4aa',
                      backgroundColor: '#00d4aa20',
                    },
                  }}
                >
                  View Full Details
                </Button>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Chart Section - Enhanced with functional data */}
            <Box sx={{ flex: '1 1 600px', minWidth: 0, width: '100%' }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a', height: 400, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Price Chart - {selectedStock.symbol}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['1D', '1W', '1M', '1Y'].map((period) => (
                      <Button
                        key={period}
                        variant={period === stockChartPeriod ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setStockChartPeriod(period as '1D' | '1W' | '1M' | '1Y')}
                        sx={{
                          minWidth: '40px',
                          height: '32px',
                          fontSize: '12px',
                          backgroundColor: period === stockChartPeriod ? '#00d4aa' : 'transparent',
                          color: period === stockChartPeriod ? '#000' : '#00d4aa',
                          borderColor: '#00d4aa',
                          '&:hover': {
                            backgroundColor: period === stockChartPeriod ? '#00d4aa' : '#00d4aa20',
                          },
                        }}
                      >
                        {period}
                      </Button>
                    ))}
                  </Box>
                </Box>
                {chartLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                    <CircularProgress sx={{ color: '#00d4aa' }} />
                  </Box>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={generateStockChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#8a8a8a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        interval={stockChartPeriod === '1D' ? 2 : stockChartPeriod === '1W' ? 1 : stockChartPeriod === '1M' ? 5 : 30}
                      />
                      <YAxis 
                        stroke="#8a8a8a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #1a1a1a',
                          color: '#ffffff',
                          borderRadius: '8px',
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#00d4aa"
                        fill="#00d4aa"
                        fillOpacity={0.1}
                        strokeWidth={stockChartPeriod === '1D' ? 2 : stockChartPeriod === '1W' ? 2.5 : 3}
                        dot={stockChartPeriod === '1D' ? { r: 2, fill: '#00d4aa' } : false}
                        activeDot={{ r: 4, fill: '#00d4aa', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                    <Typography color="text.secondary">No chart data available</Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Trading Panel - Working functionality */}
            <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a', height: 400 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Trade
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
                    <Button
                      variant={orderType === 'buy' ? 'contained' : 'outlined'}
                      onClick={() => setOrderType('buy')}
                      sx={{
                        flex: 1,
                        backgroundColor: orderType === 'buy' ? '#00d4aa' : 'transparent',
                        color: orderType === 'buy' ? '#000' : '#00d4aa',
                        '&:hover': {
                          backgroundColor: orderType === 'buy' ? '#00d4aa' : '#00d4aa20',
                        },
                      }}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={orderType === 'sell' ? 'contained' : 'outlined'}
                      onClick={() => setOrderType('sell')}
                      sx={{
                        flex: 1,
                        backgroundColor: orderType === 'sell' ? '#ff6b6b' : 'transparent',
                        color: orderType === 'sell' ? '#000' : '#ff6b6b',
                        '&:hover': {
                          backgroundColor: orderType === 'sell' ? '#ff6b6b' : '#ff6b6b20',
                        },
                      }}
                    >
                      Sell
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">shares</InputAdornment>,
                    }}
                  />

                  <Box sx={{ mb: 2, p: 2, bgcolor: '#0a0a0a', borderRadius: 1, border: '1px solid #1a1a1a' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current Price: ${selectedStock.price.toFixed(2)}
                    </Typography>
                    {orderQuantity && parseFloat(orderQuantity) > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Total Value: ${(parseFloat(orderQuantity) * selectedStock.price).toFixed(2)}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleTrade}
                    disabled={!orderQuantity || parseFloat(orderQuantity) <= 0}
                    sx={{
                      backgroundColor: orderType === 'buy' ? '#00d4aa' : '#ff6b6b',
                      color: '#000',
                      '&:hover': {
                        backgroundColor: orderType === 'buy' ? '#00d4aa' : '#ff6b6b',
                        opacity: 0.8,
                      },
                      '&:disabled': {
                        backgroundColor: '#666',
                        color: '#999',
                      },
                    }}
                  >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol}
                  </Button>
                </Box>

                {/* Trade History */}
                {tradeHistory.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#b0b0b0' }}>
                      Recent Trades
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                      {tradeHistory.slice(0, 3).map((trade, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#0a0a0a', borderRadius: 1, border: '1px solid #1a1a1a' }}>
                          <Typography variant="caption" sx={{ color: trade.type === 'buy' ? '#00d4aa' : '#ff6b6b' }}>
                            {trade.type.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#b0b0b0' }}>
                            {trade.quantity} shares @ ${trade.price.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {trade.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Stock Details - Enhanced with comprehensive information */}
            <Box sx={{ 
              flex: '1 1 400px', 
              minWidth: 0,
              '@media (max-width: 768px)': {
                flex: '1 1 100%'
              }
            }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Stock Details - {selectedStock.symbol}
                </Typography>
                
                {/* Price Information */}
                <Box sx={{ mb: 3, p: 2, bgcolor: '#000000', borderRadius: 1, border: '1px solid #1a1a1a' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#00d4aa' }}>
                    Price Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Current Price</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ${selectedStock.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Change</Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: selectedStock.change >= 0 ? '#00d4aa' : '#ff6b6b'
                        }}
                      >
                        {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Change %</Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: selectedStock.change >= 0 ? '#00d4aa' : '#ff6b6b'
                        }}
                      >
                        {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Volume</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {selectedStock.volume.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Company Metrics */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#00d4aa' }}>
                    Company Metrics
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoney sx={{ mr: 1, color: '#00d4aa', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          Market Cap
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ${(selectedStock.marketCap / 1e9).toFixed(2)}B
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Assessment sx={{ mr: 1, color: '#00d4aa', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          P/E Ratio
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedStock.pe.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoney sx={{ mr: 1, color: '#00d4aa', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          Dividend Yield
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedStock.dividendYield.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <VolumeUp sx={{ mr: 1, color: '#00d4aa', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          Avg Volume
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {(selectedStock.volume * 0.8).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Chart Data Summary */}
                {chartData.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#00d4aa' }}>
                      Chart Data Summary
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: 2,
                      p: 2, 
                      bgcolor: '#000000', 
                      borderRadius: 1, 
                      border: '1px solid #1a1a1a' 
                    }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Period</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {chartData.length} days
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Data Points</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {chartData.length}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Latest Update</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {new Date().toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Source</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Alpha Vantage
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* News Section - Mobile optimized */}
            <Box sx={{ 
              flex: '1 1 400px', 
              minWidth: 0,
              '@media (max-width: 768px)': {
                flex: '1 1 100%'
              }
            }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <Newspaper sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Latest News
                </Typography>
                {newsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} sx={{ color: '#00d4aa' }} />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {formatNewsData(newsData).map((news) => (
                      <Card key={news.id} sx={{ mb: 2, backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: '1 1 200px' }}>
                              {news.title}
                            </Typography>
                            <Chip
                              label={news.sentiment}
                              size="small"
                              sx={{
                                backgroundColor: getSentimentColor(news.sentiment),
                                color: '#000',
                                fontWeight: 'bold',
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {news.summary}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {news.source} • {new Date(news.publishedAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Market Overview Header */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, backgroundColor: '#0a0a0a' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2
            }}>
              <Box sx={{ flex: '1' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff' }}>
                  Market Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Real-time market data and performance insights
                </Typography>
              </Box>
              <Box sx={{ 
                textAlign: { xs: 'left', md: 'right' },
                width: { xs: '100%', md: 'auto' }
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#00d4aa' }}>
                  S&P 500
                </Typography>
                <Typography variant="h6" sx={{ color: '#00d4aa', fontWeight: 'bold' }}>
                  4,783.35 +15.67 (+0.33%)
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Main Market Chart */}
            <Box sx={{ flex: '1 1 800px', minWidth: 0, width: '100%' }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a', height: 500, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff' }}>
                    Market Performance - S&P 500 Index
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['1D', '1W', '1M', '1Y'].map((period) => (
                      <Button
                        key={period}
                        variant={period === '1M' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setChartPeriod(period as '1D' | '1W' | '1M' | '1Y')}
                        sx={{
                          minWidth: '40px',
                          height: '32px',
                          fontSize: '12px',
                          backgroundColor: period === '1M' ? '#00d4aa' : 'transparent',
                          color: period === '1M' ? '#000' : '#00d4aa',
                          borderColor: '#00d4aa',
                          '&:hover': {
                            backgroundColor: period === '1M' ? '#00d4aa' : '#00d4aa20',
                          },
                        }}
                      >
                        {period}
                      </Button>
                    ))}
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={420}>
                  <AreaChart data={generateMarketData()}>
                    <defs>
                      <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#8a8a8a"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval={chartPeriod === '1D' ? 2 : chartPeriod === '1W' ? 1 : chartPeriod === '1M' ? 5 : 30}
                    />
                    <YAxis 
                      stroke="#8a8a8a"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                      domain={['dataMin - 20', 'dataMax + 20']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #1a1a1a',
                        color: '#ffffff',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [`${value.toFixed(2)}`, 'Index']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00d4aa"
                      fill="url(#marketGradient)"
                      strokeWidth={chartPeriod === '1D' ? 2 : chartPeriod === '1W' ? 2.5 : 3}
                      dot={chartPeriod === '1D' ? { r: 2, fill: '#00d4aa' } : false}
                      activeDot={{ r: 6, fill: '#00d4aa', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Box>

            {/* Market Stats */}
            <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a', height: 500 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#ffffff' }}>
                  Market Statistics
                </Typography>
                
                {/* Major Indices */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#00d4aa' }}>
                    Major Indices
                  </Typography>
                  {[
                    { name: 'S&P 500', value: '4,783.35', change: '+15.67', changePercent: '+0.33%', color: '#00d4aa' },
                    { name: 'NASDAQ', value: '14,947.35', change: '+45.23', changePercent: '+0.30%', color: '#00d4aa' },
                    { name: 'DOW', value: '37,305.16', change: '-12.45', changePercent: '-0.03%', color: '#ff6b6b' },
                  ].map((index) => (
                    <Box key={index.name} sx={{ mb: 2, p: 2, bgcolor: '#000000', borderRadius: 1, border: '1px solid #1a1a1a' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {index.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: index.color, fontWeight: 'bold' }}>
                          {index.changePercent}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {index.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: index.color }}>
                        {index.change}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Sector Performance */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#00d4aa' }}>
                    Sector Performance
                  </Typography>
                  {[
                    { name: 'Technology', change: '+1.2%', color: '#00d4aa' },
                    { name: 'Healthcare', change: '-0.3%', color: '#ff6b6b' },
                    { name: 'Financial', change: '+0.8%', color: '#00d4aa' },
                    { name: 'Energy', change: '-1.1%', color: '#ff6b6b' },
                    { name: 'Consumer', change: '+0.5%', color: '#00d4aa' },
                  ].map((sector) => (
                    <Box key={sector.name} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: '#1a1a1a' }
                    }}>
                      <Typography variant="body2">
                        {sector.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: sector.color, fontWeight: 'bold' }}>
                        {sector.change}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Top Movers */}
            <Box sx={{ 
              flex: '1 1 400px', 
              minWidth: 0,
              '@media (max-width: 768px)': {
                flex: '1 1 100%'
              }
            }}>
              <Paper sx={{ p: 3, backgroundColor: '#0a0a0a', height: 500 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#ffffff' }}>
                  Top Movers
                </Typography>
                
                {/* Top Gainers */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#00d4aa' }}>
                    Top Gainers
                  </Typography>
                  {[
                    { symbol: 'NVDA', name: 'NVIDIA', price: '485.09', change: '+12.45', changePercent: '+2.64%' },
                    { symbol: 'TSLA', name: 'Tesla', price: '248.50', change: '+8.20', changePercent: '+3.41%' },
                    { symbol: 'META', name: 'Meta', price: '334.92', change: '+6.78', changePercent: '+2.07%' },
                  ].map((stock) => (
                    <Box key={stock.symbol} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      bgcolor: '#000000',
                      borderRadius: 1,
                      border: '1px solid #1a1a1a',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#1a1a1a' }
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stock.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stock.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${stock.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00d4aa' }}>
                          {stock.change} ({stock.changePercent})
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Top Losers */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#ff6b6b' }}>
                    Top Losers
                  </Typography>
                  {[
                    { symbol: 'AAPL', name: 'Apple', price: '175.43', change: '-2.15', changePercent: '-1.21%' },
                    { symbol: 'AMZN', name: 'Amazon', price: '145.24', change: '-1.87', changePercent: '-1.27%' },
                    { symbol: 'GOOGL', name: 'Alphabet', price: '142.56', change: '-1.45', changePercent: '-1.01%' },
                  ].map((stock) => (
                    <Box key={stock.symbol} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      bgcolor: '#000000',
                      borderRadius: 1,
                      border: '1px solid #1a1a1a',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#1a1a1a' }
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stock.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stock.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${stock.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ff6b6b' }}>
                          {stock.change} ({stock.changePercent})
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainContent; 