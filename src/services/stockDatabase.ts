import { StockData } from '../types/trading';

interface StockSymbolData {
  symbol: string;
  name: string;
  lastsale: string;
  netchange: string;
  pctchange: string;
  volume: string;
  marketCap: string;
  country: string;
  ipoyear: string;
  industry: string;
  sector: string;
  url: string;
}

class StockDatabaseService {
  private stockData: StockSymbolData[] = [];
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  // Fetch stock data from the US-Stock-Symbols repository
  async loadStockData(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.fetchAllStockData();
    await this.loadingPromise;
  }

  private async fetchAllStockData(): Promise<void> {
    try {
      console.log('📊 Loading stock data from US-Stock-Symbols repository...');
      
      // Fetch data from all exchanges
      const [nasdaqData, nyseData, amexData] = await Promise.all([
        this.fetchExchangeData('nasdaq'),
        this.fetchExchangeData('nyse'),
        this.fetchExchangeData('amex')
      ]);

      // Combine all data
      this.stockData = [...nasdaqData, ...nyseData, ...amexData];
      
      // Remove duplicates based on symbol
      const uniqueSymbols = new Set<string>();
      this.stockData = this.stockData.filter(stock => {
        if (uniqueSymbols.has(stock.symbol)) {
          return false;
        }
        uniqueSymbols.add(stock.symbol);
        return true;
      });

      this.isLoaded = true;
      console.log(`✅ Loaded ${this.stockData.length} unique stock symbols`);
    } catch (error) {
      console.error('❌ Error loading stock data:', error);
      throw error;
    }
  }

  private async fetchExchangeData(exchange: string): Promise<StockSymbolData[]> {
    try {
      const url = `https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/${exchange}/${exchange}_full_tickers.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${exchange} data: ${response.status}`);
      }
      
      const data: StockSymbolData[] = await response.json();
      console.log(`📈 Loaded ${data.length} symbols from ${exchange.toUpperCase()}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${exchange} data:`, error);
      return [];
    }
  }

  // Search stocks by symbol or name
  async searchStocks(query: string): Promise<StockData[]> {
    await this.loadStockData();
    
    if (!query.trim()) return [];
    
    const searchTerm = query.toUpperCase();
    const results = this.stockData
      .filter(stock => 
        stock.symbol.toUpperCase().includes(searchTerm) ||
        stock.name.toUpperCase().includes(searchTerm)
      )
      .slice(0, 20) // Limit to 20 results
      .map(stock => this.convertToStockData(stock));
    
    console.log(`🔍 Found ${results.length} stocks matching "${query}"`);
    return results;
  }

  // Get stock by symbol
  async getStockBySymbol(symbol: string): Promise<StockData | null> {
    await this.loadStockData();
    
    const stock = this.stockData.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (!stock) return null;
    
    return this.convertToStockData(stock);
  }

  // Get popular stocks (top stocks by market cap or volume)
  async getPopularStocks(): Promise<StockData[]> {
    await this.loadStockData();
    
    // Filter for stocks with valid data and sort by market cap
    const popularStocks = this.stockData
      .filter(stock => {
        const marketCap = parseFloat(stock.marketCap.replace(/[^0-9.]/g, ''));
        return marketCap > 0 && stock.symbol.length <= 5; // Filter out complex symbols
      })
      .sort((a, b) => {
        const marketCapA = parseFloat(a.marketCap.replace(/[^0-9.]/g, ''));
        const marketCapB = parseFloat(b.marketCap.replace(/[^0-9.]/g, ''));
        return marketCapB - marketCapA;
      })
      .slice(0, 50) // Top 50 stocks
      .map(stock => this.convertToStockData(stock));
    
    console.log(`⭐ Loaded ${popularStocks.length} popular stocks`);
    return popularStocks;
  }

  // Get all stock symbols (for autocomplete)
  async getAllSymbols(): Promise<string[]> {
    await this.loadStockData();
    return this.stockData.map(stock => stock.symbol);
  }

  // Convert repository data format to our app's format
  private convertToStockData(stock: StockSymbolData): StockData {
    const lastSale = parseFloat(stock.lastsale.replace(/[^0-9.]/g, '')) || 0;
    const netChange = parseFloat(stock.netchange) || 0;
    const pctChange = parseFloat(stock.pctchange.replace('%', '')) || 0;
    const volume = parseInt(stock.volume.replace(/,/g, '')) || 0;
    const marketCap = parseFloat(stock.marketCap.replace(/[^0-9.]/g, '')) || 0;

    return {
      symbol: stock.symbol,
      name: stock.name,
      price: lastSale,
      change: netChange,
      changePercent: pctChange,
      volume: volume,
      marketCap: marketCap * 1000000, // Convert to actual market cap
      pe: 0, // Not available in this data
      dividend: 0, // Not available in this data
      dividendYield: 0, // Not available in this data
    };
  }

  // Generate realistic historical data for charts
  generateHistoricalData(symbol: string, period: '1D' | '1W' | '1M' | '1Y' = '1M'): any[] {
    const stock = this.stockData.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (!stock) return [];

    const basePrice = parseFloat(stock.lastsale.replace(/[^0-9.]/g, '')) || 100;
    const today = new Date();
    const data = [];

    let dataPoints = 30; // Default for 1M
    switch (period) {
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
        dataPoints = 52; // 52 weeks
        break;
    }

    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      
      if (period === '1D') {
        date.setHours(date.getHours() - i);
      } else if (period === '1Y') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setDate(date.getDate() - i);
      }
      
      // Generate realistic price data
      const volatility = period === '1D' ? basePrice * 0.02 : period === '1W' ? basePrice * 0.05 : period === '1M' ? basePrice * 0.1 : basePrice * 0.3;
      const randomChange = (Math.random() - 0.5) * volatility;
      const trend = Math.sin(i / (dataPoints / 10)) * (volatility / 3);
      const price = basePrice + randomChange + trend;
      
      // Format date label
      let dateLabel = '';
      if (period === '1D') {
        dateLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (period === '1W') {
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === '1Y') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      data.push({
        date: dateLabel,
        close: Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, price))
      });
    }

    return data;
  }

  // Get stock info for display
  getStockInfo(symbol: string) {
    const stock = this.stockData.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (!stock) return null;

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      industry: stock.industry,
      country: stock.country,
      ipoYear: stock.ipoyear,
      url: stock.url
    };
  }
}

// Create singleton instance
export const stockDatabase = new StockDatabaseService(); 