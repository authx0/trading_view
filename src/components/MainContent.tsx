import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  VolumeUp,
  AttachMoney,
  Assessment,
  Newspaper,
  ArrowBack,
} from '@mui/icons-material';
import {

  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { StockData, ChartData } from '../types/trading';
import { stockDatabase } from '../services/stockDatabase';
import { formatCurrency, formatNumberWithCommas, formatVolume, formatMarketCap } from '../utils/formatters';


interface MainContentProps {
  selectedStock: StockData | null;
  onShowHomePage: () => void;
}



const MainContent: React.FC<MainContentProps> = ({ 
  selectedStock, 
  onShowHomePage
}) => {

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  const [stockChartPeriod, setStockChartPeriod] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  const [marketData, setMarketData] = useState<any[]>([]);
  const [marketDataLoading, setMarketDataLoading] = useState(false);
  const [stockChartData, setStockChartData] = useState<any[]>([]);
  const [stockChartLoading, setStockChartLoading] = useState(false);



  // Load chart data when stock is selected
  useEffect(() => {
    if (selectedStock) {
      console.log('🔄 Loading chart data for stock:', selectedStock.symbol);
      loadChartData(selectedStock.symbol);
      loadNewsData(selectedStock.symbol);
      // Also load stock chart data
      const loadStockChartData = async () => {
        setStockChartLoading(true);
        try {
          const data = await generateStockChartData();
          console.log('📈 Stock chart data loaded:', data.length, 'points');
          setStockChartData(data);
        } catch (error) {
          console.error('Error loading stock chart data:', error);
          setStockChartData([]); // Set empty array on error
        } finally {
          setStockChartLoading(false);
        }
      };
      loadStockChartData();
    } else {
      // Clear chart data when no stock is selected
      setStockChartData([]);
    }
  }, [selectedStock]);

  // Load market data when chart period changes
  useEffect(() => {
    console.log('🔄 Loading market data for period:', chartPeriod);
    const loadMarketData = async () => {
      setMarketDataLoading(true);
      try {
        const data = await generateMarketData();
        console.log('📈 Market data loaded:', data.length, 'points for period', chartPeriod);
        setMarketData(data);
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setMarketDataLoading(false);
      }
    };
    
    loadMarketData();
  }, [chartPeriod]);

  // Load stock chart data when stock chart period changes
  useEffect(() => {
    if (!selectedStock) return;
    
    console.log('🔄 Reloading stock chart data for period:', stockChartPeriod);
    const loadStockChartData = async () => {
      setStockChartLoading(true);
      try {
        const data = await generateStockChartData();
        console.log('📈 Stock chart data reloaded:', data.length, 'points for period', stockChartPeriod);
        setStockChartData(data);
      } catch (error) {
        console.error('Error loading stock chart data:', error);
        setStockChartData([]); // Set empty array on error
      } finally {
        setStockChartLoading(false);
      }
    };
    
    loadStockChartData();
  }, [stockChartPeriod, selectedStock]);

  const loadChartData = async (symbol: string) => {
    setChartLoading(true);
    try {
      const data = await stockDatabase.generateHistoricalData(symbol, '1M');
      if (data) {
        setChartData(data);
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
      // Mock news data since we don't have news API
      const mockNews = [
        {
          title: `${symbol} Reports Strong Quarterly Earnings`,
          summary: `The company exceeded analyst expectations with revenue growth of 15% year-over-year.`,
          source: 'Financial Times',
          time_published: new Date().toISOString(),
          url: '#',
          overall_sentiment_label: 'positive'
        },
        {
          title: `Analysts Upgrade ${symbol} Price Target`,
          summary: `Multiple investment firms have raised their price targets following recent performance.`,
          source: 'Reuters',
          time_published: new Date(Date.now() - 3600000).toISOString(),
          url: '#',
          overall_sentiment_label: 'positive'
        },
        {
          title: `${symbol} Announces New Product Launch`,
          summary: `The company is set to release innovative products in the coming quarter.`,
          source: 'Bloomberg',
          time_published: new Date(Date.now() - 7200000).toISOString(),
          url: '#',
          overall_sentiment_label: 'neutral'
        }
      ];
      setNewsData(mockNews);
    } catch (error) {
      console.error('Error loading news data:', error);
      setNewsData([]);
    } finally {
      setNewsLoading(false);
    }
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

  const generateMarketData = async () => {
    try {
      // Fetch real S&P 500 data using Alpha Vantage API
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=demo&outputsize=compact`);
      const data = await response.json();
      
      if (data['Time Series (Daily)']) {
        const timeSeriesData = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeriesData).sort().reverse();
        
        let dataPoints = 30; // Default for 1M
        switch (chartPeriod) {
          case '1D':
            dataPoints = 24;
            break;
          case '1W':
            dataPoints = 7;
            break;
          case '1M':
            dataPoints = 30;
            break;
          case '1Y':
            dataPoints = 52;
            break;
        }
        
        const chartData = dates.slice(0, dataPoints).map((date) => {
          const dayData = timeSeriesData[date];
          const closePrice = parseFloat(dayData['4. close']);
          
          // Format date based on period
          let dateLabel = '';
          const dateObj = new Date(date);
          
          if (chartPeriod === '1D') {
            dateLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          } else if (chartPeriod === '1W') {
            dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          } else if (chartPeriod === '1Y') {
            dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short' });
          } else {
            dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          return {
            date: dateLabel,
            value: closePrice
          };
        });
        
        console.log('📊 Market API data received:', chartData.length, 'data points');
        return chartData;
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      console.log('🔄 Falling back to mock market data due to API error');
    }
    
    // Fallback to mock data if API fails
    console.log('🎲 Generating mock market data');
    const data = [];
    const baseValue = 4780;
    const today = new Date();
    
    let dataPoints = 30; // Default for 1M
    
    switch (chartPeriod) {
      case '1D':
        dataPoints = 24; // 24 hours
        break;
      case '1W':
        dataPoints = 7; // 7 days
        break;
      case '1M':
        dataPoints = 30; // 30 days
        break;
      case '1Y':
        dataPoints = 52; // 52 weeks (weekly data points)
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
      
      // Format date based on period
      let dateLabel = '';
      if (chartPeriod === '1D') {
        dateLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (chartPeriod === '1W') {
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (chartPeriod === '1Y') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      data.push({
        date: dateLabel,
        value: Math.max(4700, Math.min(4850, value)) // Keep within reasonable bounds
      });
    }
    
    console.log('✅ Mock market data generated:', data.length, 'data points');
    return data;
  };

  const generateStockChartData = async () => {
    if (!selectedStock) return [];
    
    // For debugging, let's always generate mock data first
    console.log('🎲 Generating mock chart data for:', selectedStock.symbol);
    const mockData = [];
    const baseValue = selectedStock.price;
    const today = new Date();
    
    let dataPoints = 30; // Default for 1M
    
    switch (stockChartPeriod) {
      case '1D':
        dataPoints = 24; // 24 hours
        break;
      case '1W':
        dataPoints = 7; // 7 days
        break;
      case '1M':
        dataPoints = 30; // 30 days
        break;
      case '1Y':
        dataPoints = 52; // 52 weeks (weekly data points)
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
      
      // Format date based on period
      let dateLabel = '';
      if (stockChartPeriod === '1D') {
        dateLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (stockChartPeriod === '1W') {
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (stockChartPeriod === '1Y') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      mockData.push({
        date: dateLabel,
        close: Math.max(baseValue * 0.8, Math.min(baseValue * 1.2, value)) // Keep within reasonable bounds
      });
    }
    
    console.log('✅ Mock data generated:', mockData.length, 'data points');
    
    // Ensure we always return some data
    if (mockData.length === 0) {
      console.warn('⚠️ No data generated, creating fallback data');
      return [
        { date: 'Today', close: baseValue },
        { date: 'Yesterday', close: baseValue * 0.98 },
        { date: '2 days ago', close: baseValue * 1.02 }
      ];
    }
    
    return mockData;
  };







  return (
    <Box
      component="main"
      sx={{
        height: '100vh',
        overflow: 'auto',
        backgroundColor: '#000000', // True OLED black
      }}
    >
      {selectedStock ? (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Stock Header */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, backgroundColor: '#0a0a0a' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 0 } }}>
                <IconButton
                  onClick={onShowHomePage}
                  sx={{ 
                    color: '#00d4aa',
                    '&:hover': { backgroundColor: 'rgba(0, 212, 170, 0.1)' }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {selectedStock.symbol}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedStock.name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                textAlign: { xs: 'left', md: 'right' },
                width: { xs: '100%', md: 'auto' }
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatCurrency(selectedStock.price)}
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
                    {selectedStock.change >= 0 ? '+' : ''}{formatCurrency(selectedStock.change)} ({formatNumberWithCommas(selectedStock.changePercent, 2)}%)
                  </Typography>
                </Box>

              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap' }}>
            {/* Chart Section - Enhanced with functional data */}
            <Box sx={{ flex: '1 1 600px', minWidth: 0, width: '100%' }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#0a0a0a', height: { xs: 300, sm: 400 }, width: '100%' }}>
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
                {/* Stock Database Notice */}
                <Box sx={{ mb: 2, p: 1, bgcolor: '#1a1a1a', borderRadius: 1, border: '1px solid #00d4aa' }}>
                  <Typography variant="caption" sx={{ color: '#00d4aa', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>📊</span>
                    Using US Stock Symbols database. Data updated nightly. Charts show simulated historical data.
                  </Typography>
                </Box>
                {chartLoading || stockChartLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                    <CircularProgress sx={{ color: '#00d4aa' }} />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={stockChartData.length > 0 ? stockChartData : [
                      { date: 'Jan 1', close: 100 },
                      { date: 'Jan 2', close: 105 },
                      { date: 'Jan 3', close: 102 },
                      { date: 'Jan 4', close: 108 },
                      { date: 'Jan 5', close: 110 }
                    ]}>
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
                        tickFormatter={(value) => formatCurrency(value)}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #1a1a1a',
                          color: '#ffffff',
                          borderRadius: '8px',
                        }}
                        formatter={(value: any) => [formatCurrency(value), 'Price']}
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
                        {formatCurrency(selectedStock.price)}
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
                        {selectedStock.change >= 0 ? '+' : ''}{formatCurrency(selectedStock.change)}
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
                        {selectedStock.change >= 0 ? '+' : ''}{formatNumberWithCommas(selectedStock.changePercent, 2)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Volume</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatVolume(selectedStock.volume)}
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
                        {formatMarketCap(selectedStock.marketCap)}
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
                        {formatNumberWithCommas(selectedStock.pe, 2)}
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
                        {formatNumberWithCommas(selectedStock.dividendYield, 2)}%
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
                        {formatVolume(selectedStock.volume * 0.8)}
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
              <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#0a0a0a' }}>
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
              <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#0a0a0a', height: { xs: 350, sm: 500 }, width: '100%' }}>
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
                {/* Stock Database Notice */}
                <Box sx={{ mb: 2, p: 1, bgcolor: '#1a1a1a', borderRadius: 1, border: '1px solid #00d4aa' }}>
                  <Typography variant="caption" sx={{ color: '#00d4aa', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>📊</span>
                    Using US Stock Symbols database. Data updated nightly. Charts show simulated historical data.
                  </Typography>
                </Box>
                {marketDataLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                    <CircularProgress sx={{ color: '#00d4aa' }} />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={marketData}>
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
                )}
              </Paper>
            </Box>

            {/* Market Stats */}
            <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#0a0a0a', height: { xs: 'auto', sm: 500 } }}>
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
              <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#0a0a0a', height: { xs: 'auto', sm: 500 } }}>
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


    </Box>
  );
};

export default MainContent; 