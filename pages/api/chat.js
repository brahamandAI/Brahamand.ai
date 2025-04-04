// API route for chat completion
import { generateChatCompletion } from '../../lib/openaiService';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, system = "", history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Received chat request:', message);
    
    // Check if this is a PDF summary request - handle it specially
    const isPDFSummary = message.startsWith("Please provide a comprehensive summary of this document:");
    
    if (isPDFSummary) {
      console.log('Processing PDF summary request with direct OpenAI API call');
      
      // Use the API key directly from environment variables for PDF requests
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }
      
      try {
        // Prepare messages for the API call
        const messages = [];
        
        // Add a system message if provided
        if (system) {
          messages.push({ role: 'system', content: system });
        } else {
          // Default system message specifically for PDF analysis
          messages.push({ 
            role: 'system', 
            content: `You are an expert document analyst specializing in creating detailed, structured summaries. 
            When summarizing documents: 
            1) Identify and highlight the main topics and key points
            2) Organize information into clear sections with headers where appropriate
            3) Extract important facts, figures, and conclusions
            4) Maintain the original document's core meaning and intent
            5) Format your summary with bullet points for key information
            6) Include a brief overview at the beginning
            
            Be thorough but concise. Use markdown formatting for headers and sections.`
          });
        }
        
        // Add the user's message
        messages.push({ role: 'user', content: message });
        
        console.log('Making direct OpenAI API call for PDF summary');
        
        // Make the direct API call to OpenAI
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-4o", // Using the most accurate model
            messages: messages,
            temperature: 0.2, // Lower temperature for more factual summaries
            max_tokens: 2000,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            }
          }
        );
        
        // Extract the response text
        if (response.data && 
            response.data.choices && 
            response.data.choices.length > 0 && 
            response.data.choices[0].message) {
          
          console.log('OpenAI API returned successful PDF summary response');
          return res.status(200).json({ 
            response: response.data.choices[0].message.content,
            source: 'openai-direct'
          });
        } else {
          console.error('Unexpected response structure from OpenAI:', response.data);
          return res.status(500).json({ error: 'Failed to generate PDF summary' });
        }
      } catch (error) {
        console.error('Error in direct OpenAI API call for PDF:', error.response?.data || error.message);
        return res.status(500).json({ 
          error: 'Failed to generate PDF summary',
          details: error.message 
        });
      }
    } else {
      // For regular non-PDF requests, use the standard service
      try {
        const response = await generateChatCompletion(message, history, system);
        
        // Return the response
        return res.status(200).json({ response });
      } catch (error) {
        console.error('Error in chat completion:', error);
        return res.status(500).json({ 
          error: 'Failed to generate response',
          details: error.message,
          apiKeyConfigured: !!process.env.OPENAI_API_KEY
        });
      }
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
} 