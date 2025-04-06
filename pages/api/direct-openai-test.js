import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from query parameter
    const apiKey = req.query.key || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'No API key provided', 
        message: 'Please provide an API key as a query parameter or set it in .env.local' 
      });
    }

    // Test the API key directly with OpenAI
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say "API key is working correctly!"' }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return res.status(200).json({
        success: true,
        message: 'API key is valid',
        response: response.data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'API key is invalid or OpenAI API request failed',
        error: error.response?.data || error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
} 