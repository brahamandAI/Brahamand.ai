import { isNewsRelatedQuery, extractNewsCategory, formatNewsForResponse } from './homeHelpers';

/**
 * Middleware to handle news-related queries in chat
 * @param {string} query - The user's query text
 * @param {Function} setMessages - Function to update chat messages
 * @param {boolean} loading - Loading state
 * @param {Function} setLoading - Function to set loading state
 * @returns {Promise<boolean>} True if the query was handled as news, false otherwise
 */
export async function handleNewsQuery(query, setMessages, loading, setLoading) {
  // Check if this is a news-related query
  if (!isNewsRelatedQuery(query)) {
    return false; // Not a news query, continue with normal processing
  }
  
  // Show loading indicator for news search with more engaging animation
  const loadingMessages = [
    'Searching for news...',
    'Scanning latest headlines...',
    'Finding relevant articles...',
    'Preparing your updates...'
  ];
  
  for (let i = 0; i < loadingMessages.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessage = { ...newMessages[newMessages.length - 1] };
      lastMessage.response.content = `<span style='color: #3182ce; font-weight: 500;'>${loadingMessages[i]}</span>`;
      return [...newMessages.slice(0, -1), lastMessage];
    });
  }

  try {
    // Extract relevant news category
    const category = extractNewsCategory(query);
    
    // Capitalize first letter of category for display
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Fetch news for that category
    const response = await fetch(`/api/news?category=${category}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news data');
    }
    
    const data = await response.json();
    
    // Format news articles as nicely formatted HTML
    const newsContent = formatNewsForResponse(data.articles);
    
    // Display formatted news
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessage = { ...newMessages[newMessages.length - 1] };
      lastMessage.response.content = `
        <div class="news-response" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <p style="font-size: 14px; margin-bottom: 12px; color: #4a5568;">Here are the latest <span style="font-weight: 600; color: #3182ce;">${formattedCategory}</span> news articles I found for you:</p>
          ${newsContent}
        </div>
      `;
      return [...newMessages.slice(0, -1), lastMessage];
    });
    
    setLoading(false);
    return true; // News was handled
  } catch (error) {
    console.error('Error processing news query:', error);
    
    // Show error message
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessage = { ...newMessages[newMessages.length - 1] };
      lastMessage.response.content = `
        <div class="news-response" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <p style="font-size: 14px; color: #e53e3e; margin-bottom: 10px;">I'm sorry, I couldn't retrieve the latest news at the moment.</p>
          <p style="font-size: 14px; color: #4a5568;">You can visit our <a href="/news-updates" style="color: #3182ce; font-weight: 500; text-decoration: none;">News section</a> directly to browse the most recent updates.</p>
        </div>
      `;
      return [...newMessages.slice(0, -1), lastMessage];
    });
    
    setLoading(false);
    return true; // We still handled it, even with an error
  }
} 