from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import uuid
from datetime import datetime, timedelta
import random
import math

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# In-memory storage (in production, use a database)
users = {}
portfolios = {}
orders = {}
stock_prices = {}

# Sample stocks for paper trading
SAMPLE_STOCKS = {
    'AAPL': {'name': 'Apple Inc.', 'sector': 'Technology', 'current_price': 150.00},
    'GOOGL': {'name': 'Alphabet Inc.', 'sector': 'Technology', 'current_price': 2800.00},
    'MSFT': {'name': 'Microsoft Corporation', 'sector': 'Technology', 'current_price': 300.00},
    'TSLA': {'name': 'Tesla Inc.', 'sector': 'Automotive', 'current_price': 250.00},
    'AMZN': {'name': 'Amazon.com Inc.', 'sector': 'Consumer Discretionary', 'current_price': 3300.00},
    'NVDA': {'name': 'NVIDIA Corporation', 'sector': 'Technology', 'current_price': 450.00},
    'META': {'name': 'Meta Platforms Inc.', 'sector': 'Technology', 'current_price': 350.00},
    'NFLX': {'name': 'Netflix Inc.', 'sector': 'Communication Services', 'current_price': 500.00},
    'SPY': {'name': 'SPDR S&P 500 ETF', 'sector': 'ETF', 'current_price': 450.00},
    'QQQ': {'name': 'Invesco QQQ Trust', 'sector': 'ETF', 'current_price': 380.00}
}

def generate_user_id():
    return str(uuid.uuid4())

def simulate_price_change(symbol, current_price):
    """Simulate realistic price changes"""
    volatility = 0.02  # 2% daily volatility
    change_percent = random.gauss(0, volatility)
    new_price = current_price * (1 + change_percent)
    return round(max(new_price, 0.01), 2)

def update_stock_prices():
    """Update all stock prices with simulated changes"""
    for symbol, data in SAMPLE_STOCKS.items():
        data['current_price'] = simulate_price_change(symbol, data['current_price'])
        stock_prices[symbol] = data['current_price']

def get_option_price(stock_price, strike_price, days_to_expiry, option_type='call'):
    """Calculate option price using Black-Scholes approximation"""
    # Simplified option pricing
    time_value = max(0, stock_price - strike_price) if option_type == 'call' else max(0, strike_price - stock_price)
    time_decay = max(0.01, days_to_expiry / 365)  # Time value
    volatility_factor = stock_price * 0.1 * time_decay  # Simplified volatility
    
    if option_type == 'call':
        return round(max(time_value + volatility_factor, 0.01), 2)
    else:
        return round(max(time_value + volatility_factor, 0.01), 2)

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello from Flask!")

@app.route('/api/paper-trading/register', methods=['POST'])
def register_user():
    """Register a new user for paper trading"""
    data = request.get_json()
    user_id = generate_user_id()
    
    users[user_id] = {
        'id': user_id,
        'name': data.get('name', 'Trader'),
        'email': data.get('email', ''),
        'created_at': datetime.now().isoformat(),
        'initial_balance': 100000
    }
    
    # Initialize portfolio
    portfolios[user_id] = {
        'cash': 100000,
        'positions': {},
        'total_value': 100000,
        'pnl': 0,
        'pnl_percentage': 0
    }
    
    return jsonify({
        'user_id': user_id,
        'message': 'User registered successfully',
        'initial_balance': 100000
    })

