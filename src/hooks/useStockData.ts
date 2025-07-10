import { useState, useEffect, useCallback } from 'react';
import { StockData, ChartData } from '../types/trading';
import { 
  financialAPI, 
  convertQuoteToStockData, 
  convertHistoricalDataToChartData,
  AlphaVantageSearchResult 
} from '../services/api';
import { POPULAR_STOCKS } from '../config/api';

export const useStockData = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<AlphaVantageSearchResult[]>([]);

  // Popular stocks to load initially
  const popularStocks: string[] = POPULAR_STOCKS;

  // Load initial stock data
  const loadInitialStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stockPromises = popularStocks.map(async (symbol) => {
        const quote = await financialAPI.getQuote(symbol);
        if (quote) {
          return convertQuoteToStockData(quote);
        }
        return null;
      });

      const stockResults = await Promise.all(stockPromises);
      const validStocks = stockResults.filter((stock): stock is StockData => stock !== null);
      setStocks(validStocks);
    } catch (err) {
      setError('Failed to load stock data. Please try again later.');
      console.error('Error loading initial stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search for stocks
  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await financialAPI.searchStocks(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching stocks:', err);
      setSearchResults([]);
    }
  }, []);

  // Get stock by symbol
  const getStockBySymbol = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      const quote = await financialAPI.getQuote(symbol);
      if (quote) {
        return convertQuoteToStockData(quote);
      }
      return null;
    } catch (err) {
      console.error('Error fetching stock:', err);
      return null;
    }
  }, []);

  // Get historical data for charts
  const getHistoricalData = useCallback(async (symbol: string): Promise<ChartData[]> => {
    try {
      const data = await financialAPI.getHistoricalData(symbol, 'compact');
      if (data) {
        return convertHistoricalDataToChartData(data);
      }
      return [];
    } catch (err) {
      console.error('Error fetching historical data:', err);
      return [];
    }
  }, []);

  // Update stock prices (simulate real-time updates)
  const updateStockPrices = useCallback(async () => {
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const quote = await financialAPI.getQuote(stock.symbol);
          if (quote) {
            return convertQuoteToStockData(quote);
          }
          return stock;
        })
      );
      setStocks(updatedStocks);
    } catch (err) {
      console.error('Error updating stock prices:', err);
    }
  }, [stocks]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialStocks();
  }, [loadInitialStocks]);

  // Update prices every 30 seconds (to avoid API rate limits)
  useEffect(() => {
    if (stocks.length > 0) {
      const interval = setInterval(updateStockPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [stocks, updateStockPrices]);

  return {
    stocks,
    loading,
    error,
    searchResults,
    getStockBySymbol,
    searchStocks,
    getHistoricalData,
    updateStockPrices,
    loadInitialStocks,
  };
}; 