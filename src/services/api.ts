import axios from 'axios';

import { API_CONFIG } from '../config/api';

// Alpha Vantage API - Free tier

const BASE_URL = API_CONFIG.BASE_URL;

// For demo purposes, we'll use a demo key that provides limited data
// In production, you should get a free API key from Alpha Vantage

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

  constructor(apiKey: string = 'demo') {
    this.apiKey = apiKey;
  }

  // Get real-time quote for a stock
  async getQuote(symbol: string): Promise<AlphaVantageQuote | null> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
      });

      if (response.data['Global Quote']) {
        return response.data['Global Quote'];
      }
      return null;
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Fallback to mock data for demo purposes
      return this.getMockQuote(symbol);
    }
  }

  // Mock quote data for demo purposes
  private getMockQuote(symbol: string): AlphaVantageQuote | null {
    const mockQuotes: { [key: string]: AlphaVantageQuote } = {
      'AAPL': {
        '01. symbol': 'AAPL',
        '02. open': '150.00',
        '03. high': '155.00',
        '04. low': '149.00',
        '05. price': '152.50',
        '06. volume': '50000000',
        '07. latest trading day': '2024-01-15',
        '08. previous close': '150.00',
        '09. change': '2.50',
        '10. change percent': '1.67',
      },
      'MSFT': {
        '01. symbol': 'MSFT',
        '02. open': '380.00',
        '03. high': '385.00',
        '04. low': '378.00',
        '05. price': '382.50',
        '06. volume': '30000000',
        '07. latest trading day': '2024-01-15',
        '08. previous close': '380.00',
        '09. change': '2.50',
        '10. change percent': '0.66',
      },
      'GOOGL': {
        '01. symbol': 'GOOGL',
        '02. open': '140.00',
        '03. high': '142.00',
        '04. low': '139.00',
        '05. price': '141.50',
        '06. volume': '25000000',
        '07. latest trading day': '2024-01-15',
        '08. previous close': '140.00',
        '09. change': '1.50',
        '10. change percent': '1.07',
      },
      'AMZN': {
        '01. symbol': 'AMZN',
        '02. open': '150.00',
        '03. high': '152.00',
        '04. low': '149.00',
        '05. price': '151.00',
        '06. volume': '40000000',
        '07. latest trading day': '2024-01-15',
        '08. previous close': '150.00',
        '09. change': '1.00',
        '10. change percent': '0.67',
      },
      'TSLA': {
        '01. symbol': 'TSLA',
        '02. open': '240.00',
        '03. high': '245.00',
        '04. low': '238.00',
        '05. price': '242.50',
        '06. volume': '60000000',
        '07. latest trading day': '2024-01-15',
        '08. previous close': '240.00',
        '09. change': '2.50',
        '10. change percent': '1.04',
      },
    };

    return mockQuotes[symbol.toUpperCase()] || null;
  }

  // Search for stocks
  async searchStocks(query: string): Promise<AlphaVantageSearchResult[]> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey,
        },
      });

      return response.data.bestMatches || [];
    } catch (error) {
      console.error('Error searching stocks:', error);
      // Fallback to mock data for demo purposes
      return this.getMockSearchResults(query);
    }
  }

  // Mock search results for demo purposes
  private getMockSearchResults(query: string): AlphaVantageSearchResult[] {
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'NFLX', name: 'Netflix Inc.' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
      { symbol: 'JNJ', name: 'Johnson & Johnson' },
      { symbol: 'V', name: 'Visa Inc.' },
      { symbol: 'PG', name: 'Procter & Gamble Co.' },
      { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
      { symbol: 'HD', name: 'Home Depot Inc.' },
      { symbol: 'MA', name: 'Mastercard Inc.' },
      { symbol: 'DIS', name: 'Walt Disney Co.' },
      { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
      { symbol: 'ADBE', name: 'Adobe Inc.' },
      { symbol: 'CRM', name: 'Salesforce Inc.' },
      { symbol: 'NKE', name: 'Nike Inc.' },
    ];

    const filteredStocks = mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );

    return filteredStocks.map(stock => ({
      '1. symbol': stock.symbol,
      '2. name': stock.name,
      '3. type': 'Equity',
      '4. region': 'United States',
      '5. marketOpen': '09:30',
      '6. marketClose': '16:00',
      '7. timezone': 'UTC-05',
      '8. currency': 'USD',
      '9. matchScore': '1.0000',
    }));
  }

  // Get historical data
  async getHistoricalData(symbol: string, outputsize: 'compact' | 'full' = 'compact'): Promise<AlphaVantageTimeSeriesResponse | null> {
    try {
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

// Create API instance
export const financialAPI = new FinancialAPI();

// Helper function to convert Alpha Vantage data to our app's format
export const convertQuoteToStockData = (quote: AlphaVantageQuote) => {
  const price = parseFloat(quote['05. price']);
  const previousClose = parseFloat(quote['08. previous close']);
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  return {
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