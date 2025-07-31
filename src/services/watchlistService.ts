import { WatchlistItem, StockData } from '../types/trading';

class WatchlistService {
  private readonly WATCHLIST_KEY = 'trading_view_watchlist';

  // Get all watchlist items
  getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(this.WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  }

  // Add a stock to watchlist
  addToWatchlist(stock: StockData): boolean {
    try {
      const watchlist = this.getWatchlist();
      const existingIndex = watchlist.findIndex(item => item.symbol === stock.symbol);
      
      if (existingIndex >= 0) {
        // Update existing item with current data
        watchlist[existingIndex] = {
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
        };
      } else {
        // Add new item
        watchlist.push({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
        });
      }
      
      localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  // Remove a stock from watchlist
  removeFromWatchlist(symbol: string): boolean {
    try {
      const watchlist = this.getWatchlist();
      const filteredWatchlist = watchlist.filter(item => item.symbol !== symbol);
      localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(filteredWatchlist));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  // Check if a stock is in watchlist
  isInWatchlist(symbol: string): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.symbol === symbol);
  }

  // Update watchlist item with current stock data
  updateWatchlistItem(stock: StockData): boolean {
    return this.addToWatchlist(stock); // addToWatchlist handles both add and update
  }

  // Clear entire watchlist
  clearWatchlist(): boolean {
    try {
      localStorage.removeItem(this.WATCHLIST_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      return false;
    }
  }

  // Get watchlist count
  getWatchlistCount(): number {
    return this.getWatchlist().length;
  }
}

// Create singleton instance
export const watchlistService = new WatchlistService(); 