import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  Assessment,
  Bookmark,
  BookmarkBorder,
  Share,
  MoreVert,
  ArrowBack,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { StockData, ChartData } from '../types/trading';

interface StockDetailPageProps {
  stock: StockData;
  onBack: () => void;
  onAddToWatchlist: (stock: StockData) => void;
  isInWatchlist: boolean;
  onRemoveFromWatchlist: (symbol: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StockDetailPage: React.FC<StockDetailPageProps> = ({
  stock,
  onBack,
  onAddToWatchlist,
  isInWatchlist,
  onRemoveFromWatchlist,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');

  // Load real chart data for the selected stock
  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Fetch real stock data using Alpha Vantage API
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.symbol}&apikey=demo&outputsize=compact`);
        const data = await response.json();
        
        if (data['Time Series (Daily)']) {
          const timeSeriesData = data['Time Series (Daily)'];
          const dates = Object.keys(timeSeriesData).sort().reverse();
          
          let dataPoints = 30; // Default for 1M
          switch (timeframe) {
            case '1D':
              dataPoints = 24;
              break;
            case '1W':
              dataPoints = 7;
              break;
            case '1M':
              dataPoints = 30;
              break;
            case '3M':
              dataPoints = 90;
              break;
            case '1Y':
              dataPoints = 52;
              break;
          }
          
          const chartData: ChartData[] = dates.slice(0, dataPoints).map((date, index) => {
            const dayData = timeSeriesData[date];
            const closePrice = parseFloat(dayData['4. close']);
            const openPrice = parseFloat(dayData['1. open']);
            const highPrice = parseFloat(dayData['2. high']);
            const lowPrice = parseFloat(dayData['3. low']);
            const volume = parseInt(dayData['5. volume']);
            
            return {
              timestamp: new Date(date).getTime(),
              open: openPrice,
              high: highPrice,
              low: lowPrice,
              close: closePrice,
              volume: volume,
            };
          });
          
          setChartData(chartData);
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
        
        // Fallback to mock data if API fails
        const data: ChartData[] = [];
        const basePrice = stock.price;
        const now = new Date();
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          
          const randomChange = (Math.random() - 0.5) * 0.02; // ±1% daily change
          const price = basePrice * (1 + randomChange);
          
          data.push({
            timestamp: date.getTime(),
            open: price * 0.998,
            high: price * 1.005,
            low: price * 0.995,
            close: price,
            volume: Math.floor(Math.random() * 50000000) + 20000000,
          });
        }
        
        setChartData(data);
      }
    };

    loadChartData();
  }, [stock.price, stock.symbol, timeframe]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      onRemoveFromWatchlist(stock.symbol);
    } else {
      onAddToWatchlist(stock);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toString();
  };

  // Get company information based on stock symbol
  const getCompanyInfo = (symbol: string) => {
    const companyData: { [key: string]: any } = {
      'AAPL': {
        name: 'Apple Inc.',
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        founded: '1976',
        ceo: 'Tim Cook',
        marketCap: '$2.5T',
        peRatio: '28.5',
        forwardPE: '26.2',
        pegRatio: '2.1',
        priceToBook: '15.8',
        debtToEquity: '1.2',
        revenue: { '2023': '$394.3B', '2022': '$394.3B', '2021': '$365.8B' },
        netIncome: { '2023': '$97.0B', '2022': '$99.8B', '2021': '$94.7B' },
        eps: { '2023': '$6.16', '2022': '$6.15', '2021': '$5.67' },
        cashFlow: { '2023': '$110.5B', '2022': '$122.2B', '2021': '$104.4B' },
        news: [
          {
            title: "Apple Reports Record Q4 Results Driven by iPhone Sales",
            summary: "Apple Inc. reported record fourth-quarter results, with iPhone sales driving strong performance across all product categories.",
            time: "2 hours ago",
            source: "Reuters"
          },
          {
            title: "Apple's New AI Features Expected to Boost iPhone Sales",
            summary: "Analysts predict that Apple's new AI-powered features will significantly boost iPhone sales in the upcoming quarter.",
            time: "5 hours ago",
            source: "Bloomberg"
          },
          {
            title: "Apple Expands Manufacturing in India",
            summary: "Apple is expanding its manufacturing operations in India, with plans to produce more iPhone models locally.",
            time: "1 day ago",
            source: "CNBC"
          },
          {
            title: "Apple's Services Revenue Continues Strong Growth",
            summary: "Apple's services business continues to show strong growth, with App Store and Apple Music leading the way.",
            time: "2 days ago",
            source: "MarketWatch"
          }
        ]
      },
      'MSFT': {
        name: 'Microsoft Corporation',
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
        sector: 'Technology',
        industry: 'Software',
        founded: '1975',
        ceo: 'Satya Nadella',
        marketCap: '$2.8T',
        peRatio: '35.2',
        forwardPE: '32.1',
        pegRatio: '2.8',
        priceToBook: '12.5',
        debtToEquity: '0.8',
        revenue: { '2023': '$198.3B', '2022': '$198.3B', '2021': '$168.1B' },
        netIncome: { '2023': '$72.4B', '2022': '$72.7B', '2021': '$61.3B' },
        eps: { '2023': '$9.68', '2022': '$9.65', '2021': '$8.12' },
        cashFlow: { '2023': '$87.6B', '2022': '$89.0B', '2021': '$76.7B' },
        news: [
          {
            title: "Microsoft's Cloud Business Drives Strong Q4 Results",
            summary: "Microsoft reported strong fourth-quarter results, with Azure cloud services leading the growth across all business segments.",
            time: "3 hours ago",
            source: "Reuters"
          },
          {
            title: "Microsoft's AI Integration Boosts Office 365 Adoption",
            summary: "Microsoft's AI-powered features in Office 365 are driving increased adoption and customer satisfaction.",
            time: "6 hours ago",
            source: "Bloomberg"
          },
          {
            title: "Microsoft Expands Data Center Operations",
            summary: "Microsoft is expanding its global data center footprint to meet growing cloud computing demand.",
            time: "1 day ago",
            source: "CNBC"
          },
          {
            title: "Microsoft's Gaming Division Shows Strong Performance",
            summary: "Microsoft's gaming business continues to grow, with Xbox Game Pass and cloud gaming leading the way.",
            time: "2 days ago",
            source: "MarketWatch"
          }
        ]
      },
      'GOOGL': {
        name: 'Alphabet Inc.',
        description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. The company offers performance and brand advertising services.',
        sector: 'Technology',
        industry: 'Internet Services',
        founded: '1998',
        ceo: 'Sundar Pichai',
        marketCap: '$1.8T',
        peRatio: '25.8',
        forwardPE: '23.4',
        pegRatio: '1.9',
        priceToBook: '6.2',
        debtToEquity: '0.3',
        revenue: { '2023': '$307.4B', '2022': '$307.4B', '2021': '$257.6B' },
        netIncome: { '2023': '$73.8B', '2022': '$59.9B', '2021': '$76.0B' },
        eps: { '2023': '$5.80', '2022': '$4.56', '2021': '$5.61' },
        cashFlow: { '2023': '$101.7B', '2022': '$93.8B', '2021': '$91.6B' },
        news: [
          {
            title: "Google's AI Advances Drive Advertising Revenue Growth",
            summary: "Alphabet's AI-powered advertising solutions are driving strong revenue growth across all platforms.",
            time: "4 hours ago",
            source: "Reuters"
          },
          {
            title: "Google Cloud Continues Strong Market Share Growth",
            summary: "Google Cloud is gaining market share in the cloud computing space, challenging AWS and Azure.",
            time: "7 hours ago",
            source: "Bloomberg"
          },
          {
            title: "YouTube's Monetization Strategy Shows Results",
            summary: "YouTube's new monetization features are driving increased revenue for content creators.",
            time: "1 day ago",
            source: "CNBC"
          },
          {
            title: "Alphabet's Autonomous Driving Unit Makes Progress",
            summary: "Waymo, Alphabet's autonomous driving subsidiary, is making significant progress in commercial deployment.",
            time: "2 days ago",
            source: "MarketWatch"
          }
        ]
      },
      'AMZN': {
        name: 'Amazon.com Inc.',
        description: 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. The company operates through North America, International, and Amazon Web Services (AWS) segments.',
        sector: 'Consumer Discretionary',
        industry: 'Internet Retail',
        founded: '1994',
        ceo: 'Andy Jassy',
        marketCap: '$1.6T',
        peRatio: '60.2',
        forwardPE: '45.8',
        pegRatio: '3.2',
        priceToBook: '8.9',
        debtToEquity: '1.5',
        revenue: { '2023': '$514.0B', '2022': '$514.0B', '2021': '$469.8B' },
        netIncome: { '2023': '$30.4B', '2022': '$-2.7B', '2021': '$33.4B' },
        eps: { '2023': '$2.90', '2022': '$-0.27', '2021': '$3.24' },
        cashFlow: { '2023': '$84.9B', '2022': '$46.8B', '2021': '$46.3B' },
        news: [
          {
            title: "Amazon's AWS Cloud Business Drives Profit Growth",
            summary: "Amazon Web Services continues to be the primary profit driver for Amazon, with strong cloud adoption.",
            time: "5 hours ago",
            source: "Reuters"
          },
          {
            title: "Amazon's E-commerce Platform Shows Strong Holiday Performance",
            summary: "Amazon's e-commerce platform reported strong performance during the holiday shopping season.",
            time: "8 hours ago",
            source: "Bloomberg"
          },
          {
            title: "Amazon Expands Logistics Network",
            summary: "Amazon is expanding its logistics and delivery network to improve customer experience.",
            time: "1 day ago",
            source: "CNBC"
          },
          {
            title: "Amazon's Advertising Business Grows Rapidly",
            summary: "Amazon's advertising business is growing rapidly, becoming a significant revenue stream.",
            time: "2 days ago",
            source: "MarketWatch"
          }
        ]
      },
      'TSLA': {
        name: 'Tesla Inc.',
        description: 'Tesla Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
        sector: 'Consumer Discretionary',
        industry: 'Automobiles',
        founded: '2003',
        ceo: 'Elon Musk',
        marketCap: '$800B',
        peRatio: '75.3',
        forwardPE: '65.2',
        pegRatio: '4.1',
        priceToBook: '12.8',
        debtToEquity: '0.2',
        revenue: { '2023': '$96.8B', '2022': '$81.5B', '2021': '$53.8B' },
        netIncome: { '2023': '$15.0B', '2022': '$12.6B', '2021': '$5.5B' },
        eps: { '2023': '$4.30', '2022': '$3.62', '2021': '$1.73' },
        cashFlow: { '2023': '$13.3B', '2022': '$14.7B', '2021': '$5.0B' },
        news: [
          {
            title: "Tesla's Electric Vehicle Sales Continue Strong Growth",
            summary: "Tesla reported strong electric vehicle sales growth, with new models driving market expansion.",
            time: "6 hours ago",
            source: "Reuters"
          },
          {
            title: "Tesla's Autonomous Driving Technology Advances",
            summary: "Tesla's Full Self-Driving technology is making significant progress in autonomous driving capabilities.",
            time: "9 hours ago",
            source: "Bloomberg"
          },
          {
            title: "Tesla Expands Global Manufacturing Footprint",
            summary: "Tesla is expanding its manufacturing operations globally to meet growing demand.",
            time: "1 day ago",
            source: "CNBC"
          },
          {
            title: "Tesla's Energy Storage Business Shows Promise",
            summary: "Tesla's energy storage and solar business is growing rapidly, diversifying revenue streams.",
            time: "2 days ago",
            source: "MarketWatch"
          }
        ]
      }
    };

    return companyData[symbol] || {
      name: `${symbol} Inc.`,
      description: 'Company information not available.',
      sector: 'Unknown',
      industry: 'Unknown',
      founded: 'Unknown',
      ceo: 'Unknown',
      marketCap: 'N/A',
      peRatio: 'N/A',
      forwardPE: 'N/A',
      pegRatio: 'N/A',
      priceToBook: 'N/A',
      debtToEquity: 'N/A',
      revenue: { '2023': 'N/A', '2022': 'N/A', '2021': 'N/A' },
      netIncome: { '2023': 'N/A', '2022': 'N/A', '2021': 'N/A' },
      eps: { '2023': 'N/A', '2022': 'N/A', '2021': 'N/A' },
      cashFlow: { '2023': 'N/A', '2022': 'N/A', '2021': 'N/A' },
      news: []
    };
  };

  const companyInfo = getCompanyInfo(stock.symbol);

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', backgroundColor: '#000000' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        backgroundColor: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBack} sx={{ color: '#ffffff', mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {stock.symbol}
            </Typography>
            <Typography variant="body1" sx={{ color: '#8a8a8a' }}>
              {companyInfo.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleWatchlistToggle} sx={{ color: isInWatchlist ? '#00d4aa' : '#8a8a8a' }}>
              {isInWatchlist ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
            <IconButton sx={{ color: '#8a8a8a' }}>
              <Share />
            </IconButton>
            <IconButton sx={{ color: '#8a8a8a' }}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Price Section */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
          <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
            {formatCurrency(stock.price)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {stock.change >= 0 ? (
              <TrendingUp sx={{ color: '#00d4aa' }} />
            ) : (
              <TrendingDown sx={{ color: '#ff6b6b' }} />
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                color: stock.change >= 0 ? '#00d4aa' : '#ff6b6b',
                fontWeight: 'bold'
              }}
            >
              {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({stock.changePercent.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`Volume: ${formatVolume(stock.volume)}`}
            sx={{ backgroundColor: '#1a1a1a', color: '#8a8a8a' }}
          />
          <Chip 
            label={`Market Cap: ${companyInfo.marketCap}`}
            sx={{ backgroundColor: '#1a1a1a', color: '#8a8a8a' }}
          />
          <Chip 
            label={`P/E: ${companyInfo.peRatio}`}
            sx={{ backgroundColor: '#1a1a1a', color: '#8a8a8a' }}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#1a1a1a', backgroundColor: '#0a0a0a' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
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
          <Tab label="Chart" />
          <Tab label="Overview" />
          <Tab label="Financials" />
          <Tab label="News" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Chart Controls */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {(['1D', '1W', '1M', '3M', '1Y'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setTimeframe(period)}
              sx={{
                backgroundColor: timeframe === period ? '#00d4aa' : 'transparent',
                color: timeframe === period ? '#000000' : '#8a8a8a',
                borderColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: timeframe === period ? '#00d4aa' : '#1a1a1a',
                },
              }}
            >
              {period}
            </Button>
          ))}
        </Box>

        {/* Chart */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeframe === '1D') {
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  } else if (timeframe === '1W') {
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  } else if (timeframe === '1Y') {
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  } else {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                }}
                stroke="#8a8a8a"
                interval={timeframe === '1D' ? 2 : timeframe === '1W' ? 1 : timeframe === '1M' ? 5 : timeframe === '3M' ? 15 : 30}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']}
                stroke="#8a8a8a"
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid #1a1a1a',
                  color: '#ffffff'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  if (timeframe === '1D') {
                    return `Time: ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                  } else {
                    return `Date: ${date.toLocaleDateString()}`;
                  }
                }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#00d4aa" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                strokeWidth={timeframe === '1D' ? 2 : timeframe === '1W' ? 2.5 : 3}
                dot={timeframe === '1D' ? { r: 2, fill: '#00d4aa' } : false}
                activeDot={{ r: 6, fill: '#00d4aa', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card sx={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                  Company Overview
                </Typography>
                <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 2 }}>
                  {companyInfo.description}
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Sector" 
                      secondary={companyInfo.sector}
                      primaryTypographyProps={{ color: '#8a8a8a', fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: '#ffffff' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Industry" 
                      secondary={companyInfo.industry}
                      primaryTypographyProps={{ color: '#8a8a8a', fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: '#ffffff' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Founded" 
                      secondary={companyInfo.founded}
                      primaryTypographyProps={{ color: '#8a8a8a', fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: '#ffffff' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="CEO" 
                      secondary={companyInfo.ceo}
                      primaryTypographyProps={{ color: '#8a8a8a', fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: '#ffffff' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card sx={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                  Key Statistics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ color: '#8a8a8a', border: 'none' }}>Market Cap</TableCell>
                        <TableCell sx={{ color: '#ffffff', border: 'none' }}>{companyInfo.marketCap}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#8a8a8a', border: 'none' }}>P/E Ratio</TableCell>
                        <TableCell sx={{ color: '#ffffff', border: 'none' }}>{companyInfo.peRatio}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#8a8a8a', border: 'none' }}>Forward P/E</TableCell>
                        <TableCell sx={{ color: '#ffffff', border: 'none' }}>{companyInfo.forwardPE}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#8a8a8a', border: 'none' }}>PEG Ratio</TableCell>
                        <TableCell sx={{ color: '#ffffff', border: 'none' }}>{companyInfo.pegRatio}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#8a8a8a', border: 'none' }}>Price to Book</TableCell>
                        <TableCell sx={{ color: '#ffffff', border: 'none' }}>{companyInfo.priceToBook}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#8a8a8a', border: 'none' }}>Debt to Equity</TableCell>
                        <TableCell sx={{ color: '#ffffff', border: 'none' }}>{companyInfo.debtToEquity}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box>
          <Card sx={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                Financial Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#8a8a8a', borderColor: '#1a1a1a' }}>Metric</TableCell>
                      <TableCell sx={{ color: '#8a8a8a', borderColor: '#1a1a1a' }}>2023</TableCell>
                      <TableCell sx={{ color: '#8a8a8a', borderColor: '#1a1a1a' }}>2022</TableCell>
                      <TableCell sx={{ color: '#8a8a8a', borderColor: '#1a1a1a' }}>2021</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                                          <TableRow>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>Revenue</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.revenue['2023']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.revenue['2022']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.revenue['2021']}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>Net Income</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.netIncome['2023']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.netIncome['2022']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.netIncome['2021']}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>EPS</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.eps['2023']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.eps['2022']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.eps['2021']}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>Cash Flow</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.cashFlow['2023']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.cashFlow['2022']}</TableCell>
                        <TableCell sx={{ color: '#ffffff', borderColor: '#1a1a1a' }}>{companyInfo.cashFlow['2021']}</TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {companyInfo.news.map((news: any, index: number) => (
            <Box key={index}>
              <Card sx={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ffffff', mb: 1 }}>
                    {news.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8a8a8a', mb: 2 }}>
                    {news.summary}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                      {news.source} • {news.time}
                    </Typography>
                    <Button size="small" sx={{ color: '#00d4aa' }}>
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default StockDetailPage; 