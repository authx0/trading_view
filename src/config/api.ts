// API Configuration
export const API_CONFIG = {
  // Alpha Vantage API - Get your free key from https://www.alphavantage.co/support/#api-key
  ALPHA_VANTAGE_API_KEY: (import.meta as any).env?.VITE_ALPHA_VANTAGE_API_KEY || 'demo',
  BASE_URL: 'https://www.alphavantage.co/query',
  
  // Rate limiting (Alpha Vantage free tier: 5 API calls per minute)
  RATE_LIMIT: {
    CALLS_PER_MINUTE: 5,
    UPDATE_INTERVAL: 30000, // 30 seconds
  },
};

// Popular stocks to load initially
export const POPULAR_STOCKS = [
  'AAPL',  // Apple Inc.
  'MSFT',  // Microsoft Corporation
  'GOOGL', // Alphabet Inc.
  'AMZN',  // Amazon.com Inc.
  'TSLA',  // Tesla Inc.
  'META',  // Meta Platforms Inc.
  'NVDA',  // NVIDIA Corporation
  'NFLX',  // Netflix Inc.
  'JPM',   // JPMorgan Chase & Co.
  'JNJ',   // Johnson & Johnson
];

// API Endpoints
export const API_ENDPOINTS = {
  QUOTE: 'GLOBAL_QUOTE',
  SEARCH: 'SYMBOL_SEARCH',
  HISTORICAL: 'TIME_SERIES_DAILY',
  NEWS: 'NEWS_SENTIMENT',
  MARKET_OVERVIEW: 'TOP_GAINERS_LOSERS',
}; 