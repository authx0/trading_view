# Trading View Application

A modern, responsive trading view application built with React, TypeScript, and Material-UI. This application provides a comprehensive trading interface with real-time charts, market data, and portfolio management features.

## Features

### 🎯 Core Features
- **Real-time Stock Charts**: Interactive price charts with area and line chart options
- **Watchlist Management**: Track your favorite stocks with real-time price updates
- **Portfolio Tracking**: Monitor your investments with gain/loss calculations
- **Market Overview**: View major indices and sector performance
- **Trading Interface**: Buy/sell orders with quantity and price inputs
- **News Feed**: Latest financial news with sentiment analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 Data Visualization
- Interactive price charts using Recharts
- Real-time price updates with color-coded changes
- Market cap, volume, P/E ratio, and dividend yield displays
- Sector and index performance tracking

### 🎨 User Interface
- Dark theme optimized for trading environments
- Material-UI components for consistent design
- Collapsible sidebar with watchlist and portfolio sections
- Search functionality for stocks
- Notification system

## Technology Stack

- **Frontend**: React 19.1.0 with TypeScript
- **UI Framework**: Material-UI (MUI) 7.2.0
- **Charts**: Recharts 3.1.0
- **Build Tool**: Vite 7.0.3
- **Package Manager**: pnpm 10.12.1

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trading_view
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Project Structure

```
trading_view/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx      # Application header
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── MainContent.tsx # Main content area
│   ├── data/               # Mock data and APIs
│   │   └── mockData.ts     # Sample trading data
│   ├── types/              # TypeScript type definitions
│   │   └── trading.ts      # Trading data types
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # Project documentation
```

## Features in Detail

### Stock Selection
- Click on any stock in the sidebar to view detailed information
- Real-time price updates with change indicators
- Comprehensive stock details including volume, market cap, P/E ratio

### Charting
- Interactive price charts with multiple timeframes
- Area charts for better visualization
- Tooltips with detailed price information
- Responsive design that adapts to screen size

### Trading Interface
- Buy/Sell order types
- Quantity and price inputs
- Real-time order validation
- Color-coded buttons for buy (green) and sell (red)

### Market Data
- Major indices (S&P 500, NASDAQ, DOW)
- Sector performance tracking
- Real-time market updates
- Color-coded performance indicators

### News Feed
- Latest financial news
- Sentiment analysis (positive/negative/neutral)
- Source attribution and timestamps
- Collapsible news cards

## Customization

### Theme
The application uses a dark theme optimized for trading environments. You can customize the theme in `src/App.tsx`:

```typescript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4aa', // Green for positive changes
    },
    secondary: {
      main: '#ff6b6b', // Red for negative changes
    },
    // ... other theme options
  },
});
```

### Adding New Stocks
To add new stocks to the watchlist, modify the `mockWatchlist` array in `src/data/mockData.ts`:

```typescript
export const mockWatchlist: WatchlistItem[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24
  },
  // Add more stocks here
];
```

## Future Enhancements

- [ ] Real-time data integration with financial APIs
- [ ] User authentication and account management
- [ ] Advanced charting tools (candlestick, technical indicators)
- [ ] Order history and trade management
- [ ] Mobile app version
- [ ] Real-time notifications
- [ ] Portfolio analytics and reporting
- [ ] Social trading features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a demo application with mock data. For production use, integrate with real financial APIs and implement proper security measures. 