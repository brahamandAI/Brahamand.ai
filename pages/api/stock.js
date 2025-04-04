export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ message: 'Stock symbol is required' });
  }

  try {
    // Use Alpha Vantage API key from environment variables
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ message: 'Alpha Vantage API key is not configured' });
    }
    
    // Fetch from Alpha Vantage instead of IEX Cloud
    const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got a valid response with data
    if (data?.['Error Message']) {
      return res.status(404).json({ message: `Stock symbol '${symbol}' not found` });
    }
    
    if (!data?.['Global Quote'] || Object.keys(data?.['Global Quote'] || {}).length === 0) {
      return res.status(404).json({ message: `No data found for stock symbol '${symbol}'` });
    }

    const quote = data['Global Quote'];
    
    // Transform Alpha Vantage data to match our expected format
    const stockData = {
      symbol: quote['01. symbol'],
      companyName: symbol, // Alpha Vantage doesn't provide company name in this endpoint
      latestPrice: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')) / 100,
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      previousClose: parseFloat(quote['08. previous close']),
      volume: parseInt(quote['06. volume']),
      latestUpdate: new Date().toISOString(),
    };

    return res.status(200).json(stockData);
  } catch (error) {
    console.error('Stock API error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch stock data', 
      error: error.message 
    });
  }
} 