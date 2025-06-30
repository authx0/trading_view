# Paper Trading Application

A comprehensive paper trading platform that allows users to practice trading stocks and options with virtual money before moving to real trading platforms.

## Features

### 🎯 Paper Trading Simulation
- **$100,000 Starting Balance**: Every user starts with $100,000 in virtual money
- **Real-time Price Simulation**: Stock prices change realistically with simulated volatility
- **Portfolio Tracking**: Real-time portfolio value and P&L calculations
- **Reset Functionality**: Reset your portfolio to start fresh anytime

### 📈 Stock Trading
- **10 Popular Stocks**: AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, META, NFLX, SPY, QQQ
- **Buy/Sell Orders**: Execute trades with real-time price updates
- **Position Management**: Track your holdings and average prices
- **Order History**: Complete record of all your trades

### 🎲 Options Trading
- **Call & Put Options**: Trade both call and put options
- **Multiple Expirations**: 7, 14, 30, and 60-day options
- **Strike Price Variety**: Options at 10% below to 10% above current stock price
- **Options Pricing**: Simplified Black-Scholes model for realistic pricing

### 📊 Real-time Features
- **Live Charts**: Interactive price charts for selected stocks
- **Market Data**: Real-time stock prices and percentage changes
- **Portfolio Dashboard**: Live updates of cash, positions, and total value
- **P&L Tracking**: Real-time profit/loss calculations

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+ and pip

### Backend Setup
```bash
cd trading_view/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend will run on `http://localhost:8080`

### Frontend Setup
```bash
cd trading_view/frontend
pnpm install
pnpm dev
```

The frontend will run on `http://localhost:3000`

## How to Use

### 1. Registration
- Enter your name to create a paper trading account
- You'll receive $100,000 in virtual money to start trading

### 2. Stock Trading
- Select a stock from the dropdown menu
- Choose quantity and buy/sell action
- Click the trade button to execute
- Monitor your portfolio for real-time updates

### 3. Options Trading
- Switch to "Options" mode
- Select a stock to see available options
- Choose strike price, expiration, and option type
- Execute call or put option trades

### 4. Portfolio Management
- View your current cash balance
- Track all open positions
- Monitor total portfolio value and P&L
- Reset portfolio anytime to start fresh

### 5. Market Analysis
- View real-time stock prices
- See price charts for selected stocks
- Monitor market movements
- Track order history

## API Endpoints

### User Management
- `POST /api/paper-trading/register` - Register new user
- `POST /api/paper-trading/reset/{user_id}` - Reset portfolio

### Market Data
- `GET /api/paper-trading/stocks` - Get all available stocks
- `GET /api/paper-trading/options/{symbol}` - Get options for a stock

### Trading
- `POST /api/paper-trading/trade` - Execute a trade
- `GET /api/paper-trading/portfolio/{user_id}` - Get user portfolio
- `GET /api/paper-trading/orders/{user_id}` - Get order history

## Technical Details

### Backend (Flask)
- **In-memory Storage**: User data, portfolios, and orders stored in memory
- **Price Simulation**: Realistic price changes with configurable volatility
- **Options Pricing**: Simplified Black-Scholes model
- **CORS Enabled**: Frontend can communicate with backend

### Frontend (Next.js + TypeScript)
- **React Hooks**: State management with useState and useEffect
- **Tailwind CSS**: Modern, responsive styling
- **Canvas Charts**: Custom stock price charts
- **Local Storage**: User session persistence

### Stock Simulation
- **Volatility**: 2% daily volatility for realistic price movements
- **Price Updates**: Simulated on each API call
- **Range Protection**: Prices cannot go below $0.01

### Options Pricing
- **Time Value**: Based on days to expiration
- **Intrinsic Value**: Current stock price vs strike price
- **Volatility Factor**: Simplified volatility calculation
- **Minimum Price**: Options priced at minimum $0.01

## Safety Features

- **Virtual Money Only**: No real money involved
- **Position Validation**: Cannot sell more than you own
- **Fund Validation**: Cannot buy more than your cash allows
- **Error Handling**: Clear error messages for invalid trades

## Future Enhancements

- [ ] Real-time WebSocket connections
- [ ] More sophisticated options pricing models
- [ ] Additional technical indicators
- [ ] Portfolio performance analytics
- [ ] Social features and leaderboards
- [ ] Mobile responsive design improvements
- [ ] Database integration for persistent data
- [ ] Real market data integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Use at your own risk.

---

**Disclaimer**: This is a paper trading simulation for educational purposes only. No real money is involved, and the trading results do not represent actual market performance. 