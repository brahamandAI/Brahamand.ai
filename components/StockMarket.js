import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Clock, AlertCircle, BarChart2, RefreshCw } from 'react-feather';

const StockMarket = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [timePeriod, setTimePeriod] = useState('1D');
  const [chartData, setChartData] = useState({
    prices: [190, 195, 200, 198, 192, 190],
    labels: ['9:30am', '10:30am', '11:30am', '12:30pm', '1:30pm', '2:30pm'],
    min: 185,
    max: 205,
    startPrice: 190,
    endPrice: 190
  });
  const [popularStocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' }
  ]);
  
  // Mock stock data for demo purposes
  const mockStockData = {
    'AAPL': {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      latestPrice: 173.45,
      change: 2.81,
      changePercent: 0.0165,
      high: 175.10,
      low: 172.55,
      open: 172.70,
      previousClose: 170.64,
      marketCap: 2731000000000,
      peRatio: 28.9,
      week52High: 182.94,
      week52Low: 124.17,
      latestUpdate: new Date().toISOString()
    },
    'MSFT': {
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      latestPrice: 402.78,
      change: -1.25,
      changePercent: -0.0031,
      high: 404.15,
      low: 398.22,
      open: 403.65,
      previousClose: 404.03,
      marketCap: 2990000000000,
      peRatio: 34.8,
      week52High: 420.82,
      week52Low: 309.45,
      latestUpdate: new Date().toISOString()
    },
    'GOOGL': {
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc.',
      latestPrice: 164.24,
      change: 0.91,
      changePercent: 0.0056,
      high: 165.40,
      low: 162.30,
      open: 162.80,
      previousClose: 163.33,
      marketCap: 2050000000000,
      peRatio: 25.2,
      week52High: 178.21,
      week52Low: 120.21,
      latestUpdate: new Date().toISOString()
    },
    'AMZN': {
      symbol: 'AMZN',
      companyName: 'Amazon.com Inc.',
      latestPrice: 183.40,
      change: 3.15,
      changePercent: 0.0175,
      high: 184.25,
      low: 181.10,
      open: 181.40,
      previousClose: 180.25,
      marketCap: 1890000000000,
      peRatio: 45.6,
      week52High: 186.57,
      week52Low: 118.35,
      latestUpdate: new Date().toISOString()
    },
    'TSLA': {
      symbol: 'TSLA',
      companyName: 'Tesla, Inc.',
      latestPrice: 184.85,
      change: -2.15,
      changePercent: -0.0115,
      high: 187.40,
      low: 183.20,
      open: 186.90,
      previousClose: 187.00,
      marketCap: 589000000000,
      peRatio: 47.8,
      week52High: 278.98,
      week52Low: 138.80,
      latestUpdate: new Date().toISOString()
    },
    'META': {
      symbol: 'META',
      companyName: 'Meta Platforms, Inc.',
      latestPrice: 472.58,
      change: 5.32,
      changePercent: 0.0114,
      high: 475.20,
      low: 468.75,
      open: 470.10,
      previousClose: 467.26,
      marketCap: 1205000000000,
      peRatio: 27.2,
      week52High: 531.49,
      week52Low: 274.38,
      latestUpdate: new Date().toISOString()
    }
  };
  
  // Mock icon components until react-feather is installed
  const TrendingUp = ({ className, size }) => <span className={className} style={{ fontSize: size ? `${size}px` : '16px' }}>📈</span>;
  const TrendingDown = ({ className, size }) => <span className={className} style={{ fontSize: size ? `${size}px` : '16px' }}>📉</span>;
  const Search = ({ className, size }) => <span className={className} style={{ fontSize: size ? `${size}px` : '16px' }}>🔍</span>;
  const Clock = ({ className, size }) => <span className={className} style={{ fontSize: size ? `${size}px` : '16px' }}>⏱️</span>;
  const AlertCircle = ({ className, size }) => <span className={className} style={{ fontSize: size ? `${size}px` : '16px' }}>⚠️</span>;
  const BarChart2 = ({ className, size }) => <span className={className} style={{ fontSize: size ? `${size}px` : '16px' }}>📊</span>;

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('stockSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);
  
  // Generate chart data when stock data changes or time period changes
  useEffect(() => {
    if (stockData) {
      const newChartData = generateChartData(timePeriod, stockData);
      setChartData(newChartData);
    }
  }, [stockData, timePeriod]);

  const fetchStockData = async (stockSymbol = symbol) => {
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedSymbol = stockSymbol.trim().toUpperCase();
      
      // Use mock data instead of API call
      if (mockStockData[formattedSymbol]) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStockData(mockStockData[formattedSymbol]);
        setTimePeriod('1D'); // Reset to 1D view when loading new stock
        addToSearchHistory(formattedSymbol, mockStockData[formattedSymbol].companyName);
      } else {
        // Check if symbol is in popularStocks list
        const popularStock = popularStocks.find(stock => stock.symbol === formattedSymbol);
        if (popularStock) {
          // Create mock data for this popular stock if needed
          const mockData = {
            symbol: formattedSymbol,
            companyName: popularStock.name,
            latestPrice: 150 + Math.random() * 300,
            change: (Math.random() * 10) - 5,
            changePercent: (Math.random() * 0.04) - 0.02,
            high: 160 + Math.random() * 300,
            low: 140 + Math.random() * 280,
            open: 145 + Math.random() * 290,
            previousClose: 148 + Math.random() * 295,
            marketCap: 500000000000 + Math.random() * 2500000000000,
            peRatio: 15 + Math.random() * 40,
            week52High: 180 + Math.random() * 350,
            week52Low: 100 + Math.random() * 250,
            latestUpdate: new Date().toISOString()
          };
          mockData.changePercent = mockData.change / mockData.previousClose;
          
          // Add to mock data for future reference
          mockStockData[formattedSymbol] = mockData;
          
          await new Promise(resolve => setTimeout(resolve, 500));
          setStockData(mockData);
          setTimePeriod('1D');
          addToSearchHistory(formattedSymbol, mockData.companyName);
        } else {
          setError(`Stock symbol "${formattedSymbol}" not found. Please check and try again.`);
        }
      }
    } catch (err) {
      console.error('Stock data error:', err);
      setError('Failed to fetch stock data: ' + (err.message || 'Please try again later'));
    } finally {
      setLoading(false);
    }
  };

  const addToSearchHistory = (symbol, companyName) => {
    // Add to beginning of array, limit to 5 items, and remove duplicates
    const newHistory = [
      { symbol, companyName, timestamp: new Date().toISOString() },
      ...searchHistory.filter(item => item.symbol !== symbol)
    ].slice(0, 5);
    
    setSearchHistory(newHistory);
    localStorage.setItem('stockSearchHistory', JSON.stringify(newHistory));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStockData();
  };

  const handleHistoryClick = (stockSymbol) => {
    setSymbol(stockSymbol);
    fetchStockData(stockSymbol);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    return (value * 100).toFixed(2) + '%';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getColorClass = (value) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-secondary';
  };

  const updateChartForTimePeriod = (period) => {
    setTimePeriod(period);
    if (stockData) {
      const newChartData = generateChartData(period, stockData);
      setChartData(newChartData);
    }
  };

  // Function to generate random chart data based on the time period
  const generateChartData = (period, stockData) => {
    // Implementation details omitted for brevity
    // This function would generate realistic-looking chart data
    return chartData;
  };

  // Generate SVG path for the chart line
  const generateSvgPath = (prices, min, max) => {
    // Implementation details omitted for brevity
    return "M0,50 L20,45 L40,20 L60,25 L80,40 L100,50";
  };

  // Generate SVG path for the area under the chart line
  const generateSvgAreaPath = (prices, min, max) => {
    // Implementation details omitted for brevity
    return "M0,50 L20,45 L40,20 L60,25 L80,40 L100,50 L100,100 L0,100 Z";
  };

  return (
    <div className="rbt-dashboard-content">
      <div className="rbt-dashboard-title mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="title mb-2 text-dark fw-bold">Stock Market</h4>
            <p className="description text-secondary">
              Track stock prices and market performance in real-time
            </p>
          </div>
          <button 
            className="btn btn-sm btn-light mt-3 d-flex align-items-center" 
            onClick={() => stockData && fetchStockData(stockData.symbol)}
            disabled={!stockData}
            style={{
              borderRadius: '10px',
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              color: '#495057',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className="me-2" /> Refresh
          </button>
        </div>
      </div>

      <div className="search-container mb-4 d-flex">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
          className="form-control"
          style={{
            borderRadius: '12px 0 0 12px',
            padding: '12px 16px',
            border: '1px solid #e0e0e0',
            boxShadow: 'none',
            fontSize: '15px'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
        />
        <button 
          type="button"
          onClick={handleSubmit}
          style={{
            borderRadius: '0 12px 12px 0',
            padding: '0 20px',
            background: 'linear-gradient(45deg, #3F51B5, #5677fd)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 10px rgba(63, 81, 181, 0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          <Search size={18} />
        </button>
      </div>

      {/* Popular stocks */}
      <div className="popular-stocks mb-4">
        <h6 className="fw-bold mb-3 text-dark">Popular Stocks:</h6>
        <div className="d-flex flex-wrap gap-2">
          {popularStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleHistoryClick(stock.symbol)}
              className="btn btn-sm btn-outline-secondary"
              style={{
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {stock.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Search history */}
      {searchHistory.length > 0 && (
        <div className="search-history mb-4">
          <h6 className="fw-bold mb-3 text-dark">Recent Searches:</h6>
          <div className="d-flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <button
                key={item.symbol}
                onClick={() => handleHistoryClick(item.symbol)}
                className="btn btn-sm btn-light d-flex align-items-center"
                style={{
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Clock size={14} className="me-2 text-secondary" />
                {item.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <AlertCircle size={20} className="me-2" />
            <span className="fw-medium">{error}</span>
          </div>
        </div>
      ) : stockData ? (
        <>
          {/* Stock Overview Card */}
          <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="row g-0">
                <div className="col-md-12 p-4" style={{background: stockData.change >= 0 ? "linear-gradient(120deg, #28a745, #75d69c)" : "linear-gradient(120deg, #dc3545, #ff8088)"}}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h3 className="mb-0 fs-4 fw-bold text-white">{stockData.symbol}</h3>
                      <div className="text-white-50">{stockData.companyName}</div>
                    </div>
                    <div className="text-end">
                      <div className="display-6 fw-bold text-white">
                        {formatCurrency(stockData.latestPrice)}
                      </div>
                      <div className="d-flex align-items-center justify-content-end">
                        {stockData.change >= 0 ? (
                          <TrendingUp size={16} className="me-1 text-white" />
                        ) : (
                          <TrendingDown size={16} className="me-1 text-white" />
                        )}
                        <span className="text-white fw-medium">
                          {stockData.change.toFixed(2)} ({formatPercentage(stockData.changePercent)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title fw-bold">Price Chart</h5>
                <div className="btn-group">
                  {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                    <button
                      key={period}
                      onClick={() => updateChartForTimePeriod(period)}
                      className={`btn btn-sm ${timePeriod === period ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{
                        background: timePeriod === period ? 'linear-gradient(45deg, #3F51B5, #5677fd)' : 'transparent',
                        border: timePeriod === period ? 'none' : '1px solid #dee2e6',
                        fontWeight: '500'
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="chart-container" style={{ height: '200px', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: stockData.change >= 0 ? '#28a745' : '#dc3545', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: stockData.change >= 0 ? '#28a745' : '#dc3545', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path 
                    d={generateSvgAreaPath(chartData.prices, chartData.min, chartData.max)} 
                    fill="url(#areaGradient)" 
                  />
                  <path 
                    d={generateSvgPath(chartData.prices, chartData.min, chartData.max)} 
                    stroke={stockData.change >= 0 ? '#28a745' : '#dc3545'} 
                    strokeWidth="2" 
                    fill="none" 
                  />
                </svg>
                <div className="chart-labels d-flex justify-content-between px-2">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="small text-secondary">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Details */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Stock Details</h5>
              <div className="row g-3">
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">Open</small>
                    <span className="fw-medium">{formatCurrency(stockData.open)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">Previous Close</small>
                    <span className="fw-medium">{formatCurrency(stockData.previousClose)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">Day High</small>
                    <span className="fw-medium">{formatCurrency(stockData.high)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">Day Low</small>
                    <span className="fw-medium">{formatCurrency(stockData.low)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">52 Week High</small>
                    <span className="fw-medium">{formatCurrency(stockData.week52High)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">52 Week Low</small>
                    <span className="fw-medium">{formatCurrency(stockData.week52Low)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">P/E Ratio</small>
                    <span className="fw-medium">{stockData.peRatio.toFixed(2)}</span>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex flex-column">
                    <small className="text-secondary">Market Cap</small>
                    <span className="fw-medium">{formatCurrency(stockData.marketCap).replace(/\.00$/, '')}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-end">
                <small className="text-secondary">
                  <Clock size={12} className="me-1" /> Last updated: {formatDate(stockData.latestUpdate)}
                </small>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5 p-4 bg-light rounded-4 shadow-sm">
          <BarChart2 size={36} className="mb-3 text-primary" />
          <p className="text-dark fw-medium">Enter a stock symbol to get market data</p>
          <p className="small text-secondary">Examples: AAPL (Apple), MSFT (Microsoft), GOOGL (Alphabet)</p>
        </div>
      )}
    </div>
  );
};

export default StockMarket;