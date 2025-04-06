export default async function handler(req, res) {
  // Support both GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract parameters from query or body based on request method
  const params = req.method === 'GET' ? req.query : req.body;
  const { category = 'general', query = null } = params;

  try {
    // Use the API key from .env file
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ message: 'News API key is not configured' });
    }
    
    // Build the URL based on whether a specific query was provided
    let apiUrl;
    if (query) {
      // If query is provided, use everything search endpoint with date parameters
      // Calculate today and 2 days ago for fresh news
      const today = new Date();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(today.getDate() - 2);
      
      // Format dates as YYYY-MM-DD
      const fromDate = twoDaysAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];
      
      apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&to=${toDate}&sortBy=publishedAt&apiKey=${API_KEY}`;
    } else {
      // Otherwise use top headlines for the specified category
      apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;
    }
    
    // Direct news API may have CORS issues, consider using a proxy service in production
    const response = await fetch(apiUrl);

    // Handle common error status codes
    if (response.status === 401) {
      return res.status(500).json({ 
        message: 'News API authorization failed. Please check the API key.', 
        error: 'Invalid API key'
      });
    }

    if (response.status === 429) {
      return res.status(500).json({ 
        message: 'News API rate limit exceeded. Please try again later.', 
        error: 'Rate limit exceeded'
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status} - ${data.message || 'Unknown error'}`);
    }

    if (data.status !== 'ok') {
      throw new Error(`News API returned an error: ${data.message || 'Unknown error'}`);
    }

    // Some dummy data for testing if API is not working
    const fallbackData = {
      articles: [
        {
          title: "Sample News Article 1",
          description: "This is a fallback news article for testing when the API is unavailable.",
          url: "https://example.com/news/1",
          urlToImage: "https://via.placeholder.com/300x200?text=News+Image",
          publishedAt: new Date().toISOString(),
          source: { name: "Sample News" }
        },
        {
          title: "Sample News Article 2",
          description: "Another fallback news article for testing when the API is unavailable.",
          url: "https://example.com/news/2",
          urlToImage: "https://via.placeholder.com/300x200?text=News+Image",
          publishedAt: new Date().toISOString(),
          source: { name: "Sample News" }
        }
      ],
      totalResults: 2
    };

    // Use the API data if available, otherwise use fallback data
    const responseData = {
      articles: data.articles || fallbackData.articles,
      totalResults: data.totalResults || fallbackData.totalResults,
      searchQuery: query,
      category: category
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('News API error:', error);
    
    // Return fallback data in case of error
    return res.status(200).json({ 
      articles: [
        {
          title: "Sample News Article (Fallback)",
          description: "This is a fallback news article shown when the API encounters an error.",
          url: "https://example.com/news",
          urlToImage: "https://via.placeholder.com/300x200?text=News+Unavailable",
          publishedAt: new Date().toISOString(),
          source: { name: "Sample News" }
        }
      ],
      totalResults: 1,
      isPlaceholder: true,
      error: error.message
    });
  }
} 