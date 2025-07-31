// API Configuration
export const API_CONFIG = {
  // Alpha Vantage API - Get your free key from https://www.alphavantage.co/support/#api-key
  ALPHA_VANTAGE_API_KEY: (import.meta as any).env?.VITE_ALPHA_VANTAGE_API_KEY,
  BASE_URL: 'https://www.alphavantage.co/query',
  
  // Rate limiting (Alpha Vantage free tier: 5 API calls per minute)
  RATE_LIMIT: {
    CALLS_PER_MINUTE: 5,
    UPDATE_INTERVAL: 120000, // 2 minutes - more conservative to avoid rate limits
  },
};

// Debug: Log API configuration (only in development)
if ((import.meta as any).env?.DEV) {
  console.log('🔧 API Config loaded:', {
    hasApiKey: !!API_CONFIG.ALPHA_VANTAGE_API_KEY,
    apiKeyLength: API_CONFIG.ALPHA_VANTAGE_API_KEY?.length || 0,
    baseUrl: API_CONFIG.BASE_URL
  });
}

// Validate API key (only in development)
if (!API_CONFIG.ALPHA_VANTAGE_API_KEY && (import.meta as any).env?.DEV) {
  console.error('❌ VITE_ALPHA_VANTAGE_API_KEY is not set in your .env file');
  console.error('📝 Please add your Alpha Vantage API key to the .env file:');
  console.error('   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here');
  console.error('🔗 Get a free API key from: https://www.alphavantage.co/support/#api-key');
}

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