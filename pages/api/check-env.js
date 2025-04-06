export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables without exposing sensitive values
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      // Show first and last 2 characters of API key for verification
      // but keep the middle part hidden for security
      OPENAI_API_KEY_HINT: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 2)}` : 
        'not found',
      ENV_LOADED: true
    };

    console.log('Environment check:', envCheck);
    
    return res.status(200).json({
      status: 'success',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while checking environment variables',
      error: error.message 
    });
  }
} 