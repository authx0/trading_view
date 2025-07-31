import axios from 'axios';

import { API_CONFIG } from '../config/api';

// Alpha Vantage API - Free tier

const BASE_URL = API_CONFIG.BASE_URL;

export interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface AlphaVantageSearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface AlphaVantageSearchResponse {
  bestMatches: AlphaVantageSearchResult[];
}

export interface AlphaVantageTimeSeriesData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: AlphaVantageTimeSeriesData;
  };
}

export interface AlphaVantageNewsResponse {
  feed: Array<{
    title: string;
    url: string;
    time_published: string;
    authors: string[];
    summary: string;
    banner_image: string;
    source: string;
    category_within_source: string;
    source_domain: string;
    topics: Array<{
      topic: string;
      relevance_score: string;
    }>;
    overall_sentiment_score: number;
    overall_sentiment_label: string;
  }>;
}

class FinancialAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get real-time quote for a stock
  async getQuote(symbol: string): Promise<AlphaVantageQuote | null> {
    try {
      validateApiKey();
      console.log('📡 API: Fetching quote for symbol:', symbol);
      
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
      });

      console.log('📊 API: Quote response:', response.data);

      // Check for rate limit error
      if (response.data.Information && response.data.Information.includes('rate limit')) {
        console.error('🚫 API: Rate limit exceeded for quote:', response.data.Information);
        throw new Error('Daily API rate limit exceeded (25 requests/day). Please upgrade to premium or wait until tomorrow.');
      }

      if (response.data['Global Quote']) {
        const quote = response.data['Global Quote'];
        console.log('✅ API: Quote data received:', quote);
        return quote;
      } else {
        console.log('⚠️ API: No quote data found for:', symbol);
        return null;
      }
    } catch (error) {
      console.error(`❌ API: Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  // Search for stocks
  async searchStocks(query: string): Promise<AlphaVantageSearchResult[]> {
    try {
      validateApiKey();
      console.log('🔍 API: Searching for query:', query);
      
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey,
        },
      });

      console.log('📊 API: Search response:', response.data);
      
      if (response.data.Information && response.data.Information.includes('rate limit')) {
        console.error('🚫 API: Rate limit exceeded:', response.data.Information);
        throw new Error('Daily API rate limit exceeded (25 requests/day). Please upgrade to premium or wait until tomorrow.');
      }

      return response.data.bestMatches || [];
    } catch (error) {
      console.error('❌ API: Error searching stocks:', error);
      return [];
    }
  }

  // Get historical data
  async getHistoricalData(symbol: string, outputsize: 'compact' | 'full' = 'compact'): Promise<AlphaVantageTimeSeriesResponse | null> {
    try {
      validateApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol.toUpperCase(),
          outputsize,
          apikey: this.apiKey,
        },
      });

      if (response.data['Time Series (Daily)']) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return null;
    }
  }

  // Get news sentiment
  async getNews(symbol: string): Promise<AlphaVantageNewsResponse | null> {
    try {
      validateApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
      });

      if (response.data.feed) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching news:', error);
      return null;
    }
  }

  // Get market overview (top gainers/losers)
  async getMarketOverview(): Promise<any> {
    try {
      validateApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'TOP_GAINERS_LOSERS',
          apikey: this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return null;
    }
  }
}

// Create API instance with the configured API key
export const financialAPI = new FinancialAPI(API_CONFIG.ALPHA_VANTAGE_API_KEY || '');

// Validate API key before making requests
const validateApiKey = () => {
  if ((import.meta as any).env?.DEV) {
    console.log('🔑 Validating API key:', {
      hasApiKey: !!API_CONFIG.ALPHA_VANTAGE_API_KEY,
      apiKeyLength: API_CONFIG.ALPHA_VANTAGE_API_KEY?.length || 0
    });
  }
  
  if (!API_CONFIG.ALPHA_VANTAGE_API_KEY) {
    console.error('❌ API key validation failed: No API key found');
    throw new Error('API key is not configured. Please add VITE_ALPHA_VANTAGE_API_KEY to your .env file');
  }
  
  if ((import.meta as any).env?.DEV) {
    console.log('✅ API key validation passed');
  }
};

// Helper function to convert Alpha Vantage data to our app's format
export const convertQuoteToStockData = (quote: AlphaVantageQuote) => {
  const price = parseFloat(quote['05. price']);
  const previousClose = parseFloat(quote['08. previous close']);
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  const convertedData = {
    symbol: quote['01. symbol'],
    name: quote['01. symbol'], // Alpha Vantage doesn't provide company name in quote
    price,
    change,
    changePercent,
    volume: parseInt(quote['06. volume']),
    marketCap: 0, // Not provided in quote
    pe: 0, // Not provided in quote
    dividend: 0, // Not provided in quote
    dividendYield: 0, // Not provided in quote
  };

  return convertedData;
};

// Helper function to convert historical data to chart format
export const convertHistoricalDataToChartData = (data: AlphaVantageTimeSeriesResponse) => {
  const timeSeries = data['Time Series (Daily)'];
  const chartData = Object.entries(timeSeries).map(([date, values]) => ({
    timestamp: new Date(date).getTime(),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume']),
  }));

  // Sort by date (oldest first)
  return chartData.sort((a, b) => a.timestamp - b.timestamp);
}; 