@app.route('/api/paper-trading/stocks', methods=['GET'])
def get_stocks():
    """Get available stocks for trading"""
    update_stock_prices()  # Simulate price changes
    return jsonify({
        'stocks': SAMPLE_STOCKS,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/paper-trading/portfolio/<user_id>', methods=['GET'])
def get_portfolio(user_id):
    """Get user's portfolio"""
    if user_id not in portfolios:
        return jsonify({'error': 'User not found'}), 404
    
    portfolio = portfolios[user_id]
    
    # Calculate current portfolio value
    total_value = portfolio['cash']
    positions_value = 0
    
    for symbol, position in portfolio['positions'].items():
        if symbol in SAMPLE_STOCKS:
            current_price = SAMPLE_STOCKS[symbol]['current_price']
            if position['type'] == 'stock':
                positions_value += position['quantity'] * current_price
            elif position['type'] == 'option':
                # For options, calculate current value
                option_value = get_option_price(
                    SAMPLE_STOCKS[symbol]['current_price'],
                    position['strike_price'],
                    position['days_to_expiry'],
                    position['option_type']
                )
                positions_value += position['quantity'] * option_value * 100  # Options are for 100 shares
    
    portfolio['total_value'] = total_value + positions_value
    portfolio['pnl'] = portfolio['total_value'] - 100000  # Initial balance
    portfolio['pnl_percentage'] = (portfolio['pnl'] / 100000) * 100
    
    return jsonify(portfolio)

@app.route('/api/paper-trading/trade', methods=['POST'])
def place_trade():
    """Place a trade (buy/sell stocks or options)"""
    data = request.get_json()
    user_id = data.get('user_id')
    symbol = data.get('symbol')
    quantity = data.get('quantity', 1)
    trade_type = data.get('trade_type')  # 'buy' or 'sell'
    asset_type = data.get('asset_type', 'stock')  # 'stock' or 'option'
    
    if user_id not in portfolios:
        return jsonify({'error': 'User not found'}), 404
    
    if symbol not in SAMPLE_STOCKS:
        return jsonify({'error': 'Stock not found'}), 404
    
    portfolio = portfolios[user_id]
    current_price = SAMPLE_STOCKS[symbol]['current_price']
    
    if asset_type == 'stock':
        # Stock trading
        if trade_type == 'buy':
            cost = quantity * current_price
            if portfolio['cash'] < cost:
                return jsonify({'error': 'Insufficient funds'}), 400
            
            portfolio['cash'] -= cost
            if symbol in portfolio['positions']:
                portfolio['positions'][symbol]['quantity'] += quantity
            else:
                portfolio['positions'][symbol] = {
                    'quantity': quantity,
                    'type': 'stock',
                    'avg_price': current_price
                }
        
        elif trade_type == 'sell':
            if symbol not in portfolio['positions'] or portfolio['positions'][symbol]['quantity'] < quantity:
                return jsonify({'error': 'Insufficient shares'}), 400
            
            proceeds = quantity * current_price
            portfolio['cash'] += proceeds
            portfolio['positions'][symbol]['quantity'] -= quantity
            
            if portfolio['positions'][symbol]['quantity'] == 0:
                del portfolio['positions'][symbol]
    
    elif asset_type == 'option':
        # Options trading
        strike_price = data.get('strike_price')
        option_type = data.get('option_type')  # 'call' or 'put'
        days_to_expiry = data.get('days_to_expiry', 30)
        
        option_price = get_option_price(current_price, strike_price, days_to_expiry, option_type)
        option_key = f"{symbol}_{option_type}_{strike_price}_{days_to_expiry}"
        
        if trade_type == 'buy':
            cost = quantity * option_price * 100  # Options are for 100 shares
            if portfolio['cash'] < cost:
                return jsonify({'error': 'Insufficient funds'}), 400
            
            portfolio['cash'] -= cost
            if option_key in portfolio['positions']:
                portfolio['positions'][option_key]['quantity'] += quantity
            else:
                portfolio['positions'][option_key] = {
                    'quantity': quantity,
                    'type': 'option',
                    'symbol': symbol,
                    'strike_price': strike_price,
                    'option_type': option_type,
                    'days_to_expiry': days_to_expiry,
                    'avg_price': option_price
                }
        
        elif trade_type == 'sell':
            if option_key not in portfolio['positions'] or portfolio['positions'][option_key]['quantity'] < quantity:
                return jsonify({'error': 'Insufficient options'}), 400
            
            proceeds = quantity * option_price * 100
            portfolio['cash'] += proceeds
            portfolio['positions'][option_key]['quantity'] -= quantity
            
            if portfolio['positions'][option_key]['quantity'] == 0:
                del portfolio['positions'][option_key]
    
    # Record the trade
    order_id = str(uuid.uuid4())
    orders[order_id] = {
        'id': order_id,
        'user_id': user_id,
        'symbol': symbol,
        'quantity': quantity,
        'price': current_price,
        'trade_type': trade_type,
        'asset_type': asset_type,
        'timestamp': datetime.now().isoformat(),
        'status': 'filled'
    }
    
    return jsonify({
        'message': 'Trade executed successfully',
        'order_id': order_id,
        'portfolio': portfolio
    })

@app.route('/api/paper-trading/orders/<user_id>', methods=['GET'])
def get_orders(user_id):
    """Get user's order history"""
    user_orders = [order for order in orders.values() if order['user_id'] == user_id]
    return jsonify({'orders': user_orders})

@app.route('/api/paper-trading/options/<symbol>', methods=['GET'])
def get_options(symbol):
    """Get available options for a stock"""
    if symbol not in SAMPLE_STOCKS:
        return jsonify({'error': 'Stock not found'}), 404
    
    current_price = SAMPLE_STOCKS[symbol]['current_price']
    options = []
    
    # Generate option chains
    for days in [7, 14, 30, 60]:
        for strike_offset in [-0.1, -0.05, 0, 0.05, 0.1]:  # 10% below to 10% above current price
            strike_price = round(current_price * (1 + strike_offset), 2)
            
            # Call options
            call_price = get_option_price(current_price, strike_price, days, 'call')
            options.append({
                'symbol': symbol,
                'strike_price': strike_price,
                'expiry_days': days,
                'option_type': 'call',
                'price': call_price,
                'underlying_price': current_price
            })
            
            # Put options
            put_price = get_option_price(current_price, strike_price, days, 'put')
            options.append({
                'symbol': symbol,
                'strike_price': strike_price,
                'expiry_days': days,
                'option_type': 'put',
                'price': put_price,
                'underlying_price': current_price
            })
    
    return jsonify({'options': options})

@app.route('/api/paper-trading/reset/<user_id>', methods=['POST'])
def reset_portfolio(user_id):
    """Reset user's portfolio to initial state"""
    if user_id not in portfolios:
        return jsonify({'error': 'User not found'}), 404
    
    portfolios[user_id] = {
        'cash': 100000,
        'positions': {},
        'total_value': 100000,
        'pnl': 0,
        'pnl_percentage': 0
    }
    
    return jsonify({
        'message': 'Portfolio reset successfully',
        'portfolio': portfolios[user_id]
    })

if __name__ == '__main__':
    app.run(debug=True, port=8080)
