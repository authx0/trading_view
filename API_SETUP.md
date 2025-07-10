# API Setup Guide for Trading View Application

## 🚀 Real-Time Data Integration

This application now uses **Alpha Vantage API** to provide real-time financial data including stock quotes, historical data, news, and market information.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** package manager
3. **Alpha Vantage API Key** (free tier available)

## 🔑 Getting Your API Key

### Step 1: Sign Up for Alpha Vantage
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Click "Get Your Free API Key"
3. Fill out the registration form
4. Verify your email address

### Step 2: Get Your API Key
1. Log in to your Alpha Vantage account
2. Copy your API key from the dashboard
3. The key will look like: `ABC123DEF456GHI789`

## ⚙️ Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env` file in the root directory:

```bash
# .env
VITE_ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
```

### Option 2: Direct Configuration

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  ALPHA_VANTAGE_API_KEY: 'your_actual_api_key_here',
  // ... other config
};
```

## 🔄 API Features

### Real-Time Stock Data
- **Live Quotes**: Current price, change, volume
- **Historical Data**: Daily price charts
- **Search**: Find stocks by symbol or company name
- **News**: Financial news with sentiment analysis

### Rate Limits
- **Free Tier**: 5 API calls per minute
- **Update Interval**: 30 seconds (to stay within limits)
- **Error Handling**: Graceful fallbacks to mock data

### Supported Endpoints
- `GLOBAL_QUOTE` - Real-time stock quotes
- `SYMBOL_SEARCH` - Stock symbol search
- `TIME_SERIES_DAILY` - Historical price data
- `NEWS_SENTIMENT` - Financial news with sentiment
- `TOP_GAINERS_LOSERS` - Market overview

## 🎯 How It Works

### 1. Initial Data Loading
```typescript
// Loads popular stocks on app startup
const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', ...];
```

### 2. Real-Time Updates
```typescript
// Updates stock prices every 30 seconds
useEffect(() => {
  const interval = setInterval(updateStockPrices, 30000);
  return () => clearInterval(interval);
}, [stocks]);
```

### 3. Search Functionality
```typescript
// Search for stocks in real-time
const searchStocks = async (query: string) => {
  const results = await financialAPI.searchStocks(query);
  setSearchResults(results);
};
```

### 4. Chart Data
```typescript
// Load historical data for charts
const loadChartData = async (symbol: string) => {
  const data = await financialAPI.getHistoricalData(symbol);
  const chartData = convertHistoricalDataToChartData(data);
  setChartData(chartData);
};
```

## 📊 Data Flow

```
User Action → API Call → Data Processing → UI Update
     ↓              ↓              ↓              ↓
Select Stock → Get Quote → Format Data → Update Chart
Search Stock → Search API → Filter Results → Show Dropdown
Load Chart → Historical API → Convert Data → Render Chart
```

## 🛠️ Error Handling

### API Failures
- **Network Errors**: Fallback to mock data
- **Rate Limits**: Automatic retry with exponential backoff
- **Invalid Data**: Graceful degradation with loading states

### Fallback Strategy
```typescript
try {
  const data = await financialAPI.getQuote(symbol);
  if (data) {
    return convertQuoteToStockData(data);
  }
} catch (error) {
  console.error('API Error:', error);
  return null; // Fallback to mock data
}
```

## 🔧 Customization

### Adding New Stocks
Edit `src/config/api.ts`:

```typescript
export const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
  'META', 'NVDA', 'NFLX', 'JPM', 'JNJ',
  // Add your preferred stocks here
];
```

### Changing Update Frequency
Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  RATE_LIMIT: {
    CALLS_PER_MINUTE: 5,
    UPDATE_INTERVAL: 60000, // 1 minute
  },
};
```

### Adding New API Endpoints
Edit `src/services/api.ts`:

```typescript
// Add new method to FinancialAPI class
async getNewData(symbol: string) {
  const response = await axios.get(BASE_URL, {
    params: {
      function: 'NEW_ENDPOINT',
      symbol: symbol.toUpperCase(),
      apikey: this.apiKey,
    },
  });
  return response.data;
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"API key not found"**
   - Check your `.env` file exists
   - Verify API key is correct
   - Restart the development server

2. **"Rate limit exceeded"**
   - Wait 1 minute before making new requests
   - Check your API key usage in Alpha Vantage dashboard
   - Consider upgrading to paid tier for higher limits

3. **"No data available"**
   - Verify stock symbol is correct
   - Check if market is open (data may be delayed)
   - Try different stock symbols

4. **"Network error"**
   - Check your internet connection
   - Verify Alpha Vantage API is accessible
   - Check browser console for detailed errors

### Debug Mode

Enable debug logging:

```typescript
// In src/services/api.ts
console.log('API Call:', {
  function: 'GLOBAL_QUOTE',
  symbol: symbol.toUpperCase(),
  apikey: this.apiKey,
});
```

## 📈 Performance Optimization

### Caching Strategy
- **Quote Data**: Cache for 30 seconds
- **Historical Data**: Cache for 1 hour
- **Search Results**: Cache for 5 minutes

### Rate Limiting
- **Burst Protection**: Maximum 5 calls per minute
- **Queue System**: Sequential API calls
- **Error Recovery**: Automatic retry with backoff

## 🔒 Security Considerations

### API Key Protection
- **Environment Variables**: Never commit API keys to version control
- **Client-Side**: API key is visible in browser (acceptable for free tier)
- **Production**: Use server-side proxy for sensitive data

### Data Validation
- **Input Sanitization**: Clean user inputs
- **Type Checking**: TypeScript ensures data integrity
- **Error Boundaries**: Graceful error handling

## 🎯 Next Steps

### For Production
1. **Server-Side Proxy**: Move API calls to backend
2. **Database Caching**: Store historical data locally
3. **WebSocket**: Real-time price updates
4. **Authentication**: User accounts and portfolios
5. **Advanced Charts**: Technical indicators and analysis

### For Development
1. **Mock API**: Create local mock server
2. **Testing**: Unit tests for API functions
3. **Documentation**: API documentation
4. **Monitoring**: API usage tracking

## 📞 Support

- **Alpha Vantage Support**: [https://www.alphavantage.co/support/](https://www.alphavantage.co/support/)
- **API Documentation**: [https://www.alphavantage.co/documentation/](https://www.alphavantage.co/documentation/)
- **Rate Limits**: [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)

---

**Note**: The free tier of Alpha Vantage has rate limits. For production use, consider upgrading to a paid plan for higher limits and additional features. 