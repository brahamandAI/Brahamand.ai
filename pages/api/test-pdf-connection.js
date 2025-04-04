import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log environment info
    console.log('Testing PDF analysis connection');
    console.log('Environment:', process.env.NODE_ENV);
    
    // Check OpenAI API key availability (without exposing it)
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API key available:', !!apiKey);
    
    // Test OpenAI API connection with a simple query
    if (apiKey) {
      try {
        // Make a simple API call to OpenAI
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-3.5-turbo", // Using a less expensive model for the test
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: 'Hello, this is a test message. Reply with "PDF Analysis Connection Successful."' }
            ],
            temperature: 0.3,
            max_tokens: 50,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            }
          }
        );
        
        // Check if the response was successful
        if (response.data && 
            response.data.choices && 
            response.data.choices.length > 0 && 
            response.data.choices[0].message) {
          
          console.log('OpenAI API connection test successful');
          return res.status(200).json({ 
            status: 'success',
            message: 'PDF analysis connection is working properly',
            openai_response: response.data.choices[0].message.content,
            timestamp: new Date().toISOString()
          });
        } else {
          console.error('Unexpected response structure from OpenAI:', response.data);
          return res.status(500).json({ 
            status: 'error',
            message: 'Received an unexpected response structure from OpenAI',
            details: JSON.stringify(response.data)
          });
        }
      } catch (error) {
        console.error('Error in OpenAI API connection test:', error.response?.data || error.message);
        return res.status(500).json({ 
          status: 'error',
          message: 'Failed to connect to OpenAI API',
          error: error.response?.data?.error || error.message
        });
      }
    } else {
      return res.status(500).json({ 
        status: 'error',
        message: 'OpenAI API key is not configured',
        environment: process.env.NODE_ENV
      });
    }
  } catch (error) {
    console.error('Unexpected error in test endpoint:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'An unexpected error occurred',
      error: error.message 
    });
  }
} 