import { StockData, ChartData, WatchlistItem, PortfolioItem, NewsItem, MarketData } from '../types/trading';

export const mockStocks: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2750000000000,
    pe: 28.5,
    dividend: 0.92,
    dividendYield: 0.52
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.11,
    change: -1.23,
    changePercent: -0.36,
    volume: 23456700,
    marketCap: 2510000000000,
    pe: 32.1,
    dividend: 2.72,
    dividendYield: 0.80
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 3.45,
    changePercent: 2.48,
    volume: 18923400,
    marketCap: 1790000000000,
    pe: 25.8,
    dividend: 0,
    dividendYield: 0
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.24,
    change: 1.87,
    changePercent: 1.30,
    volume: 34567800,
    marketCap: 1510000000000,
    pe: 45.2,
    dividend: 0,
    dividendYield: 0
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.50,
    change: -5.20,
    changePercent: -2.05,
    volume: 67890100,
    marketCap: 789000000000,
    pe: 65.3,
    dividend: 0,
    dividendYield: 0
  }
];

export const mockChartData: ChartData[] = Array.from({ length: 100 }, (_, i) => ({
  timestamp: Date.now() - (100 - i) * 24 * 60 * 60 * 1000,
  open: 170 + Math.random() * 10,
  high: 175 + Math.random() * 10,
  low: 165 + Math.random() * 10,
  close: 172 + Math.random() * 10,
  volume: 1000000 + Math.random() * 5000000
}));

export const mockWatchlist: WatchlistItem[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.11,
    change: -1.23,
    changePercent: -0.36
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 3.45,
    changePercent: 2.48
  }
];

export const mockPortfolio: PortfolioItem[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 100,
    avgPrice: 165.20,
    currentPrice: 175.43,
    totalValue: 17543,
    gainLoss: 1023,
    gainLossPercent: 6.19
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 50,
    avgPrice: 320.45,
    currentPrice: 338.11,
    totalValue: 16905.5,
    gainLoss: 883,
    gainLossPercent: 5.51
  }
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
    summary: 'The Federal Reserve indicated today that it may consider interest rate cuts in 2024, citing improved inflation data and economic stability.',
    source: 'Financial Times',
    publishedAt: '2024-01-15T10:30:00Z',
    url: '#',
    sentiment: 'positive'
  },
  {
    id: '2',
    title: 'Tech Stocks Rally on Strong Earnings Reports',
    summary: 'Major technology companies reported better-than-expected earnings, driving a broad market rally in the tech sector.',
    source: 'Wall Street Journal',
    publishedAt: '2024-01-15T09:15:00Z',
    url: '#',
    sentiment: 'positive'
  },
  {
    id: '3',
    title: 'Oil Prices Decline Amid Global Supply Concerns',
    summary: 'Crude oil prices fell today as concerns about global supply and demand dynamics weighed on the market.',
    source: 'Reuters',
    publishedAt: '2024-01-15T08:45:00Z',
    url: '#',
    sentiment: 'negative'
  }
];

export const mockMarketData: MarketData = {
  indices: [
    {
      name: 'S&P 500',
      value: 4783.35,
      change: 15.67,
      changePercent: 0.33
    },
    {
      name: 'NASDAQ',
      value: 14947.35,
      change: 45.23,
      changePercent: 0.30
    },
    {
      name: 'DOW',
      value: 37305.16,
      change: -12.45,
      changePercent: -0.03
    }
  ],
  sectors: [
    {
      name: 'Technology',
      change: 1.2,
      changePercent: 0.85
    },
    {
      name: 'Healthcare',
      change: -0.3,
      changePercent: -0.15
    },
    {
      name: 'Financial',
      change: 0.8,
      changePercent: 0.45
    },
    {
      name: 'Energy',
      change: -1.1,
      changePercent: -0.65
    }
  ]
}; 